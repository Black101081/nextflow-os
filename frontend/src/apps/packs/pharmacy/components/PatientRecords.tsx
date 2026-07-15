import { useState, useEffect } from "react";
import { apiService } from "../../../../shared/services/api";
import { Users, Plus, RefreshCw, AlertCircle, Calendar, UserCheck } from "lucide-react";

interface PatientRecord {
  id: string;
  patient_name: string;
  dob: string;
  phone: string;
  blood_type: string;
  chronic_conditions: string[];
  current_medications: string[];
  allergies: string[];
  last_visit: string;
  next_appointment: string;
}

export default function PatientRecords() {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [patientName, setPatientName] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [chronicRaw, setChronicRaw] = useState("");
  const [medsRaw, setMedsRaw] = useState("");
  const [allergiesRaw, setAllergiesRaw] = useState("");
  const [lastVisit, setLastVisit] = useState("");
  const [nextAppointment, setNextAppointment] = useState("");
  const [error, setError] = useState("");

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await apiService.get("/api/v1/phar/patient-records");
      setPatients(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!patientName) {
      setError("Vui lòng điền tên bệnh nhân.");
      return;
    }

    const chronic_conditions = chronicRaw ? chronicRaw.split(",").map(s => s.trim()) : [];
    const current_medications = medsRaw ? medsRaw.split(",").map(s => s.trim()) : [];
    const allergies = allergiesRaw ? allergiesRaw.split(",").map(s => s.trim()) : [];

    try {
      await apiService.post("/api/v1/phar/patient-records", {
        patient_name: patientName,
        dob: dob || null,
        phone: phone || null,
        blood_type: bloodType || null,
        chronic_conditions,
        current_medications,
        allergies,
        last_visit: lastVisit || null,
        next_appointment: nextAppointment || null
      });

      setPatientName("");
      setDob("");
      setPhone("");
      setBloodType("");
      setChronicRaw("");
      setMedsRaw("");
      setAllergiesRaw("");
      setLastVisit("");
      setNextAppointment("");
      setShowAddForm(false);
      fetchPatients();
    } catch (err: any) {
      setError(err.response?.data?.error || "Có lỗi xảy ra khi tạo hồ sơ.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
          <Users size={18} className="text-cyan-400" />
          Hồ Sơ Y Tế Bệnh Nhân
        </h3>
        <div className="flex gap-2">
          <button onClick={fetchPatients} className="p-2 bg-[#1e293b] border border-[#334155] rounded-xl hover:bg-[#334155] text-slate-400 hover:text-white transition-all text-xs">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-900 font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all">
            <Plus size={14} />
            Đăng ký bệnh nhân
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-[#1e293b] border border-[#334155] rounded-xl p-5 space-y-4 max-w-2xl">
          <h4 className="text-sm font-bold text-slate-200">Đăng Ký Hồ Sơ Bệnh Nhân Mới</h4>
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs flex items-center gap-2">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Họ và tên bệnh nhân *</label>
              <input type="text" value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="VD: Nguyễn Văn A" className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Số điện thoại</label>
              <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="VD: 0912345678" className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Ngày sinh</label>
              <input type="date" value={dob} onChange={e => setDob(e.target.value)} className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Nhóm máu</label>
              <input type="text" value={bloodType} onChange={e => setBloodType(e.target.value)} placeholder="A, B, O, AB" className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-bold">Bệnh lý mãn tính (cách nhau bằng dấu phẩy)</label>
            <input type="text" value={chronicRaw} onChange={e => setChronicRaw(e.target.value)} placeholder="Huyết áp cao, Tiểu đường..." className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-bold">Thuốc đang sử dụng (cách nhau bằng dấu phẩy)</label>
            <input type="text" value={medsRaw} onChange={e => setMedsRaw(e.target.value)} placeholder="Glucophage, Amlodipin..." className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-bold">Tiền sử dị ứng thuốc (cách nhau bằng dấu phẩy)</label>
            <input type="text" value={allergiesRaw} onChange={e => setAllergiesRaw(e.target.value)} placeholder="Penicillin, Aspirin..." className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Khám gần nhất</label>
              <input type="date" value={lastVisit} onChange={e => setLastVisit(e.target.value)} className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold">Hẹn khám tiếp theo</label>
              <input type="date" value={nextAppointment} onChange={e => setNextAppointment(e.target.value)} className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b] text-xs font-bold transition-all">Hủy</button>
            <button type="submit" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-900 rounded-lg text-xs font-bold transition-all">Lưu Hồ Sơ</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <RefreshCw size={24} className="animate-spin text-cyan-500" />
        </div>
      ) : patients.length === 0 ? (
        <div className="bg-[#1e293b] border border-dashed border-[#334155] rounded-2xl p-8 text-center text-slate-500">
          <Users size={36} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">Chưa có hồ sơ bệnh nhân nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patients.map(p => (
            <div key={p.id} className="bg-[#1e293b] border border-[#334155] rounded-2xl p-5 flex flex-col justify-between hover:border-[#475569] transition-all">
              <div>
                <div className="flex items-center gap-3 border-b border-[#334155]/60 pb-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 text-cyan-400">
                    <UserCheck size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">{p.patient_name}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      NS: {p.dob ? new Date(p.dob).toLocaleDateString("vi-VN") : "Chưa cập nhật"} | Nhóm máu: {p.blood_type || "Chưa rõ"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 font-bold">Bệnh mãn tính:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {p.chronic_conditions && p.chronic_conditions.length > 0 ? p.chronic_conditions.map((c, i) => (
                        <span key={i} className="px-2 py-0.5 bg-[#0f172a]/60 text-slate-300 rounded-md border border-[#334155]/60">{c}</span>
                      )) : <span className="text-slate-600">Không có</span>}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold">Dị ứng thuốc:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {p.allergies && p.allergies.length > 0 ? p.allergies.map((a, i) => (
                        <span key={i} className="px-2 py-0.5 bg-red-500/10 text-red-400 rounded-md border border-red-500/20 font-semibold">{a}</span>
                      )) : <span className="text-slate-600">Không dị ứng</span>}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold">Thuốc hiện tại:</span>
                    <p className="text-slate-300 font-mono text-[10px] mt-0.5">
                      {p.current_medications && p.current_medications.length > 0 ? p.current_medications.join(", ") : "Không sử dụng thuốc"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4 pt-3 border-t border-[#334155]/60 text-[10px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  Khám gần nhất: {p.last_visit ? new Date(p.last_visit).toLocaleDateString("vi-VN") : "Chưa khám"}
                </span>
                {p.next_appointment && (
                  <span className="text-cyan-400 font-bold">
                    Hẹn khám: {new Date(p.next_appointment).toLocaleDateString("vi-VN")}
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
