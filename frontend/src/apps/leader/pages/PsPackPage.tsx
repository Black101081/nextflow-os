import React, { useState } from "react";
import { Briefcase, ArrowLeft, Users, FileText, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ClientList from "../../packs/professional_services/components/ClientList";
import ContractList from "../../packs/professional_services/components/ContractList";
import TaxFilings from "../../packs/professional_services/components/TaxFilings";

type TabKey = "clients" | "contracts" | "tax";

export default function PsPackPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabKey>("clients");

    const tabs = [
        { key: "clients" as const, label: "Doanh Nghiệp B2B", icon: Users },
        { key: "contracts" as const, label: "Hợp Đồng Retainer", icon: FileText },
        { key: "tax" as const, label: "Lịch Trình Báo Cáo Thuế", icon: Calendar },
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
                            <Briefcase className="text-indigo-400" size={24} />
                            <h1 className="text-xl font-extrabold tracking-tight">Professional Services Hub</h1>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Quản lý hồ sơ pháp lý B2B, quản lý thời hạn nộp báo cáo thuế doanh nghiệp và dòng tiền hợp đồng định kỳ (Retainer)</p>
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
                                        ? "bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]" 
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
                {activeTab === "clients" && <ClientList />}
                {activeTab === "contracts" && <ContractList />}
                {activeTab === "tax" && <TaxFilings />}
            </div>
        </div>
    );
}
