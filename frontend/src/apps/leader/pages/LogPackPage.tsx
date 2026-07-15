import React, { useState } from "react";
import { Truck, ArrowLeft, ClipboardList, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import WaybillList from "../../packs/logistics/components/WaybillList";
import CodReconciliation from "../../packs/logistics/components/CodReconciliation";

type TabKey = "waybills" | "reconciliation";

export default function LogPackPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabKey>("waybills");

    const tabs = [
        { key: "waybills" as const, label: "Quản Lý Vận Đơn", icon: ClipboardList },
        { key: "reconciliation" as const, label: "Đối Soát COD", icon: ShieldCheck },
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
                            <Truck className="text-red-400" size={24} />
                            <h1 className="text-xl font-extrabold tracking-tight">Logistics & Delivery Hub</h1>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Quản lý hành trình giao nhận, thông tin vận đơn và đối soát dòng tiền thu hộ COD của tài xế</p>
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
                                        ? "bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]" 
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
                {activeTab === "waybills" && <WaybillList />}
                {activeTab === "reconciliation" && <CodReconciliation />}
            </div>
        </div>
    );
}
