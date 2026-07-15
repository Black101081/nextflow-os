import React, { useState, useEffect } from "react";
import { apiService } from "../../../../shared/services/api";
import { GraduationCap, UserPlus, RefreshCw, AlertCircle, Search, Mail, Phone, Calendar } from "lucide-react";

interface Student {
    id: string;
    name: string;
    dob: string | null;
    gender: string | null;
    phone: string | null;
    email: string | null;
    parent_name: string | null;
    parent_phone: string | null;
    parent_email: string | null;
    current_level: string | null;
    total_debt: number;
    attendance_rate: number;
    status: string;
    enrolled_at: string | null;
}

export default function StudentList() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form states
    const [showAddForm, setShowAddForm] = useState(false);
    const [name, setName] = useState("");
    const [dob, setDob] = useState("2018-05-15");
    const [gender, setGender] = useState("Nam");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [parentName, setParentName] = useState("");
    const [parentPhone, setParentPhone] = useState("");
    const [currentLevel, setCurrentLevel] = useState("IELTS Kids 1");
    const [submitting, setSubmitting] = useState(false);

    // Filter states
    const [searchTerm, setSearchTerm] = useState("");

    const fetchStudents = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiService.get("/api/v1/edu/students");
            const list = Array.isArray(res.data) ? res.data : [];
            setStudents(list);
        } catch (err: any) {
            setError(err.message || "Không thể tải danh sách học viên");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleCreateStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await apiService.post("/api/v1/edu/students", {
                name,
                dob,
                gender,
                phone: phone || null,
                email: email || null,
                parent_name: parentName || null,
                parent_phone: parentPhone || null,
                current_level: currentLevel,
                enrolled_at: new Date().toISOString().split('T')[0]
            });
            setShowAddForm(false);
            setName("");
            setPhone("");
            setEmail("");
            setParentName("");
            setParentPhone("");
            await fetchStudents();
        } catch (err: any) {
            alert(`Lỗi đăng ký học viên: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const filteredStudents = students.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.current_level && s.current_level.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const formatPrice = (p: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
    };

    return (
        <div className="bg-[#1e293b]/60 border border-[#334155] rounded-2xl p-6 backdrop-blur-xl flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#334155]/60 pb-4 gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-lg">
                        <GraduationCap size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Danh sách Học viên</h2>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">Quản lý hồ sơ học viên, thông tin phụ huynh và tổng dư nợ học phí</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                    >
                        <UserPlus size={14} />
                        Đăng ký học viên mới
                    </button>
                    <button onClick={fetchStudents} className="p-2 rounded-lg bg-[#334155] hover:bg-[#475569] text-slate-400 hover:text-slate-200 transition-colors">
                        <RefreshCw size={14} />
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                    type="text" 
                    placeholder="Tìm kiếm học viên theo họ tên hoặc lớp học..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#0f172a]/60 border border-[#334155] rounded-xl pl-10 pr-4 py-2.5 text-slate-200 outline-none focus:border-blue-500 transition-colors text-sm"
                />
            </div>

            {showAddForm && (
                <form onSubmit={handleCreateStudent} className="bg-[#0f172a]/60 border border-[#334155] rounded-2xl p-5 space-y-4">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-[#334155]/40 pb-2">Thông tin học viên</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Họ và tên học viên</label>
                            <input 
                                type="text" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                required
                                placeholder="VD: Nguyễn Văn A"
                                className="w-full bg-[#1e293b] border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-blue-500 transition-colors text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Ngày sinh</label>
                            <input 
                                type="date" 
                                value={dob} 
                                onChange={(e) => setDob(e.target.value)} 
                                required
                                className="w-full bg-[#1e293b] border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-blue-500 transition-colors text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Giới tính</label>
                            <select 
                                value={gender} 
                                onChange={(e) => setGender(e.target.value)}
                                className="w-full bg-[#1e293b] border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-blue-500 transition-colors text-sm"
                            >
                                <option value="Nam">Nam</option>
                                <option value="Nữ">Nữ</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Điện thoại học viên</label>
                            <input 
                                type="text" 
                                value={phone} 
                                onChange={(e) => setPhone(e.target.value)} 
                                placeholder="Không bắt buộc"
                                className="w-full bg-[#1e293b] border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-blue-500 transition-colors text-sm"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email học viên</label>
                            <input 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                placeholder="Không bắt buộc"
                                className="w-full bg-[#1e293b] border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-blue-500 transition-colors text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Lớp đăng ký</label>
                            <input 
                                type="text" 
                                value={currentLevel} 
                                onChange={(e) => setCurrentLevel(e.target.value)} 
                                required
                                className="w-full bg-[#1e293b] border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-blue-500 transition-colors text-sm"
                            />
                        </div>
                    </div>

                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-[#334155]/40 pt-2 pb-2">Thông tin phụ huynh</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Họ tên Phụ huynh</label>
                            <input 
                                type="text" 
                                value={parentName} 
                                onChange={(e) => setParentName(e.target.value)} 
                                required
                                placeholder="VD: Nguyễn Văn B"
                                className="w-full bg-[#1e293b] border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-blue-500 transition-colors text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Số điện thoại liên lạc</label>
                            <input 
                                type="text" 
                                value={parentPhone} 
                                onChange={(e) => setParentPhone(e.target.value)} 
                                required
                                placeholder="Dùng để nhận Zalo thông báo vắng mặt tự động"
                                className="w-full bg-[#1e293b] border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-blue-500 transition-colors text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button 
                            type="button" 
                            onClick={() => setShowAddForm(false)}
                            className="bg-[#334155] hover:bg-[#475569] text-slate-300 font-bold py-2 px-4 rounded-xl text-xs transition-colors"
                        >
                            Hủy bỏ
                        </button>
                        <button 
                            type="submit" 
                            disabled={submitting}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-xl text-xs transition-colors shadow-lg"
                        >
                            {submitting ? "Đang lưu..." : "Lưu học viên"}
                        </button>
                    </div>
                </form>
            )}

            {loading && students.length === 0 ? (
                <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            ) : error ? (
                <div className="text-center py-4">
                    <AlertCircle className="text-red-400 mx-auto mb-1" size={24} />
                    <p className="text-red-400 text-xs">{error}</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-[#334155] text-slate-400">
                                <th className="pb-3 font-semibold">Tên Học viên</th>
                                <th className="pb-3 font-semibold">Thông tin chung</th>
                                <th className="pb-3 font-semibold">Phụ huynh liên hệ</th>
                                <th className="pb-3 font-semibold">Chỉ số học vụ</th>
                                <th className="pb-3 font-semibold">Học phí còn nợ</th>
                                <th className="pb-3 font-semibold">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#334155]/40">
                            {filteredStudents.map(student => (
                                <tr key={student.id} className="text-slate-300 hover:bg-[#334155]/10">
                                    <td className="py-3.5">
                                        <p className="font-extrabold text-slate-200 text-sm">{student.name}</p>
                                        <p className="text-[10px] text-slate-500 mt-0.5">Lớp: {student.current_level || "Chưa xếp lớp"}</p>
                                    </td>
                                    <td className="py-3.5">
                                        <div className="flex flex-col gap-1 text-[11px] text-slate-400">
                                            <span className="flex items-center gap-1"><Calendar size={12} className="text-slate-500" /> Ngày sinh: {student.dob || "N/A"}</span>
                                            {student.phone && <span className="flex items-center gap-1"><Phone size={12} className="text-slate-500" /> {student.phone}</span>}
                                        </div>
                                    </td>
                                    <td className="py-3.5">
                                        <p className="font-bold text-slate-300">{student.parent_name || "N/A"}</p>
                                        {student.parent_phone && (
                                            <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                                <Phone size={12} className="text-slate-500" /> {student.parent_phone}
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-3.5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-12 bg-slate-800 rounded-full h-2 overflow-hidden border border-[#334155]">
                                                <div 
                                                    className={`h-full ${student.attendance_rate >= 90 ? "bg-emerald-500" : student.attendance_rate >= 75 ? "bg-amber-500" : "bg-red-500"}`}
                                                    style={{ width: `${student.attendance_rate}%` }}
                                                />
                                            </div>
                                            <span className="font-mono font-bold text-[11px]">{student.attendance_rate}% chuyên cần</span>
                                        </div>
                                    </td>
                                    <td className="py-3.5">
                                        <span className={`font-black ${student.total_debt > 0 ? "text-red-400" : "text-emerald-400"}`}>
                                            {formatPrice(student.total_debt)}
                                        </span>
                                    </td>
                                    <td className="py-3.5">
                                        <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                                            student.status === "Active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                            "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                                        }`}>
                                            {student.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {filteredStudents.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-6 text-center text-slate-500">Không tìm thấy học viên nào phù hợp</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
