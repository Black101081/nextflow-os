import React, { useState } from "react";
import { Building2, ArrowLeft, Home, UserCheck, Landmark } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ListingList from "../../packs/real_estate/components/ListingList";
import LeadList from "../../packs/real_estate/components/LeadList";
import DealPipeline from "../../packs/real_estate/components/DealPipeline";

type TabKey = "listings" | "leads" | "deals";

export default function RePackPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabKey>("listings");

    const tabs = [
        { key: "listings" as const, label: "Giỏ Hàng Bất Động Sản", icon: Home },
        { key: "leads" as const, label: "Nhu Cầu Khách Mua", icon: UserCheck },
        { key: "deals" as const, label: "Deal Pipeline & Pháp Lý", icon: Landmark },
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
                            <Building2 className="text-purple-400" size={24} />
                            <h1 className="text-xl font-extrabold tracking-tight">Real Estate Solution Console</h1>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Hệ thống ký gửi nhà đất, chấm điểm nhu cầu khách mua bằng AI & quy trình giao dịch pháp lý công chứng</p>
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
                                        ? "bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]" 
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
                {activeTab === "listings" && <ListingList />}
                {activeTab === "leads" && <LeadList />}
                {activeTab === "deals" && <DealPipeline />}
            </div>
        </div>
    );
}
