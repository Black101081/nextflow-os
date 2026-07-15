import React, { useState } from "react";
import { Pill, ArrowLeft, ClipboardList, PackageCheck, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PrescriptionList from "../../packs/pharmacy/components/PrescriptionList";
import MedicineInventory from "../../packs/pharmacy/components/MedicineInventory";
import PatientRecords from "../../packs/pharmacy/components/PatientRecords";

type TabKey = "prescriptions" | "inventory" | "patients";

export default function PharPackPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabKey>("prescriptions");

    const tabs = [
        { key: "prescriptions" as const, label: "Kê Đơn & Bốc Thuốc", icon: ClipboardList },
        { key: "inventory" as const, label: "Kho Dược Phẩm", icon: PackageCheck },
        { key: "patients" as const, label: "Hồ Sơ Bệnh Nhân", icon: UserPlus },
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
                            <Pill className="text-cyan-400" size={24} />
                            <h1 className="text-xl font-extrabold tracking-tight">Pharmacy & Healthcare System</h1>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Hệ thống quản lý kê đơn điện tử tích hợp AI kiểm tra chống chỉ định, tồn kho dược phẩm và bệnh án điện tử</p>
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
                                        ? "bg-cyan-600 text-slate-900 shadow-[0_0_15px_rgba(6,182,212,0.3)]" 
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
                {activeTab === "prescriptions" && <PrescriptionList />}
                {activeTab === "inventory" && <MedicineInventory />}
                {activeTab === "patients" && <PatientRecords />}
            </div>
        </div>
    );
}
