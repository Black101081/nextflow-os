import React, { useState } from "react";
import { Factory, ArrowLeft, ClipboardList, PackageCheck, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import WorkOrderList from "../../packs/manufacturing/components/WorkOrderList";
import BomList from "../../packs/manufacturing/components/BomList";
import QcReports from "../../packs/manufacturing/components/QcReports";

type TabKey = "workorders" | "boms" | "qc";

export default function MfgPackPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabKey>("workorders");

    const tabs = [
        { key: "workorders" as const, label: "Lệnh Sản Xuất", icon: ClipboardList },
        { key: "boms" as const, label: "Định Mức BOM", icon: PackageCheck },
        { key: "qc" as const, label: "Kiểm Định QC", icon: ShieldCheck },
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
                            <Factory className="text-violet-400" size={24} />
                            <h1 className="text-xl font-extrabold tracking-tight">Micro-Manufacturing Console</h1>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Hệ thống điều hành xưởng sản xuất nhỏ, định mức nguyên vật liệu BOM và quy trình kiểm định QC chặt chẽ</p>
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
                                        ? "bg-violet-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]" 
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
                {activeTab === "workorders" && <WorkOrderList />}
                {activeTab === "boms" && <BomList />}
                {activeTab === "qc" && <QcReports />}
            </div>
        </div>
    );
}
