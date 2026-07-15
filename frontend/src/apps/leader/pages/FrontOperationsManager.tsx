import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  ShoppingBag, 
  Award, 
  Plus, 
  Clock, 
  Trash2, 
  Check, 
  User, 
  Phone,
  Tag,
  ChevronRight,
  Sparkles,
  Search,
  DollarSign
} from 'lucide-react';
import { Button, Card, Table, Input, Badge, Modal, useToast, Skeleton, EmptyState } from '../../../shared/components/ui';

export default function FrontOperationsManager() {
  const { showToast } = useToast();
  
  // Tab states: 'bookings' | 'pos' | 'loyalty'
  const [activeTab, setActiveTab] = useState<'bookings' | 'pos' | 'loyalty'>('bookings');
  
  const [bookings, setBookings] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // POS State
  const [cart, setCart] = useState<{ id: string; name: string; price: number; quantity: number }[]>([]);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [openingBalance, setOpeningBalance] = useState(1000000);

  // Booking State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [newBooking, setNewBooking] = useState({
    customer_name: '',
    customer_phone: '',
    service_name: 'Gói chăm sóc da chuyên sâu NextFlow',
    booking_time: new Date(Date.now() + 86400000).toISOString().slice(0, 16), // tomorrow
    notes: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const bookRes = await fetch('/api/v1/front/bookings', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      }).then(r => r.json());

      const sessRes = await fetch('/api/v1/front/pos-sessions', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      }).then(r => r.json());

      const prodRes = await fetch('/api/v1/inventory/products', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      }).then(r => r.json());

      if (bookRes.status === 'success') setBookings(bookRes.data);
      if (sessRes.status === 'success') {
        setSessions(sessRes.data);
        const active = sessRes.data.find((s: any) => s.status === 'OPEN');
        if (active) setActiveSession(active);
      }
      if (prodRes.status === 'success') {
        setProducts(prodRes.data);
      } else {
        // Fallback mockup products if inventory is empty
        setProducts([
          { id: '1', sku: 'SV-001', name: 'Combo Massage Thảo Dược', sell_price: 350000, category: 'Dịch vụ' },
          { id: '2', sku: 'SV-002', name: 'Gói Chăm Sóc Da SkinClinic', sell_price: 490000, category: 'Dịch vụ' },
          { id: '3', sku: 'PR-001', name: 'Kem Chống Nắng Tế Bào Gốc', sell_price: 720000, category: 'Mỹ phẩm' },
        ]);
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Không thể tải dữ liệu nghiệp vụ trước.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/front/pos-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ opening_balance: openingBalance })
      }).then(r => r.json());

      if (res.status === 'success') {
        showToast('success', 'Mở ca bán hàng POS thành công!');
        setSessionModalOpen(false);
        fetchData();
      } else {
        showToast('error', res.error || 'Có lỗi xảy ra.');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Lỗi kết nối máy chủ.');
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...newBooking,
        booking_time: new Date(newBooking.booking_time).toISOString(),
      };

      const res = await fetch('/api/v1/front/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      }).then(r => r.json());

      if (res.status === 'success') {
        showToast('success', 'Tạo lịch đặt chỗ thành công!');
        setBookingModalOpen(false);
        fetchData();
      } else {
        showToast('error', res.error || 'Có lỗi xảy ra.');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Lỗi kết nối máy chủ.');
    }
  };

  const handleCheckout = async () => {
    if (!activeSession) {
      showToast('error', 'Vui lòng mở ca bán hàng POS trước.');
      return;
    }
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    try {
      const res = await fetch('/api/v1/front/pos-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          session_id: activeSession.id,
          total_amount: totalAmount,
          items: cart
        })
      }).then(r => r.json());

      if (res.status === 'success') {
        showToast('success', 'Thanh toán đơn hàng thành công!');
        setCart([]);
        setCheckoutModalOpen(false);
        fetchData();
      } else {
        showToast('error', res.error || 'Lỗi thanh toán.');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Lỗi kết nối máy chủ.');
    }
  };

  // Cart operations
  const addToCart = (product: any) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { id: product.id, name: product.name, price: product.sell_price || 350000, quantity: 1 }]);
    }
    showToast('success', `Đã thêm ${product.name} vào giỏ.`);
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const totalCartAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShoppingBag className="text-indigo-400" /> Nghiệp Vụ Bán Hàng & Đặt Lịch (POS / Booking)
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Ghi nhận đơn hàng tại quầy nhanh (POS), lên lịch hẹn dịch vụ và chăm sóc khách hàng thân thiết.
          </p>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-white/5 pb-2 gap-3.5">
        {(['bookings', 'pos', 'loyalty'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-xs font-semibold px-2 py-1.5 transition-all relative ${
              activeTab === tab ? 'text-indigo-400 font-bold' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab === 'bookings' && 'Lịch hẹn (Booking)'}
            {tab === 'pos' && 'Bán hàng tại quầy (POS)'}
            {tab === 'loyalty' && 'Thành viên & Loyalty'}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && <Skeleton variant="table" />}

      {/* Tab contents */}
      {!loading && (
        <>
          {activeTab === 'bookings' && (
            <Card variant="default" className="p-5 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Calendar size={18} className="text-indigo-400" /> Sổ Lịch Hẹn Dịch Vụ
                </h3>
                <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setBookingModalOpen(true)}>
                  Tạo lịch hẹn mới
                </Button>
              </div>

              {bookings.length === 0 ? (
                <EmptyState title="Chưa có lịch hẹn nào" description="Lên lịch hẹn làm dịch vụ cho khách hàng để tối ưu công suất phòng máy." action={
                  <Button variant="primary" size="sm" onClick={() => setBookingModalOpen(true)}>Lên lịch hẹn</Button>
                } />
              ) : (
                <Table headers={['Khách hàng', 'Số điện thoại', 'Dịch vụ yêu cầu', 'Thời gian hẹn', 'Trạng thái', 'Ghi chú']}>
                  {bookings.map(book => (
                    <tr key={book.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3 font-semibold text-white">{book.customer_name}</td>
                      <td className="px-5 py-3 text-slate-300">{book.customer_phone}</td>
                      <td className="px-5 py-3 text-slate-300">{book.service_name}</td>
                      <td className="px-5 py-3 text-indigo-400 font-bold">
                        {new Date(book.booking_time).toLocaleString('vi-VN')}
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={book.status === 'CONFIRMED' ? 'success' : 'neutral'}>
                          {book.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-slate-400 text-xs">{book.notes || ''}</td>
                    </tr>
                  ))}
                </Table>
              )}
            </Card>
          )}

          {activeTab === 'pos' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Product Catalog list */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                <Card variant="default" className="p-5 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-white">Danh mục mặt hàng tại quầy</h3>
                    {!activeSession && (
                      <Button variant="primary" size="sm" onClick={() => setSessionModalOpen(true)}>
                        Mở ca bán hàng
                      </Button>
                    )}
                    {activeSession && (
                      <Badge variant="success">Ca bán hàng đang hoạt động</Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {products.map(prod => (
                      <div key={prod.id} className="bg-[#12141c] border border-[#242936] p-4 rounded-xl flex flex-col justify-between gap-3 hover:border-indigo-500/55 transition-colors">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-bold">{prod.sku}</span>
                          <h4 className="text-xs font-bold text-white mt-1 line-clamp-2">{prod.name}</h4>
                          <span className="text-[10px] text-slate-400 block mt-1">{prod.category || 'Dịch vụ'}</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs font-bold text-emerald-400">{(prod.sell_price || 350000).toLocaleString()}đ</span>
                          <Button variant="primary" size="xs" onClick={() => addToCart(prod)}>
                            Chọn
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* POS Cart panel */}
              <Card variant="default" className="p-5 flex flex-col gap-4 sticky top-6 self-start">
                <h3 className="text-sm font-bold text-white">Giỏ hàng thanh toán</h3>
                {cart.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500">Giỏ hàng trống. Chọn sản phẩm bên trái.</div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="max-h-48 overflow-y-auto flex flex-col gap-2.5">
                      {cart.map(item => (
                        <div key={item.id} className="flex justify-between items-center text-xs bg-[#12141c] p-2.5 rounded-lg border border-[#242936]">
                          <div className="flex-1 min-w-0 pr-2">
                            <span className="font-bold text-slate-200 block truncate">{item.name}</span>
                            <span className="text-[10px] text-slate-500">{item.price.toLocaleString()}đ x {item.quantity}</span>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="text-rose-500 hover:text-rose-400 p-1">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-[#242936] pt-3 flex flex-col gap-2.5">
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Tạm tính:</span>
                        <span>{totalCartAmount.toLocaleString()} VND</span>
                      </div>
                      <div className="flex justify-between text-sm font-black text-white">
                        <span>Tổng cộng:</span>
                        <span className="text-emerald-400">{totalCartAmount.toLocaleString()} VND</span>
                      </div>

                      <Button variant="primary" className="w-full mt-2" onClick={() => setCheckoutModalOpen(true)}>
                        Thanh toán (VietQR)
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          )}

          {activeTab === 'loyalty' && (
            <Card variant="default" className="p-5 flex flex-col gap-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Award size={18} className="text-indigo-400 animate-bounce" /> Hạng Thành Viên & Điểm Tích Lũy (Loyalty)
              </h3>
              <Table headers={['Khách hàng', 'Số điện thoại', 'Hạng thành viên', 'Điểm tích lũy', 'Tổng chi tiêu', 'Ví Web3 Wallet']}>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3 font-semibold text-white">Nguyễn Văn A</td>
                  <td className="px-5 py-3 text-slate-300">0987654321</td>
                  <td className="px-5 py-3">
                    <Badge variant="primary">Diamond Member</Badge>
                  </td>
                  <td className="px-5 py-3 font-bold text-indigo-400">1,250 điểm</td>
                  <td className="px-5 py-3 font-semibold text-slate-200">12,500,000 VND</td>
                  <td className="px-5 py-3 text-slate-400 font-mono text-xs">0x71C...3A9f (50.5 NX)</td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3 font-semibold text-white">Trần Thị B</td>
                  <td className="px-5 py-3 text-slate-300">0912345678</td>
                  <td className="px-5 py-3">
                    <Badge variant="success">Gold Member</Badge>
                  </td>
                  <td className="px-5 py-3 font-bold text-indigo-400">420 điểm</td>
                  <td className="px-5 py-3 font-semibold text-slate-200">4,200,000 VND</td>
                  <td className="px-5 py-3 text-slate-400 font-mono text-xs">0x4D3...1B7c (10.2 NX)</td>
                </tr>
              </Table>
            </Card>
          )}
        </>
      )}

      {/* POS Session Modal */}
      <Modal isOpen={sessionModalOpen} onClose={() => setSessionModalOpen(false)} title="Mở ca bán hàng POS mới">
        <form onSubmit={handleOpenSession} className="flex flex-col gap-4">
          <Input 
            label="Số tiền mặt đầu ca (VND)" 
            type="number" 
            required 
            value={openingBalance} 
            onChange={e => setOpeningBalance(Number(e.target.value))}
          />
          <div className="flex justify-end gap-2.5 mt-2">
            <Button variant="outline" type="button" onClick={() => setSessionModalOpen(false)}>Hủy</Button>
            <Button variant="primary" type="submit">Mở ca</Button>
          </div>
        </form>
      </Modal>

      {/* Checkout Modal */}
      <Modal isOpen={checkoutModalOpen} onClose={() => setCheckoutModalOpen(false)} title="Xác nhận thanh toán đơn hàng">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="text-xs text-slate-400">Quét mã VietQR để thanh toán nhanh</span>
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            {/* Generate VietQR mockup dynamic URL */}
            <img 
              src={`https://img.vietqr.io/image/970415-113366668888-compact2.jpg?amount=${totalCartAmount}&addInfo=POSPAY${Date.now().toString().slice(-6)}&accountName=NEXTFLOW%20OS`} 
              alt="VietQR payment code"
              className="w-48 h-48 object-contain"
            />
          </div>
          <div>
            <span className="text-lg font-black text-white">{totalCartAmount.toLocaleString()} VND</span>
            <span className="text-[10px] text-slate-500 block mt-1">Nội dung chuyển khoản tự động</span>
          </div>

          <div className="flex justify-end gap-2.5 w-full mt-4 border-t border-[#242936] pt-4">
            <Button variant="outline" onClick={() => setCheckoutModalOpen(false)}>Hủy bỏ</Button>
            <Button variant="primary" icon={<Check size={14} />} onClick={handleCheckout}>
              Xác nhận đã thanh toán
            </Button>
          </div>
        </div>
      </Modal>

      {/* Booking Modal */}
      <Modal isOpen={bookingModalOpen} onClose={() => setBookingModalOpen(false)} title="Lên lịch hẹn đặt chỗ mới">
        <form onSubmit={handleCreateBooking} className="flex flex-col gap-4">
          <Input 
            label="Họ tên khách hàng" 
            placeholder="Tên khách hàng đặt lịch" 
            required 
            value={newBooking.customer_name} 
            onChange={e => setNewBooking({ ...newBooking, customer_name: e.target.value })}
          />
          <Input 
            label="Số điện thoại" 
            placeholder="Số điện thoại liên hệ" 
            required 
            value={newBooking.customer_phone} 
            onChange={e => setNewBooking({ ...newBooking, customer_phone: e.target.value })}
          />
          <Input 
            label="Dịch vụ yêu cầu" 
            required 
            value={newBooking.service_name} 
            onChange={e => setNewBooking({ ...newBooking, service_name: e.target.value })}
          />
          <Input 
            label="Thời gian đặt chỗ" 
            type="datetime-local" 
            required 
            value={newBooking.booking_time} 
            onChange={e => setNewBooking({ ...newBooking, booking_time: e.target.value })}
          />
          <Input 
            label="Ghi chú chi tiết" 
            value={newBooking.notes} 
            onChange={e => setNewBooking({ ...newBooking, notes: e.target.value })}
          />
          <div className="flex justify-end gap-2.5 mt-2">
            <Button variant="outline" type="button" onClick={() => setBookingModalOpen(false)}>Hủy</Button>
            <Button variant="primary" type="submit">Lên lịch hẹn</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
