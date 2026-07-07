"""
RAG SOP Assistant — Phase 6: AI Models & RAG Assistants
=========================================================
Chatbot trả lời câu hỏi dựa trên tài liệu SOP nội bộ.
- Retrieval: FAISS + sentence-transformers (all-MiniLM-L6-v2) — local, no cloud
- Generation: Gemini 1.5 Flash API (grounded từ retrieved context)
- Fallback: Template-based nếu Gemini API không khả dụng
- Guardrail: cosine similarity ≥ 0.35 để tránh hallucination
"""

import re
import os
import json
from pathlib import Path
from dataclasses import dataclass
from typing import Optional
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")
GEMINI_API_KEY        = os.getenv("GEMINI_API_KEY", "")
CF_ACCOUNT_ID         = os.getenv("CLOUDFLARE_ACCOUNT_ID", "")
CF_API_TOKEN          = os.getenv("CLOUDFLARE_API_TOKEN", "")
# Model mặc định — có thể đổi thành mistral-7b, gemma-7b, phi-2...
CF_MODEL              = os.getenv("CLOUDFLARE_MODEL", "@cf/meta/llama-3.1-8b-instruct")

# --------------------------------------------------------------------------
# Attempt to import ML deps — graceful fallback nếu chưa cài
# --------------------------------------------------------------------------
try:
    import numpy as np
    import faiss
    from sentence_transformers import SentenceTransformer
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False
    np = None

# Cloudflare Workers AI — primary LLM provider (rẻ, free tier 10k neurons/day)
CLOUDFLARE_AVAILABLE = bool(CF_ACCOUNT_ID and CF_API_TOKEN)
if CLOUDFLARE_AVAILABLE:
    print(f"[RAG] ✅ Cloudflare Workers AI configured (model: {CF_MODEL})")

# Gemini SDK (google-genai — fallback nếu không có Cloudflare)
_gemini_client = None
try:
    from google import genai as _genai_module
    from google.genai import types as _genai_types
    if GEMINI_API_KEY:
        _gemini_client = _genai_module.Client(api_key=GEMINI_API_KEY)
        GEMINI_AVAILABLE = True
        print(f"[RAG] ✅ Gemini 1.5 Flash (google.genai) configured (key ...{GEMINI_API_KEY[-6:]})")
    else:
        GEMINI_AVAILABLE = False
except ImportError:
    GEMINI_AVAILABLE = False
    _genai_types = None


DOCS_DIR      = Path(__file__).parent.parent / "docs"
INDEX_PATH    = Path(__file__).parent / "model" / "rag_faiss.index"
CHUNKS_PATH   = Path(__file__).parent / "model" / "rag_chunks.json"
# Multilingual model — hỗ trợ 50+ ngôn ngữ gồm tiếng Việt (~470MB, CPU OK)
# Thay thế all-MiniLM-L6-v2 (English-only) để tăng recall với query tiếng Việt
EMBED_MODEL   = "paraphrase-multilingual-MiniLM-L12-v2"

# Guardrail threshold (Doc 129B §3.3)
# Multilingual model cosine scores thường cao hơn (~0.65-0.80) cho query khớp ngôn ngữ
MIN_RELEVANCE_THRESHOLD = 0.30
GROUNDEDNESS_THRESHOLD  = 0.50



# --------------------------------------------------------------------------
# Document chunker
# --------------------------------------------------------------------------
@dataclass
class DocChunk:
    chunk_id: str
    source_file: str
    section: str
    text: str

def _load_and_chunk_docs(docs_dir: Path, chunk_size: int = 400, overlap: int = 80) -> list[DocChunk]:
    """
    Đọc tất cả file .md trong docs/, chunk theo từng đoạn văn.
    """
    chunks: list[DocChunk] = []

    # Ưu tiên docs liên quan đến quy trình vận hành
    priority_patterns = [
        "PACK04", "PACK05", "PACK06", "PACK07",
        "68_", "69_", "70_", "71_", "72_", "73_",
        "83_", "84_", "85_", "86_", "87_",
        "90_", "91_", "92_", "93_", "94_",
    ]

    md_files = list(docs_dir.glob("*.md"))
    # Sắp xếp: ưu tiên docs SOP
    def priority_key(p: Path) -> int:
        for i, pat in enumerate(priority_patterns):
            if pat in p.name:
                return i
        return 100

    md_files.sort(key=priority_key)

    # Giới hạn 40 file để tránh quá tải RAM lúc embed
    md_files = md_files[:40]

    chunk_idx = 0
    for md_path in md_files:
        try:
            text = md_path.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue

        # Tách section theo ## heading
        sections = re.split(r'\n(?=#{1,3} )', text)
        for sec in sections:
            lines = sec.strip().split("\n")
            if not lines:
                continue
            section_title = lines[0].replace("#", "").strip()
            section_body  = "\n".join(lines[1:]).strip()

            # Skip sections quá ngắn hoặc code block thuần
            if len(section_body) < 80:
                continue
            if section_body.count("```") >= 4:
                continue

            # Chunk theo sliding window
            words = section_body.split()
            if not words:
                continue

            for start in range(0, len(words), chunk_size - overlap):
                chunk_words = words[start : start + chunk_size]
                chunk_text  = " ".join(chunk_words)
                if len(chunk_text) < 60:
                    continue

                chunks.append(DocChunk(
                    chunk_id=f"{md_path.stem}_s{chunk_idx}",
                    source_file=md_path.name,
                    section=section_title[:80],
                    text=chunk_text,
                ))
                chunk_idx += 1

    return chunks


# --------------------------------------------------------------------------
# FAISS index builder
# --------------------------------------------------------------------------
_embed_model_cache = None
# Cache dictionaries mapping tenant_id (or 'global') to (index, chunks)
_tenant_indices_cache = {}

def _get_embed_model():
    global _embed_model_cache
    if _embed_model_cache is None and ML_AVAILABLE:
        print("[RAG] Đang tải sentence-transformers model...")
        _embed_model_cache = SentenceTransformer(EMBED_MODEL)
        print("[RAG] ✅ Model loaded.")
    return _embed_model_cache

def _build_or_load_index(tenant_id: Optional[str] = None) -> tuple:
    """Tải FAISS index của Tenant từ disk nếu có, ngược lại build mới từ thư mục Tenant hoặc fallback."""
    global _tenant_indices_cache

    cache_key = tenant_id if tenant_id else 'global'
    if cache_key in _tenant_indices_cache:
        return _tenant_indices_cache[cache_key]

    if not ML_AVAILABLE:
        return None, []

    # Định nghĩa đường dẫn dựa trên tenant_id
    if tenant_id:
        tenant_model_dir = Path(__file__).parent / "model" / tenant_id
        tenant_docs_dir = Path(__file__).parent.parent / "docs" / tenant_id
        index_path = tenant_model_dir / "rag_faiss.index"
        chunks_path = tenant_model_dir / "rag_chunks.json"
    else:
        tenant_docs_dir = DOCS_DIR
        index_path = INDEX_PATH
        chunks_path = CHUNKS_PATH

    index_path.parent.mkdir(parents=True, exist_ok=True)

    # 1. Tải từ disk nếu đã build
    if index_path.exists() and chunks_path.exists():
        print(f"[RAG] Tải FAISS index từ disk cho tenant={cache_key}...")
        try:
            index = faiss.read_index(str(index_path))
            with open(chunks_path, "r", encoding="utf-8") as f:
                chunks_data = json.load(f)
            chunks = [DocChunk(**c) for c in chunks_data]
            _tenant_indices_cache[cache_key] = (index, chunks)
            print(f"[RAG] ✅ Loaded {len(chunks)} chunks cho tenant={cache_key}.")
            return index, chunks
        except Exception as e:
            print(f"[RAG] Lỗi load index của tenant={cache_key} từ disk: {e}")

    # 2. Build mới từ thư mục docs tương ứng
    print(f"[RAG] Building FAISS index cho tenant={cache_key} từ {tenant_docs_dir}...")
    if tenant_id and not tenant_docs_dir.exists():
        # Nếu thư mục docs của tenant chưa có, thử fallback sang global docs làm mặc định
        print(f"[RAG] Thư mục tenant={cache_key} trống, fallback sang global docs...")
        tenant_docs_dir = DOCS_DIR

    chunks = _load_and_chunk_docs(tenant_docs_dir)
    if not chunks:
        print(f"[RAG] ⚠️ Không tìm thấy docs để index cho tenant={cache_key}.")
        # Nếu không có docs nào, fallback dùng index global
        if tenant_id:
            print(f"[RAG] Fallback sang global index cho tenant={cache_key}...")
            return _build_or_load_index(None)
        return None, []

    embed_model = _get_embed_model()
    texts = [c.text for c in chunks]
    embeddings = embed_model.encode(texts, show_progress_bar=False, batch_size=32)
    embeddings = embeddings.astype("float32")
    faiss.normalize_L2(embeddings)

    dim   = embeddings.shape[1]
    index = faiss.IndexFlatIP(dim)
    index.add(embeddings)

    try:
        faiss.write_index(index, str(index_path))
        with open(chunks_path, "w", encoding="utf-8") as f:
            json.dump([vars(c) for c in chunks], f, ensure_ascii=False, indent=2)
        print(f"[RAG] ✅ Index xây xong và lưu cho tenant={cache_key} với {len(chunks)} chunks.")
    except Exception as e:
        print(f"[RAG] Lỗi lưu index của tenant={cache_key}: {e}")

    _tenant_indices_cache[cache_key] = (index, chunks)
    return index, chunks


# --------------------------------------------------------------------------
# Answer generation từ retrieved context
# --------------------------------------------------------------------------
def _extract_key_sentences(context_text: str, query: str, max_sentences: int = 5) -> list[str]:
    """
    Trích xuất câu quan trọng nhất từ context.
    Simple heuristic: ưu tiên câu chứa từ khóa từ query.
    """
    query_words = set(query.lower().split())
    sentences   = re.split(r'[.!?;]\s+', context_text)
    
    scored = []
    for s in sentences:
        s = s.strip()
        if len(s) < 30:
            continue
        s_words  = set(s.lower().split())
        overlap  = len(query_words & s_words)
        score    = overlap / max(len(query_words), 1)
        scored.append((score, s))
    
    scored.sort(reverse=True)
    return [s for _, s in scored[:max_sentences] if _]


def _generate_answer_cloudflare(query: str, retrieved: list[tuple]) -> Optional[str]:
    """
    Gọi Cloudflare Workers AI — LLM inference rẻ, edge network, free tier.
    https://developers.cloudflare.com/workers-ai/models/
    """
    import httpx

    context_text = "\n\n---\n\n".join(
        f"[Nguồn: {chunk.source_file} | Mục: {chunk.section}]\n{chunk.text}"
        for chunk, _ in retrieved
    )

    system_prompt = (
        "Bạn là trợ lý AI nội bộ của hệ thống Nextflow OS, chuyên hỗ trợ nhân viên vận hành "
        "tra cứu quy trình SOP. \n"
        "NGuyÊN TẮc BẮt BUỘC:\n"
        "1. Chỉ trả lời dựa trên TÀI LIỆU NỘI BỘ được cung cấp.\n"
        "2. KHÔNG bịa đặt thông tin không có trong tài liệu.\n"
        "3. Nếu không đủ thông tin, nói rõ: 'Tài liệu SOP nội bộ chưa đề cập.'\n"
        "4. Trả lời bằng tiếng Việt, ngắn gọn, có cấu trúc."
    )

    user_message = f"TÀI LIỆU SOP:\n{context_text}\n\nCÂU HỎi:\n{query}"

    url = (
        f"https://api.cloudflare.com/client/v4/accounts/{CF_ACCOUNT_ID}"
        f"/ai/run/{CF_MODEL}"
    )

    try:
        resp = httpx.post(
            url,
            headers={"Authorization": f"Bearer {CF_API_TOKEN}"},
            json={
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user",   "content": user_message},
                ],
                "max_tokens": 800,
                "temperature": 0.1,
            },
            timeout=30.0,
        )
        resp.raise_for_status()
        data = resp.json()
        # Cloudflare trả về: {"result": {"response": "..."}, "success": true}
        if data.get("success") and data.get("result"):
            text = data["result"].get("response", "").strip()
            if text:
                return text
        print(f"[RAG] Cloudflare unexpected response: {data}")
        return None
    except Exception as e:
        print(f"[RAG] Cloudflare AI error: {e} — falling back to next provider")
        return None


def _generate_answer_gemini(query: str, retrieved: list[tuple]) -> Optional[str]:
    """
    Gọi Gemini 1.5 Flash để sinh câu trả lời từ context đã retrieve.
    Context được inject vào prompt để đảm bảo grounding.
    """
    context_text = "\n\n---\n\n".join(
        f"[Nguồn: {chunk.source_file} | Mục: {chunk.section}]\n{chunk.text}"
        for chunk, _ in retrieved
    )

    prompt = f"""Bạn là trợ lý AI nội bộ của hệ thống Nextflow OS, chuyên hỗ trợ nhân viên vận hành tra cứu quy trình SOP.

NGUYÊN TẮC BẮT BUỘC:
1. Chỉ trả lời dựa trên TÀI LIỆU NỘI BỘ được cung cấp bên dưới.
2. KHÔNG bịa đặt thông tin không có trong tài liệu.
3. Nếu tài liệu không đủ để trả lời, hãy nói rõ "Tài liệu SOP nội bộ chưa đề cập chi tiết về vấn đề này."
4. Trả lời bằng tiếng Việt, ngắn gọn, có cấu trúc rõ ràng.
5. Trích dẫn tên tài liệu nguồn khi có thể.

TÀI LIỆU SOP NỘI BỘ:
{context_text}

CÂU HỎI CỦA NHÂN VIÊN:
{query}

TRẢ LỜI:"""

    try:
        response = _gemini_client.models.generate_content(
            model="gemini-1.5-flash",
            contents=prompt,
            config=_genai_types.GenerateContentConfig(
                temperature=0.1,       # thấp để đảm bảo factual, giảm hallucination
                max_output_tokens=800,
                top_p=0.8,
            ),
        )
        return response.text.strip()
    except Exception as e:
        print(f"[RAG] Gemini API error: {e} — falling back to local template")
        return None


def _generate_answer(query: str, retrieved: list[tuple]) -> dict:
    """
    Sinh câu trả lời có trích dẫn nguồn.
    Priority: Cloudflare Workers AI → Gemini 1.5 Flash → Local Template
    """
    if not retrieved:
        return {
            "answer": "Tôi không tìm thấy thông tin liên quan trong tài liệu SOP nội bộ. Vui lòng liên hệ supervisor hoặc kiểm tra tài liệu thủ công.",
            "grounded": False,
            "groundedness_score": 0.0,
            "citations": [],
            "warning": "Không đủ context liên quan.",
            "mode": "NO_CONTEXT",
        }

    # Build citations
    citations = []
    seen_files = set()
    for chunk, sim_score in retrieved:
        if chunk.source_file not in seen_files:
            citations.append({
                "source_file": chunk.source_file,
                "section": chunk.section,
                "relevance_score": round(float(sim_score), 3),
            })
            seen_files.add(chunk.source_file)

    # Groundedness score = average cosine sim
    avg_sim = sum(s for _, s in retrieved) / len(retrieved)
    grounded = avg_sim >= GROUNDEDNESS_THRESHOLD

    # --- Generation priority chain ---
    answer = None
    answer_mode = "TEMPLATE_FALLBACK"

    # 1️⃣ Cloudflare Workers AI (primary — rẻ nhất)
    if CLOUDFLARE_AVAILABLE and answer is None:
        answer = _generate_answer_cloudflare(query, retrieved)
        if answer:
            answer_mode = f"CLOUDFLARE_AI ({CF_MODEL.split('/')[-1]})"

    # 2️⃣ Gemini 1.5 Flash (secondary)
    if GEMINI_AVAILABLE and _gemini_client and answer is None:
        answer = _generate_answer_gemini(query, retrieved)
        if answer:
            answer_mode = "GEMINI_1.5_FLASH"

    # 3️⃣ Local template fallback (luôn hoạt động, không cần internet)
    if answer is None:
        answer = _template_answer(query, retrieved, citations)
        answer_mode = "FAISS_LOCAL"

    return {
        "answer": answer,
        "grounded": grounded,
        "groundedness_score": round(float(avg_sim), 4),
        "citations": citations[:5],
        "warning": None if grounded else "Độ tin cậy trung bình. Vui lòng xác minh lại với tài liệu gốc.",
        "mode": answer_mode,
    }


def _template_answer(query: str, retrieved: list[tuple], citations: list[dict]) -> str:
    """Fallback template-based answer khi Gemini không khả dụng."""
    key_sentences = _extract_key_sentences(
        "\n\n".join(c.text for c, _ in retrieved), query
    )
    if key_sentences:
        body = " ".join(key_sentences[:3])
        if len(body) < 100:
            body = retrieved[0][0].text[:400] + "..."
    else:
        body = retrieved[0][0].text[:400] + "..."

    source_names = ", ".join(c["source_file"] for c in citations[:3])
    return (
        f"Dựa trên tài liệu SOP nội bộ Nextflow OS:\n\n"
        f"{body}\n\n"
        f"📄 Nguồn tham khảo: {source_names}"
    )



# --------------------------------------------------------------------------
# Public API
# --------------------------------------------------------------------------
def query_rag(question: str, top_k: int = 5, tenant_id: Optional[str] = None) -> dict:
    """
    RAG Query: tìm kiếm SOP docs và tạo câu trả lời có grounding.
    """
    if not ML_AVAILABLE:
        return {
            "question": question,
            "answer": "Tính năng RAG Assistant yêu cầu cài đặt: pip install faiss-cpu sentence-transformers",
            "grounded": False,
            "groundedness_score": 0.0,
            "citations": [],
            "mode": "UNAVAILABLE",
        }

    index, chunks = _build_or_load_index(tenant_id)

    if index is None or not chunks:
        return {
            "question": question,
            "answer": "Chưa có tài liệu SOP nào được index. Vui lòng liên hệ quản trị viên.",
            "grounded": False,
            "groundedness_score": 0.0,
            "citations": [],
            "mode": "NO_DOCS",
        }

    # Encode query
    embed_model = _get_embed_model()
    q_vec = embed_model.encode([question], show_progress_bar=False).astype("float32")
    faiss.normalize_L2(q_vec)

    # Retrieve top-k chunks
    distances, indices = index.search(q_vec, top_k)

    retrieved = []
    for dist, idx in zip(distances[0], indices[0]):
        if idx < 0 or idx >= len(chunks):
            continue
        sim_score = float(dist)    # normalized → inner product = cosine sim

        # Guardrail: chỉ dùng chunk đủ relevant (Doc 124 §4.4)
        if sim_score < MIN_RELEVANCE_THRESHOLD:
            continue
        retrieved.append((chunks[idx], sim_score))

    result = _generate_answer(question, retrieved)
    result["question"] = question
    result["retrieved_chunks_count"] = len(retrieved)
    # mode đã được set đúng bởi _generate_answer: CLOUDFLARE_AI / GEMINI_1.5_FLASH / FAISS_LOCAL

    # Log cho governance/observability (Doc 123 §2.6)
    print(
        f"[RAG] Query='{question[:60]}' | Chunks={len(retrieved)} | "
        f"Mode={result.get('mode','?')} | Grounded={result['grounded']} | Score={result['groundedness_score']}"
    )

    return result


def build_index_if_needed():
    """Gọi khi khởi động service để pre-build FAISS index."""
    if ML_AVAILABLE:
        _build_or_load_index()

def reindex_tenant(tenant_id: str, documents: list[dict]) -> dict:
    """
    Nhận danh sách tài liệu SOP của Tenant gửi từ Backend, chunking,
    tạo embeddings và build FAISS index mới, lưu đè lên disk.
    """
    global _tenant_indices_cache

    if not ML_AVAILABLE:
        return {"status": "error", "message": "ML dependencies unavailable"}

    cache_key = tenant_id
    tenant_model_dir = Path(__file__).parent / "model" / tenant_id
    index_path = tenant_model_dir / "rag_faiss.index"
    chunks_path = tenant_model_dir / "rag_chunks.json"

    index_path.parent.mkdir(parents=True, exist_ok=True)

    # 1. Chuyển đổi list documents thành DocChunks
    chunks = []
    chunk_idx = 0
    for doc in documents:
        title = doc.get("title", "Untitled")
        content = doc.get("content", "").strip()
        doc_id = doc.get("id", f"doc_{chunk_idx}")
        
        if len(content) < 40:
            continue

        # Split section theo ## heading
        sections = re.split(r'\n(?=#{1,3} )', content)
        for sec in sections:
            lines = sec.strip().split("\n")
            if not lines:
                continue
            section_title = lines[0].replace("#", "").strip()
            section_body = "\n".join(lines[1:]).strip()

            if len(section_body) < 40:
                section_body = sec.strip()
                section_title = title

            # Chunk theo sliding window
            words = section_body.split()
            chunk_size = 400
            overlap = 80
            for start in range(0, len(words), chunk_size - overlap):
                chunk_words = words[start : start + chunk_size]
                chunk_text = " ".join(chunk_words)
                if len(chunk_text) < 40:
                    continue

                chunks.append(DocChunk(
                    chunk_id=f"{doc_id}_s{chunk_idx}",
                    source_file=title,
                    section=section_title[:80],
                    text=chunk_text
                ))
                chunk_idx += 1

    if not chunks:
        return {"status": "success", "message": "Không có tài liệu nào đủ dài để index.", "chunks_count": 0}

    # 2. Sinh embeddings & Build FAISS index
    embed_model = _get_embed_model()
    texts = [c.text for c in chunks]
    embeddings = embed_model.encode(texts, show_progress_bar=False, batch_size=32)
    embeddings = embeddings.astype("float32")
    faiss.normalize_L2(embeddings)

    dim = embeddings.shape[1]
    index = faiss.IndexFlatIP(dim)
    index.add(embeddings)

    # 3. Lưu xuống disk và update cache in-memory
    faiss.write_index(index, str(index_path))
    with open(chunks_path, "w", encoding="utf-8") as f:
        json.dump([vars(c) for c in chunks], f, ensure_ascii=False, indent=2)

    _tenant_indices_cache[cache_key] = (index, chunks)
    print(f"[RAG] Reindexed tenant={tenant_id} với {len(chunks)} chunks thành công.")

    return {
        "status": "success",
        "message": f"Đã xây dựng lại chỉ mục tri thức thành công với {len(chunks)} phân đoạn.",
        "chunks_count": len(chunks)
    }
