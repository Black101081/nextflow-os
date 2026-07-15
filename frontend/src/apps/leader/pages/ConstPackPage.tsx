import React, { useState } from "react";
import { HardHat, ArrowLeft, ClipboardList, BookOpen, Truck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProjectList from "../../packs/contractor/components/ProjectList";
import DailyLogs from "../../packs/contractor/components/DailyLogs";
import MaterialRequests from "../../packs/contractor/components/MaterialRequests";

type TabKey = "projects" | "logs" | "materials";

export default function ConstPackPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabKey>("projects");

    const tabs = [
        { key: "projects" as const, label: "Hồ Sơ Dự Án", icon: ClipboardList },
        { key: "logs" as const, label: "Nhật Ký Thi Công", icon: BookOpen },
        { key: "materials" as const, label: "Yêu Cầu Vật Tư", icon: Truck },
    ];

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-100 p-6 flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#334155]/60 pb-5 gap-4">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate("/leader/packs")} 
                        className="p-2.5 bg-[#1e293b] hover:bg-[#334155] border border-[#334155] rounded-xl text-slate-400 hover:text-white transition-all shadow-md"
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <HardHat className="text-amber-400" size={24} />
                            <h1 className="text-xl font-extrabold tracking-tight">Contractor & Interior Management</h1>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Hệ thống quản lý công trình xây dựng, nhật ký thi công hiện trường tích hợp AI và điều phối cung ứng nguyên vật liệu</p>
                    </div>
                </div>

                {/* Tabs Switcher */}
                <div className="flex bg-[#1e293b]/80 border border-[#334155]/60 rounded-xl p-1 shadow-inner max-w-full overflow-x-auto hide-scrollbar shrink-0">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                    isActive 
                                        ? "bg-amber-600 text-slate-900 shadow-[0_0_15px_rgba(245,158,11,0.3)]" 
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

            {/* Content Area */}
            <div className="flex-1">
                {activeTab === "projects" && <ProjectList />}
                {activeTab === "logs" && <DailyLogs />}
                {activeTab === "materials" && <MaterialRequests />}
            </div>
        </div>
    );
}
