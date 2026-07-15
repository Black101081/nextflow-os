import React, { useState } from "react";
import { GraduationCap, ArrowLeft, Award, Calendar, BookOpen, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StudentList from "../../packs/edu/components/StudentList";
import GradeEntry from "../../packs/edu/components/GradeEntry";
import PaymentTracker from "../../packs/edu/components/PaymentTracker";

type TabKey = "students" | "grades" | "payments";

export default function EduPackPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabKey>("students");

    const tabs = [
        { key: "students" as const, label: "Hồ Sơ Học Viên", icon: GraduationCap },
        { key: "grades" as const, label: "Nhập Điểm & Đánh Giá", icon: Award },
        { key: "payments" as const, label: "Theo Dõi Học Phí", icon: DollarSign },
    ];

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-100 p-6 flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#334155] pb-5 gap-4">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate("/leader/packs")} 
                        className="p-2 bg-[#1e293b] hover:bg-[#334155] border border-[#334155] rounded-xl text-slate-400 hover:text-white transition-all shadow-md"
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <GraduationCap className="text-blue-400" size={24} />
                            <h1 className="text-xl font-extrabold tracking-tight">Edu & Training Solutions</h1>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Hệ thống quản lý học vụ trung tâm ngoại ngữ/kỹ năng, nhập điểm đánh giá tự động và kiểm soát học phí</p>
                    </div>
                </div>

                {/* Tabs switcher */}
                <div className="flex bg-[#1e293b]/80 border border-[#334155]/60 rounded-xl p-1 shadow-inner max-w-full overflow-x-auto hide-scrollbar shrink-0">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                    isActive 
                                        ? "bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]" 
                                        : "text-slate-400 hover:text-slate-200"
                                }`}
                            >
                                <Icon size={14} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab content area */}
            <div className="flex-1">
                {activeTab === "students" && <StudentList />}
                {activeTab === "grades" && <GradeEntry />}
                {activeTab === "payments" && <PaymentTracker />}
            </div>
        </div>
    );
}
