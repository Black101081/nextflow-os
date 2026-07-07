import os
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"

from rag_assistant import query_rag, build_index_if_needed

build_index_if_needed()

# Test với các câu hỏi sát nội dung docs hơn
questions = [
    "SLA là gì?",
    "Nextflow OS là gì và mục tiêu của hệ thống?",
    "Operator có nhiệm vụ gì trong hệ thống?",
    "Work item là gì?",
]

for q in questions:
    result = query_rag(q, top_k=5)
    print(f"\n📝 {q}")
    print(f"   Mode: {result['mode']} | Score: {result['groundedness_score']}")
    # In 200 ký tự đầu của answer
    answer_preview = result['answer'][:200].replace('\n', ' ')
    print(f"   → {answer_preview}")
