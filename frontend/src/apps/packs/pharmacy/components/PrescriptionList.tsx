import { useState, useEffect } from "react";
import { apiService } from "../../../../shared/services/api";
import { FileText, Plus, CheckCircle, RefreshCw, AlertCircle, Calendar, AlertTriangle, ShieldCheck } from "lucide-react";

interface Prescription {
  id: string;
  patient_name: string;
  patient_dob: string;
  patient_phone: string;
  doctor_name: string;
  clinic_name: string;
  diagnosis: string;
  medicines: any[];
  requires_narcotic: boolean;
  status: string;
  ai_check_result: {
    safe: boolean;
    warnings: string[];
    ai_assessed_at?: string;
  };
  created_at: string;
}

export default function PrescriptionList() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [patientName, setPatientName] = useState("");
  const [patientDob, setPatientDob] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [medicinesRaw, setMedicinesRaw] = useState("");
  const [requiresNarcotic, setRequiresNarcotic] = useState(false);
  const [error, setError] = useState("");

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const res = await apiService.get("/api/v1/phar/prescriptions");
      setPrescriptions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!patientName || !medicinesRaw) {
      setError("Vui lòng điền tên bệnh nhân và danh sách thuốc.");
      return;
    }

    let medicinesList = [];
    try {
      medicinesList = JSON.parse(medicinesRaw);
    } catch (err) {
      medicinesList = [{ name: medicinesRaw, dosage: "1 viên", frequency: "2 lần/ngày" }];
    }

    try {
      await apiService.post("/api/v1/phar/prescriptions", {
        patient_name: patientName,
        patient_dob: patientDob || null,
        patient_phone: patientPhone || null,
        doctor_name: doctorName || null,
        clinic_name: clinicName || null,
        diagnosis: diagnosis || null,
        medicines: medicinesList,
        requires_narcotic: requiresNarcotic
      });

      setPatientName("");
      setPatientDob("");
      setPatientPhone("");
      setDoctorName("");
      setClinicName("");
      setDiagnosis("");
      setMedicinesRaw("");
      setRequiresNarcotic(false);
      setShowAddForm(false);
      fetchPrescriptions();
    } catch (err: any) {
      setError(err.response?.data?.error || "Có lỗi xảy ra khi tạo đơn thuốc.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
          <FileText size={18} className="text-cyan-400" />
          Kê Đơn & Bốc Thuốc
        </h3>
        <div className="flex gap-2">
          <button onClick={fetchPrescriptions} className="p-2 bg-[#1e293b] border border-[#334155] rounded-xl hover:bg-[#334155] text-slate-400 hover:text-white transition-all text-xs">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-900 font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all">
            <Plus size={14} />
            Kê đơn mới
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-[#1e293b] border border-[#334155] rounded-xl p-5 space-y-4 max-w-2xl">
          <h4 className="text-sm font-bold text-slate-200">Tạo Đơn Thuốc Mới</h4>
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs flex items-center gap-2">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Tên bệnh nhân *</label>
              <input type="text" value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="VD: Nguyễn Thị C" className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors" />
              <button type="button" onClick={() => setPatientName("Nguyen Thi C (Dị ứng)")} className="text-[10px] text-slate-500 text-left hover:text-slate-300">Giả lập bệnh nhân dị ứng kháng sinh</button>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Số điện thoại bệnh nhân</label>
              <input type="text" value={patientPhone} onChange={e => setPatientPhone(e.target.value)} placeholder="VD: 0912345678" className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Bác sĩ kê đơn</label>
              <input type="text" value={doctorName} onChange={e => setDoctorName(e.target.value)} placeholder="Bác sĩ điều trị..." className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Bệnh viện / Phòng khám</label>
              <input type="text" value={clinicName} onChange={e => setClinicName(e.target.value)} placeholder="Nơi khám bệnh..." className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-bold">Chẩn đoán lâm sàng</label>
            <input type="text" value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="Chẩn đoán chính..." className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-bold">Danh sách thuốc (Định dạng JSON) *</label>
            <textarea value={medicinesRaw} onChange={e => setMedicinesRaw(e.target.value)} rows={3} placeholder='[{"name": "Amoxicillin", "dosage": "500mg", "frequency": "2 lần/ngày"}]' className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500 transition-colors" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="narcotic" checked={requiresNarcotic} onChange={e => setRequiresNarcotic(e.target.checked)} className="rounded border-[#334155] bg-[#0f172a] text-cyan-600 focus:ring-cyan-500" />
            <label htmlFor="narcotic" className="text-xs text-slate-300 select-none">Đơn thuốc chứa chất gây nghiện / hướng thần (Cần kiểm soát đặc biệt)</label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b] text-xs font-bold transition-all">Hủy</button>
            <button type="submit" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-900 rounded-lg text-xs font-bold transition-all">Kê Đơn</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <RefreshCw size={24} className="animate-spin text-cyan-500" />
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="bg-[#1e293b] border border-dashed border-[#334155] rounded-2xl p-8 text-center text-slate-500">
          <FileText size={36} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">Chưa có đơn thuốc nào được ghi nhận</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prescriptions.map(p => (
            <div key={p.id} className="bg-[#1e293b] border border-[#334155] rounded-2xl p-5 flex flex-col justify-between hover:border-[#475569] transition-all">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-200">{p.patient_name}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">SĐT: {p.patient_phone || "Không có"}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    p.status === "Dispensed" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                  }`}>
                    {p.status === "Received" ? "Chờ bốc thuốc" : "Đã cấp phát"}
                  </span>
                </div>

                <div className="bg-[#0f172a]/55 border border-[#334155]/60 rounded-xl p-3 space-y-1.5">
                  <p className="text-[11px] text-slate-400"><span className="font-bold text-slate-300">Bác sĩ:</span> {p.doctor_name || "Không xác định"} ({p.clinic_name || "Phòng khám tư"})</p>
                  <p className="text-[11px] text-slate-400"><span className="font-bold text-slate-300">Chẩn đoán:</span> {p.diagnosis || "Chưa rõ"}</p>
                  <div className="text-[11px] text-slate-400">
                    <span className="font-bold text-slate-300">Đơn thuốc:</span>
                    <ul className="list-disc pl-4 mt-1 space-y-0.5 font-mono text-[10px] text-slate-300">
                      {Array.isArray(p.medicines) ? p.medicines.map((m, idx) => (
                        <li key={idx}>{m.name} - {m.dosage} ({m.frequency})</li>
                      )) : <li>{String(p.medicines)}</li>}
                    </ul>
                  </div>
                </div>

                {/* AI Safety Check Report */}
                {p.ai_check_result && (
                  <div className={`p-3 rounded-xl border text-[11px] flex gap-2 transition-all ${
                    p.ai_check_result.safe 
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.05)]" 
                      : "bg-red-500/10 border-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.05)]"
                  }`}>
                    {p.ai_check_result.safe ? (
                      <>
                        <ShieldCheck size={16} className="shrink-0 text-emerald-400 mt-0.5" />
                        <div>
                          <p className="font-bold">AI Safety Check: An Toàn</p>
                          <p className="text-[10px] opacity-85 mt-0.5">{p.ai_check_result.ai_assessment || "Không phát hiện xung đột hay chống chỉ định trong cơ sở dữ liệu."}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertTriangle size={16} className="shrink-0 text-red-400 mt-0.5" />
                        <div>
                          <p className="font-bold">AI Safety Alert: Nguy Hiểm</p>
                          {p.ai_check_result.ai_assessment ? (
                            <p className="text-[10px] opacity-90 mt-1 whitespace-pre-line leading-relaxed">{p.ai_check_result.ai_assessment}</p>
                          ) : (
                            <ul className="list-disc pl-4 mt-0.5 space-y-0.5 text-[10px]">
                              {p.ai_check_result.warnings?.map((w, idx) => <li key={idx}>{w}</li>)}
                            </ul>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mt-4 pt-3 border-t border-[#334155]/60 text-[10px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date(p.created_at).toLocaleString("vi-VN")}
                </span>
                {p.requires_narcotic && (
                  <span className="px-2 py-0.5 bg-red-950 text-red-400 rounded border border-red-900 font-bold uppercase text-[8px] tracking-wider animate-pulse">
                    Narcotic Control
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
