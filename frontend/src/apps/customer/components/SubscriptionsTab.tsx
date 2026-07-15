import React from 'react';
import { Calendar, CreditCard, AlertTriangle, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import { Card, Badge, Button } from '../../../shared/components/ui';

export default function SubscriptionsTab() {
  const activeSubscriptions = [
    {
      id: 'sub_1',
      name: 'Gói Hội Viên Spa Gold Pass',
      price: 1500000,
      interval: 'tháng',
      status: 'ACTIVE',
      expiry_date: '2026-08-15',
      benefits: ['Miễn phí 4 buổi chăm sóc da chuyên sâu', 'Giảm giá 15% tất cả mỹ phẩm mua kèm', 'Đặc quyền chọn Kỹ thuật viên trưởng']
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <CreditCard size={18} className="text-indigo-400" /> Các gói hội viên & Đăng ký định kỳ
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active subscription card */}
        {activeSubscriptions.map(sub => (
          <Card key={sub.id} variant="glass" className="p-5 flex flex-col gap-4 border-indigo-500/10">
            <div className="flex justify-between items-start border-b border-white/5 pb-3">
              <div className="flex flex-col gap-1">
                <h4 className="text-sm font-bold text-white">{sub.name}</h4>
                <span className="text-xs font-black text-indigo-400">{sub.price.toLocaleString('vi-VN')} đ / {sub.interval}</span>
              </div>
              <Badge variant="success">{sub.status}</Badge>
            </div>

            <div className="flex flex-col gap-2.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Quyền lợi gói hội viên</span>
              <ul className="flex flex-col gap-1.5 text-xs text-slate-300">
                {sub.benefits.map((b, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-between items-center border-t border-white/5 pt-3 mt-2 text-xs">
              <span className="text-slate-400">Gia hạn tiếp theo: {new Date(sub.expiry_date).toLocaleDateString('vi-VN')}</span>
              <button className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 transition-colors">
                Hủy gia hạn <ArrowRight size={14} />
              </button>
            </div>
          </Card>
        ))}

        {/* Upgrade / More plans invitation */}
        <Card variant="default" className="p-5 flex flex-col gap-4 justify-between items-stretch">
          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Heart size={16} className="text-rose-400" /> Nâng cấp đặc quyền Diamond
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Trở thành hội viên Diamond Pass để nhận ưu đãi lên đến 30% cho mọi dịch vụ, ưu tiên đặt lịch khẩn cấp, chăm sóc tại phòng VIP riêng biệt cùng quà tặng độc quyền mỗi quý.
            </p>
          </div>
          <Button variant="primary" size="sm" className="w-full">
            Tìm hiểu thêm gói Diamond
          </Button>
        </Card>
      </div>
    </div>
  );
}
