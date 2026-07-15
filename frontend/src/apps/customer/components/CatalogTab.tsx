import React, { useState } from 'react';
import { Search, Tag, ShoppingCart, Sparkles, Wrench, Coffee } from 'lucide-react';
import { Card, Input, Button, Badge } from '../../../shared/components/ui';

interface CatalogTabProps {
  onSelectService?: (serviceName: string) => void;
}

export default function CatalogTab({ onSelectService }: CatalogTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState<'all' | 'spa' | 'auto' | 'fnb'>('all');

  const items = [
    { id: '1', name: 'Gói Chăm Sóc Da Toàn Diện', category: 'spa', price: 750000, desc: 'Liệu pháp thải độc chì, massage thảo dược nâng cơ và đắp mặt nạ vàng 24k.', duration: '90 phút', popular: true },
    { id: '2', name: 'Trị Mụn Thảo Dược Cổ Truyền', category: 'spa', price: 450000, desc: 'Làm sạch sâu bã nhờn, hút mụn ống tre và thoa serum diệt khuẩn thảo mộc.', duration: '60 phút', popular: false },
    { id: '3', name: 'Thay Dầu Nhớt Tổng Hợp Cao Cấp', category: 'auto', price: 350000, desc: 'Thay dầu nhớt Mobil 1 cao cấp kèm kiểm tra áp suất lốp, nước làm mát miễn phí.', duration: '30 phút', popular: true },
    { id: '4', name: 'Cân Chỉnh Thước Lái 3D', category: 'auto', price: 600000, desc: 'Sử dụng máy Hunter 3D cân chỉnh góc đặt bánh xe chuẩn xác nhất cho dòng xe du lịch.', duration: '45 phút', popular: false },
    { id: '5', name: 'Trà Sữa Trân Châu Hoàng Kim', category: 'fnb', price: 55000, desc: 'Trà ô long thượng hạng ủ lạnh kết hợp sữa tươi nguyên kem và trân châu hoàng kim dẻo ngọt.', duration: '10 phút', popular: true },
    { id: '6', name: 'Cà Phê Muối Cố Đô', category: 'fnb', price: 45000, desc: 'Cà phê robusta pha phin truyền thống thơm nồng cùng lớp kem muối béo ngậy.', duration: '5 phút', popular: false }
  ];

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.desc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === 'all' || item.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Filters and search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={category === 'all' ? 'primary' : 'outline'} 
            size="sm" 
            onClick={() => setCategory('all')}
          >
            Tất cả
          </Button>
          <Button 
            variant={category === 'spa' ? 'primary' : 'outline'} 
            size="sm" 
            icon={<Sparkles size={14} />}
            onClick={() => setCategory('spa')}
          >
            Spa & Clinic
          </Button>
          <Button 
            variant={category === 'auto' ? 'primary' : 'outline'} 
            size="sm" 
            icon={<Wrench size={14} />}
            onClick={() => setCategory('auto')}
          >
            Auto Repair
          </Button>
          <Button 
            variant={category === 'fnb' ? 'primary' : 'outline'} 
            size="sm" 
            icon={<Coffee size={14} />}
            onClick={() => setCategory('fnb')}
          >
            F&B Standard
          </Button>
        </div>
        <div className="w-full md:w-72">
          <Input 
            placeholder="Tìm kiếm sản phẩm, dịch vụ..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)}
            icon={<Search size={16} />}
          />
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredItems.map(item => (
          <Card key={item.id} variant="default" className="p-5 flex flex-col justify-between gap-4 h-full relative overflow-hidden group hover:border-indigo-500/30 transition-all">
            {item.popular && (
              <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
                Yêu thích
              </div>
            )}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                {item.category === 'spa' && 'SPA & CLINIC'}
                {item.category === 'auto' && 'AUTO REPAIR'}
                {item.category === 'fnb' && 'F&B STANDARD'}
              </span>
              <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">{item.name}</h4>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{item.desc}</p>
            </div>

            <div className="flex flex-col gap-3 mt-auto">
              <div className="flex items-center justify-between border-t border-white/5 pt-3">
                <span className="text-sm font-black text-indigo-400">{item.price.toLocaleString('vi-VN')} đ</span>
                <span className="text-[10px] text-slate-500">{item.duration}</span>
              </div>
              {onSelectService && item.category !== 'fnb' ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onSelectService(item.name)}
                >
                  Đặt lịch hẹn ngay
                </Button>
              ) : (
                <Button 
                  variant="primary" 
                  size="sm" 
                  icon={<ShoppingCart size={14} />}
                >
                  Thêm vào giỏ hàng
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
