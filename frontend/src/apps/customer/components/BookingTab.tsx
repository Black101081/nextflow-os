import React, { useState } from 'react';
import { Calendar, User, Clock, AlertCircle, FileText } from 'lucide-react';
import { Card, Button, Input, useToast } from '../../../shared/components/ui';

interface BookingTabProps {
  initialService?: string;
  onBookingSuccess?: () => void;
}

export default function BookingTab({ initialService = '', onBookingSuccess }: BookingTabProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState({
    customer_id: '88888888-8888-8888-8888-888888888888', // Fixed/Default fallback customer ID
    service: initialService || 'Gói Chăm Sóc Da Toàn Diện',
    scheduled_at: '',
    time: '09:00',
    technician_id: '99999999-9999-9999-9999-999999999999', // Fixed/Default staff ID
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingData.scheduled_at) {
      showToast('error', 'Vui lòng chọn ngày hẹn.');
      return;
    }
    setLoading(true);
    try {
      // Merge date and time
      const datetime = `${bookingData.scheduled_at}T${bookingData.time}:00Z`;

      const res = await fetch('/api/v1/front/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          customer_id: bookingData.customer_id,
          service: bookingData.service,
          scheduled_at: datetime,
          technician_id: bookingData.technician_id,
          notes: bookingData.notes
        })
      }).then(r => r.json());

      if (res.status === 'success') {
        showToast('success', 'Đăng ký đặt lịch hẹn thành công!');
        setBookingData({
          customer_id: '88888888-8888-8888-8888-888888888888',
          service: 'Gói Chăm Sóc Da Toàn Diện',
          scheduled_at: '',
          time: '09:00',
          technician_id: '99999999-9999-9999-9999-999999999999',
          notes: '',
        });
        if (onBookingSuccess) onBookingSuccess();
      } else {
        showToast('error', res.error || 'Gặp lỗi trong quá trình đặt lịch.');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Lỗi kết nối máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <Card variant="default" className="p-6">
        <h3 className="text-base font-bold text-white border-b border-white/5 pb-3 mb-5 flex items-center gap-2">
          <Calendar size={18} className="text-indigo-400" /> Đăng ký đặt lịch dịch vụ trực tuyến
        </h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Dịch vụ yêu cầu</label>
            <select 
              className="w-full bg-[#1e293b] border border-[#334155] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
              value={bookingData.service}
              onChange={e => setBookingData({ ...bookingData, service: e.target.value })}
            >
              <option value="Gói Chăm Sóc Da Toàn Diện">Gói Chăm Sóc Da Toàn Diện (750k - 90 phút)</option>
              <option value="Trị Mụn Thảo Dược Cổ Truyền">Trị Mụn Thảo Dược Cổ Truyền (450k - 60 phút)</option>
              <option value="Thay Dầu Nhớt Tổng Hợp Cao Cấp">Thay Dầu Nhớt Tổng Hợp Cao Cấp (350k - 30 phút)</option>
              <option value="Cân Chỉnh Thước Lái 3D">Cân Chỉnh Thước Lái 3D (600k - 450 phút)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Chọn ngày hẹn</label>
              <Input 
                type="date"
                required
                value={bookingData.scheduled_at}
                onChange={e => setBookingData({ ...bookingData, scheduled_at: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Chọn khung giờ</label>
              <select 
                className="w-full bg-[#1e293b] border border-[#334155] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                value={bookingData.time}
                onChange={e => setBookingData({ ...bookingData, time: e.target.value })}
              >
                <option value="08:00">08:00 AM</option>
                <option value="09:00">09:00 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="14:00">14:00 PM</option>
                <option value="15:00">15:00 PM</option>
                <option value="16:00">16:00 PM</option>
                <option value="17:00">17:00 PM</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Chọn Kỹ thuật viên / Chuyên viên</label>
            <select 
              className="w-full bg-[#1e293b] border border-[#334155] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
              value={bookingData.technician_id}
              onChange={e => setBookingData({ ...bookingData, technician_id: e.target.value })}
            >
              <option value="99999999-9999-9999-9999-999999999999">Hệ thống phân bổ tự động</option>
              <option value="b1111111-1111-1111-1111-111111111111">KTV Thùy Trang (Chuyên gia chăm sóc da)</option>
              <option value="b2222222-2222-2222-2222-222222222222">KTV Quốc Anh (Kỹ thuật viên trưởng)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Ghi chú yêu cầu thêm</label>
            <textarea 
              rows={3}
              placeholder="Ví dụ: Da em nhạy cảm, xin chuẩn bị mỹ phẩm nhẹ dịu..."
              className="w-full bg-[#1e293b] border border-[#334155] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
              value={bookingData.notes}
              onChange={e => setBookingData({ ...bookingData, notes: e.target.value })}
            />
          </div>

          <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-start gap-2.5 mt-2">
            <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-400 leading-normal">
              Lịch hẹn của bạn sẽ được phê duyệt tự động ngay lập tức. Hệ thống sẽ gửi tin nhắn nhắc nhở qua Zalo ZNS trước giờ hẹn 24 tiếng.
            </p>
          </div>

          <Button variant="primary" type="submit" loading={loading} className="w-full mt-2">
            Xác nhận đặt lịch
          </Button>
        </form>
      </Card>
    </div>
  );
}
