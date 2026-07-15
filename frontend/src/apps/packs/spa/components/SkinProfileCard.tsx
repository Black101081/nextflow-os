import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiService } from "../../../../shared/services/api";
import { Sparkles, FileText, Plus, RefreshCw, Check, ShieldAlert, Heart, Activity } from "lucide-react";

interface SkinProfile {
  id: string;
  customer_id: string;
  skin_type: string | null;
  issues: string[];
  current_treatment: string | null;
  history: Array<{
    date: string;
    note: string;
    treatment: string;
    therapist: string;
  }>;
  photos: string[] | null;
}

export default function SkinProfileCard() {
  const [profile, setProfile] = useState<SkinProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [customerId, setCustomerId] = useState("8e8f7c53-214c-446e-a1bd-1b6dd27a7444"); // Seed customer
  const [searchId, setSearchId] = useState("8e8f7c53-214c-446e-a1bd-1b6dd27a7444");
  const [error, setError] = useState<string | null>(null);

  // Edit Mode Form State
  const [isEditing, setIsEditing] = useState(false);
  const [skinType, setSkinType] = useState("Oily");
  const [selectedIssues, setSelectedIssues] = useState<string[]>(["Mụn viêm", "Thâm đỏ"]);
  const [currentTreatment, setCurrentTreatment] = useState("Liệu trình điều trị mụn Acne Clear");
  const [newNote, setNewNote] = useState("");
  const [saving, setSaving] = useState(false);

  const availableIssues = ["Mụn viêm", "Thâm đỏ", "Tàn nhang", "Sẹo rỗ", "Khô rát", "Lão hóa sớm"];

  const fetchProfile = async (targetId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.get(`/api/v1/spa/skin-profiles/${targetId}`);
      if (res.data) {
        const p = res.data;
        const parsedIssues = typeof p.issues === "string" ? JSON.parse(p.issues) : Array.isArray(p.issues) ? p.issues : [];
        const parsedHistory = typeof p.history === "string" ? JSON.parse(p.history) : Array.isArray(p.history) ? p.history : [];
        const processed = { ...p, issues: parsedIssues, history: parsedHistory };
        setProfile(processed);
        setSkinType(processed.skin_type || "Oily");
        setSelectedIssues(processed.issues || []);
        setCurrentTreatment(processed.current_treatment || "");
      } else {
        setProfile(null);
      }
    } catch (err: any) {
      setError(err.message || "Không thể tìm thấy hồ sơ da");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile(searchId);
  }, [searchId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchId(customerId);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatedHistory = profile ? [...(profile.history || [])] : [];
      if (newNote.trim()) {
        updatedHistory.unshift({
          date: new Date().toISOString().split("T")[0],
          note: newNote,
          treatment: currentTreatment || "Điều trị thường quy",
          therapist: "Trần Thị Vân (Dr.)"
        });
      }

      const res = await apiService.post("/api/v1/spa/skin-profiles", {
        customer_id: searchId,
        skin_type: skinType,
        issues: selectedIssues,
        current_treatment: currentTreatment,
        history: updatedHistory
      });

      setProfile(res.data || res.data?.profile);
      setNewNote("");
      setIsEditing(false);
      fetchProfile(searchId);
    } catch (err: any) {
      alert(err.message || "Lỗi lưu hồ sơ da");
    } finally {
      setSaving(false);
    }
  };

  const toggleIssue = (issue: string) => {
    setSelectedIssues(prev => 
      prev.includes(issue) ? prev.filter(i => i !== issue) : [...prev, issue]
    );
  };

  return (
    <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-5 shadow-xl relative overflow-hidden h-full flex flex-col">
      <div className="flex items-center justify-between mb-5 border-b border-[#334155] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Hồ Sơ Da Liễu Khách Hàng</h3>
            <p className="text-xs text-slate-500">Phân loại loại da, bệnh lý và phác đồ điều trị</p>
          </div>
        </div>
      </div>

      {/* Customer search form */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input type="text" value={customerId} onChange={e => setCustomerId(e.target.value)} placeholder="Nhập ID Khách Hàng..."
          className="flex-1 bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-pink-500" required />
        <button type="submit" className="px-4 py-2 bg-[#0f172a] hover:bg-[#1e293b] border border-[#334155] text-pink-400 font-semibold text-xs rounded-lg transition-colors">
          Tra cứu
        </button>
      </form>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-slate-500 text-xs py-8">
          Đang tải thông tin hồ sơ da...
        </div>
      ) : profile ? (
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto pr-1">
          {!isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#0f172a]/60 rounded-xl p-3 border border-[#334155]">
                  <span className="text-[10px] text-slate-500 block font-semibold mb-1">Loại Da</span>
                  <span className="text-xs font-bold text-pink-400 capitalize">{profile.skin_type || "Chưa xác định"}</span>
                </div>
                <div className="bg-[#0f172a]/60 rounded-xl p-3 border border-[#334155]">
                  <span className="text-[10px] text-slate-500 block font-semibold mb-1">Phác đồ Đang Điều Trị</span>
                  <span className="text-xs font-bold text-slate-200 truncate block">{profile.current_treatment || "Chưa có"}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block font-semibold mb-2">Bệnh lý / Vấn đề về da</span>
                <div className="flex flex-wrap gap-1.5">
                  {profile.issues && profile.issues.length > 0 ? (
                    profile.issues.map(i => (
                      <span key={i} className="text-[10px] font-semibold bg-pink-500/10 text-pink-400 border border-pink-500/20 px-2 py-0.5 rounded-full">
                        {i}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-600 italic">Không có bệnh lý nghiêm trọng</span>
                  )}
                </div>
              </div>

              <div className="border-t border-[#334155] pt-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Nhật ký điều trị</span>
                  <button onClick={() => setIsEditing(true)} className="text-[10px] font-semibold text-pink-400 hover:text-pink-300">
                    Cập nhật phác đồ & Ghi chú
                  </button>
                </div>

                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {profile.history && profile.history.length > 0 ? (
                    profile.history.map((h, index) => (
                      <div key={index} className="p-2.5 bg-[#0f172a]/40 rounded-lg border border-[#334155] text-xs">
                        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                          <span className="font-semibold text-slate-400">{h.date}</span>
                          <span>Bác sĩ: {h.therapist}</span>
                        </div>
                        <p className="font-medium text-slate-300 mb-0.5">{h.treatment}</p>
                        <p className="text-[11px] text-slate-500 italic mt-0.5">{h.note}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] text-slate-600 text-center py-4 italic">Chưa có nhật ký buổi điều trị</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1.5 uppercase">Loại Da</label>
                <select value={skinType} onChange={e => setSkinType(e.target.value)}
                  className="w-full bg-[#0f172a] border border-[#334155] rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-pink-500">
                  <option value="Dry">Da khô</option>
                  <option value="Oily">Da dầu</option>
                  <option value="Combination">Da hỗn hợp</option>
                  <option value="Normal">Da thường</option>
                  <option value="Sensitive">Da nhạy cảm</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1.5 uppercase">Bệnh Lý (Chọn nhiều)</label>
                <div className="flex flex-wrap gap-1.5">
                  {availableIssues.map(i => {
                    const active = selectedIssues.includes(i);
                    return (
                      <button key={i} type="button" onClick={() => toggleIssue(i)}
                        className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                          active ? "bg-pink-600 border-pink-500 text-white" : "bg-[#0f172a] border-[#334155] text-slate-400 hover:border-[#475569]"
                        }`}>
                        {i}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1.5 uppercase">Phác đồ Đang Điều Trị</label>
                <input type="text" value={currentTreatment} onChange={e => setCurrentTreatment(e.target.value)}
                  className="w-full bg-[#0f172a] border border-[#334155] rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-pink-500" required />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1.5 uppercase">Nhật Ký/Ghi Chú Buổi Điều Trị Hôm Nay</label>
                <textarea value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Tình trạng da cải thiện ra sao, sử dụng serum gì..."
                  className="w-full bg-[#0f172a] border border-[#334155] rounded-lg p-2 text-xs text-slate-200 h-16 resize-none focus:outline-none focus:border-pink-500" />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-lg bg-[#0f172a] hover:bg-[#334155] border border-[#334155] text-slate-400 text-xs font-semibold transition-colors">
                  Hủy bỏ
                </button>
                <button type="submit" disabled={saving}
                  className="px-4 py-2 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold transition-colors shadow-lg shadow-pink-600/10">
                  {saving ? "Đang lưu..." : "Lưu Phác Đồ"}
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-[#334155] rounded-xl p-8 text-center">
          <FileText size={36} className="mb-2 opacity-30" />
          <p className="text-sm">Chưa có hồ sơ da</p>
          <p className="text-xs mt-1 text-slate-600">Bắt đầu tạo hồ sơ da liễu đầu tiên cho khách hàng</p>
          <button onClick={() => {
            setProfile({
              id: "",
              customer_id: searchId,
              skin_type: "Oily",
              issues: [],
              current_treatment: "",
              history: [],
              photos: null
            });
            setIsEditing(true);
          }} className="mt-4 px-3 py-1.5 bg-pink-600/20 hover:bg-pink-600/30 border border-pink-500/30 text-pink-400 text-xs font-bold rounded-lg transition-colors">
            Khởi tạo Hồ sơ mới
          </button>
        </div>
      )}
    </div>
  );
}
