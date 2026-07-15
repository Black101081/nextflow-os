import React, { useState, useEffect } from "react";
import { apiService } from "../../../../shared/services/api";
import { Clipboard, Award, Plus, RefreshCw, AlertCircle, Sparkles, User, BookOpen } from "lucide-react";

interface Student {
    id: string;
    name: string;
    current_level: string | null;
}

interface GradeRecord {
    id: string;
    student_id: string;
    class_id: string | null;
    test_type: string | null;
    subject: string | null;
    score: number;
    max_score: number;
    feedback: string | null;
    ai_report: string | null;
    graded_at: string;
}

export default function GradeEntry() {
    const [students, setStudents] = useState<Student[]>([]);
    const [records, setRecords] = useState<GradeRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form states
    const [showAddForm, setShowAddForm] = useState(false);
    const [studentId, setStudentId] = useState("");
    const [testType, setTestType] = useState("GiuaKy");
    const [subject, setSubject] = useState("Writing");
    const [score, setScore] = useState(85);
    const [feedback, setFeedback] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [studentsRes, recordsRes] = await Promise.all([
                apiService.get("/api/v1/edu/students"),
                apiService.get("/api/v1/edu/grade-records")
            ]);
            
            const stds = Array.isArray(studentsRes.data) ? studentsRes.data : [];
            const recs = Array.isArray(recordsRes.data) ? recordsRes.data : [];

            setStudents(stds);
            setRecords(recs);
            if (stds.length > 0) {
                setStudentId(stds[0].id);
            }
        } catch (err: any) {
            setError(err.message || "Không thể tải bảng điểm");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateGrade = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await apiService.post("/api/v1/edu/grade-records", {
                student_id: studentId,
                test_type: testType,
                subject,
                score: Number(score),
                max_score: 100.0,
                feedback: feedback || null
            });
            setShowAddForm(false);
            setFeedback("");
            await fetchData();
        } catch (err: any) {
            alert(`Lỗi ghi nhận điểm: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const getStudentName = (id: string) => {
        const std = students.find(s => s.id === id);
        return std ? std.name : "Học viên ẩn danh";
    };

    return (
        <div className="bg-[#1e293b]/60 border border-[#334155] rounded-2xl p-6 backdrop-blur-xl flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#334155]/60 pb-4 gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-lg">
                        <Award size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Ghi nhận điểm thi & Đánh giá Học lực</h2>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">Bảng điểm kiểm tra định kỳ tích hợp AI phân tích học lực tự động</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                    >
                        <Plus size={14} />
                        Nhập điểm thi mới
                    </button>
                    <button onClick={fetchData} className="p-2 rounded-lg bg-[#334155] hover:bg-[#475569] text-slate-400 hover:text-slate-200 transition-colors">
                        <RefreshCw size={14} />
                    </button>
                </div>
            </div>

            {showAddForm && (
                <form onSubmit={handleCreateGrade} className="bg-[#0f172a]/60 border border-[#334155] rounded-2xl p-5 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Học viên nhận điểm</label>
                            <select 
                                value={studentId} 
                                onChange={(e) => setStudentId(e.target.value)}
                                className="w-full bg-[#1e293b] border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-blue-500 transition-colors text-sm"
                            >
                                {students.map(s => (
                                    <option key={s.id} value={s.id}>{s.name} ({s.current_level || "Chung"})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Loại bài thi</label>
                            <select 
                                value={testType} 
                                onChange={(e) => setTestType(e.target.value)}
                                className="w-full bg-[#1e293b] border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-blue-500 transition-colors text-sm"
                            >
                                <option value="GiuaKy">Kiểm tra giữa kỳ</option>
                                <option value="CuoiKy">Thi cuối kỳ</option>
                                <option value="Practice">Bài tập thực hành</option>
                                <option value="Mock">Thi thử (Mock Test)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Môn học / Kỹ năng</label>
                            <select 
                                value={subject} 
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full bg-[#1e293b] border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-blue-500 transition-colors text-sm"
                            >
                                <option value="Writing">Writing</option>
                                <option value="Speaking">Speaking</option>
                                <option value="Listening">Listening</option>
                                <option value="Reading">Reading</option>
                                <option value="Grammar">Grammar</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Điểm đạt được (thang 100)</label>
                            <input 
                                type="number" 
                                min={0}
                                max={100}
                                value={score} 
                                onChange={(e) => setScore(Number(e.target.value))} 
                                required
                                className="w-full bg-[#1e293b] border border-[#334155] rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-blue-500 transition-colors text-sm"
                            />
                        </div>
                        <div className="md:col-span-3">
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Nhận xét của Giáo viên</label>
                            <textarea 
                                value={feedback} 
                                onChange={(e) => setFeedback(e.target.value)} 
                                rows={2}
                                placeholder="Ghi chi tiết điểm mạnh và điểm cần cải thiện của học viên..."
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
                            {submitting ? "Đang xử lý..." : "Lưu điểm & Chạy AI đánh giá học lực"}
                        </button>
                    </div>
                </form>
            )}

            {loading && records.length === 0 ? (
                <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            ) : error ? (
                <div className="text-center py-4">
                    <AlertCircle className="text-red-400 mx-auto mb-1" size={24} />
                    <p className="text-red-400 text-xs">{error}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {records.map(record => (
                        <div key={record.id} className="bg-[#0f172a]/60 border border-[#334155]/60 rounded-2xl p-5 hover:border-blue-500/20 transition-all flex flex-col gap-4 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#334155]/40 pb-3 gap-2">
                                <div className="flex items-center gap-2">
                                    <User size={16} className="text-slate-500" />
                                    <span className="font-extrabold text-slate-200 text-sm">{getStudentName(record.student_id)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="bg-slate-800 text-slate-400 border border-[#334155]/60 px-2 py-0.5 rounded-full font-mono font-bold">{record.test_type}</span>
                                    <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-bold">{record.subject}</span>
                                    <span className="text-xs text-slate-500">{new Date(record.graded_at).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                                {/* Score Badge */}
                                <div className="lg:col-span-2 flex flex-col items-center justify-center p-3 bg-blue-500/5 border border-blue-500/20 rounded-2xl min-h-[90px]">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Điểm thi</p>
                                    <span className="text-2xl font-black text-blue-400 mt-1">{record.score}</span>
                                    <p className="text-[9px] text-slate-600 mt-0.5">Thang {record.max_score}</p>
                                </div>

                                {/* Comments & AI Report */}
                                <div className="lg:col-span-10 space-y-3">
                                    {record.feedback && (
                                        <div className="flex gap-2">
                                            <BookOpen size={14} className="text-slate-500 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Nhận xét từ giáo viên:</p>
                                                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{record.feedback}</p>
                                            </div>
                                        </div>
                                    )}
                                    {record.ai_report && (
                                        <div className="bg-[#1e293b]/40 border border-indigo-500/10 rounded-xl p-3.5 flex gap-2.5 shadow-inner">
                                            <Sparkles size={14} className="text-indigo-400 shrink-0 mt-0.5 animate-pulse" />
                                            <div>
                                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">AI phân tích học lực học viên:</p>
                                                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{record.ai_report}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {records.length === 0 && (
                        <p className="text-slate-500 text-xs text-center py-8">Chưa có kết quả thi nào được ghi nhận</p>
                    )}
                </div>
            )}
        </div>
    );
}
