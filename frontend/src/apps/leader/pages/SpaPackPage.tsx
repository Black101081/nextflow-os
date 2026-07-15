import React from "react";
import SpaBookingCalendar from "../../packs/spa/components/SpaBookingCalendar";
import SkinProfileCard from "../../packs/spa/components/SkinProfileCard";
import CourseProgressBar from "../../packs/spa/components/CourseProgressBar";
import { Sparkles, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SpaPackPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#334155] pb-5">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/leader/packs")} className="p-2 bg-[#1e293b] hover:bg-[#334155] border border-[#334155] rounded-xl text-slate-400 hover:text-white transition-all">
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="text-pink-400" size={20} />
              <h1 className="text-xl font-extrabold tracking-tight">Spa & Clinic Solutions</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">Hệ thống quản lý khách hàng, đặt lịch hẹn và liệu trình chuyên biệt ngành làm đẹp</p>
          </div>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Side: Calendar (8 columns) */}
        <div className="lg:col-span-7 xl:col-span-8">
          <SpaBookingCalendar />
        </div>

        {/* Right Side: Course Progress (4 columns) */}
        <div className="lg:col-span-5 xl:col-span-4">
          <CourseProgressBar />
        </div>

        {/* Bottom Full Row: Skin Profile Card (12 columns) */}
        <div className="lg:col-span-12">
          <SkinProfileCard />
        </div>
      </div>
    </div>
  );
}
