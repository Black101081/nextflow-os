import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight,
  Plus, 
  FileText, 
  Users,
  ShieldCheck,
  CreditCard,
  Building,
  Activity,
  Download
} from 'lucide-react';
import { Button, Card, Table, Input, Badge, Modal, useToast, Skeleton, EmptyState } from '../../../shared/components/ui';
import { apiService } from '../../../shared/services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function FinanceManager() {
  const { showToast } = useToast();
  
  // Tab states: 'overview' | 'accounts' | 'transactions' | 'invoices' | 'tax'
  const [activeTab, setActiveTab] = useState<'overview' | 'accounts' | 'transactions' | 'invoices' | 'tax'>('overview');
  
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // Form states
  const [newAccount, setNewAccount] = useState({
    name: '',
    account_type: 'CASH', // CASH, BANK
    balance: 0,
    currency: 'VND',
    bank_name: '',
    account_number: '',
  });

  const [newTx, setNewTx] = useState({
    account_id: '',
    transaction_type: 'EXPENSE', // INCOME, EXPENSE
    category: 'Vật tư',
    amount: 0,
    description: '',
    counterpart_name: '',
    payment_method: 'CASH',
    transaction_date: new Date().toISOString().split('T')[0],
  });

  const [newInvoice, setNewInvoice] = useState({
    invoice_number: 'INV-' + Date.now().toString().slice(-6),
    invoice_type: 'SALES', // SALES, PURCHASE
    subtotal: 0,
    tax_rate: 10,
    tax_amount: 0,
    total: 0,
    notes: '',
    items: [{ name: 'Dịch vụ tư vấn NextFlow', quantity: 1, price: 0 }]
  });

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      // For standard API endpoints
      const accountsRes = await fetch('/api/v1/finance/accounts', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      }).then(r => r.json());

      const txRes = await fetch('/api/v1/finance/transactions', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      }).then(r => r.json());

      const invRes = await fetch('/api/v1/finance/invoices', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      }).then(r => r.json());

      if (accountsRes.status === 'success') setAccounts(accountsRes.data);
      if (txRes.status === 'success') setTransactions(txRes.data);
      if (invRes.status === 'success') setInvoices(invRes.data);
    } catch (err) {
      console.error(err);
      showToast('error', 'Không thể tải dữ liệu tài chính.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/finance/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newAccount)
      }).then(r => r.json());

      if (res.status === 'success') {
        showToast('success', 'Tạo tài khoản quỹ thành công!');
        setIsAccountModalOpen(false);
        fetchFinanceData();
      } else {
        showToast('error', res.error || 'Có lỗi xảy ra.');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Lỗi kết nối máy chủ.');
    }
  };

  const handleCreateTx = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/finance/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newTx)
      }).then(r => r.json());

      if (res.status === 'success') {
        showToast('success', 'Ghi nhận giao dịch thành công!');
        setIsTxModalOpen(false);
        fetchFinanceData();
      } else {
        showToast('error', res.error || 'Có lỗi xảy ra.');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Lỗi kết nối máy chủ.');
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const subtotal = newInvoice.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const tax_amount = subtotal * (newInvoice.tax_rate / 100);
    const total = subtotal + tax_amount;

    const payload = {
      ...newInvoice,
      subtotal,
      tax_amount,
      total,
      items: newInvoice.items
    };

    try {
      const res = await fetch('/api/v1/finance/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      }).then(r => r.json());

      if (res.status === 'success') {
        showToast('success', 'Tạo hóa đơn thành công!');
        setIsInvoiceModalOpen(false);
        fetchFinanceData();
      } else {
        showToast('error', res.error || 'Có lỗi xảy ra.');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Lỗi kết nối máy chủ.');
    }
  };

  // Summaries
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalIncome = transactions.filter(t => t.transaction_type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.transaction_type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);

  // Mock chart data for trends
  const chartData = [
    { name: 'Tháng 1', income: 45000000, expense: 32000000 },
    { name: 'Tháng 2', income: 52000000, expense: 41000000 },
    { name: 'Tháng 3', income: 49000000, expense: 35000000 },
    { name: 'Tháng 4', income: 63000000, expense: 45000000 },
    { name: 'Tháng 5', income: totalIncome || 75000000, expense: totalExpense || 48000000 },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <DollarSign className="text-indigo-400" /> Quản lý Tài chính & Kế toán
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Theo dõi ngân sách, sổ quỹ mặt/ngân hàng, công nợ và báo cáo thuế của doanh nghiệp.
          </p>
        </div>
        <div className="flex gap-2.5">
          <Button variant="outline" size="sm" icon={<Download size={14} />}>
            Xuất Excel
          </Button>
          <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setIsTxModalOpen(true)}>
            Ghi nhận Thu/Chi
          </Button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-white/5 pb-2 gap-3.5">
        {(['overview', 'accounts', 'transactions', 'invoices', 'tax'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-xs font-semibold px-2 py-1.5 transition-all relative ${
              activeTab === tab ? 'text-indigo-400 font-bold' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab === 'overview' && 'Tổng quan'}
            {tab === 'accounts' && 'Sổ quỹ'}
            {tab === 'transactions' && 'Lịch sử Thu/Chi'}
            {tab === 'invoices' && 'Hóa đơn'}
            {tab === 'tax' && 'Thuế & Thuế TNCN'}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Loading Skeleton */}
      {loading && <Skeleton variant="table" />}

      {/* Tab Contents */}
      {!loading && (
        <>
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Card variant="glass" className="p-5 flex items-center justify-between border-indigo-500/10">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tổng Số Quỹ</span>
                    <span className="text-xl font-black text-white">{totalBalance.toLocaleString()} VND</span>
                  </div>
                  <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
                    <DollarSign size={22} />
                  </div>
                </Card>
                <Card variant="glass" className="p-5 flex items-center justify-between border-emerald-500/10">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tổng Thu (Tháng này)</span>
                    <span className="text-xl font-black text-emerald-400 flex items-center gap-1">
                      {totalIncome.toLocaleString()} VND <ArrowUpRight size={16} />
                    </span>
                  </div>
                  <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
                    <TrendingUp size={22} />
                  </div>
                </Card>
                <Card variant="glass" className="p-5 flex items-center justify-between border-rose-500/10">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tổng Chi (Tháng này)</span>
                    <span className="text-xl font-black text-rose-400 flex items-center gap-1">
                      {totalExpense.toLocaleString()} VND <ArrowDownRight size={16} />
                    </span>
                  </div>
                  <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20 text-rose-400">
                    <TrendingDown size={22} />
                  </div>
                </Card>
              </div>

              {/* Chart & Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card variant="default" className="p-5 lg:col-span-2 flex flex-col gap-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Biểu đồ dòng tiền</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#242936" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                        <YAxis stroke="#94a3b8" fontSize={11} />
                        <Tooltip contentStyle={{ backgroundColor: '#12141c', borderColor: '#242936', borderRadius: 8 }} />
                        <Area type="monotone" dataKey="income" name="Thu" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" />
                        <Area type="monotone" dataKey="expense" name="Chi" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExpense)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Quick actions panel */}
                <Card variant="default" className="p-5 flex flex-col gap-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Giao dịch nhanh</h3>
                  <div className="flex flex-col gap-2.5">
                    <Button variant="outline" className="w-full justify-start text-left" icon={<Plus size={14} />} onClick={() => setIsAccountModalOpen(true)}>
                      Thêm tài khoản quỹ
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-left" icon={<FileText size={14} />} onClick={() => setIsInvoiceModalOpen(true)}>
                      Tạo hóa đơn bán hàng
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'accounts' && (
            <Card variant="default" className="p-5 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white">Danh sách Sổ Quỹ</h3>
                <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setIsAccountModalOpen(true)}>
                  Thêm Tài Khoản Quỹ
                </Button>
              </div>

              {accounts.length === 0 ? (
                <EmptyState title="Chưa có tài khoản quỹ nào" description="Hãy tạo tài khoản tiền mặt hoặc ngân hàng để theo dõi nguồn vốn." action={
                  <Button variant="primary" size="sm" onClick={() => setIsAccountModalOpen(true)}>Thêm tài khoản</Button>
                } />
              ) : (
                <Table headers={['Tên tài khoản', 'Loại', 'Số dư', 'Số tài khoản', 'Trạng thái']}>
                  {accounts.map(acc => (
                    <tr key={acc.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3 font-semibold text-white">{acc.name}</td>
                      <td className="px-5 py-3">
                        <Badge variant={acc.account_type === 'BANK' ? 'primary' : 'neutral'}>
                          {acc.account_type === 'BANK' ? 'Ngân hàng' : 'Tiền mặt'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 font-bold text-slate-200">{acc.balance.toLocaleString()} VND</td>
                      <td className="px-5 py-3 text-slate-400">{acc.account_number || 'N/A'}</td>
                      <td className="px-5 py-3">
                        <Badge variant={acc.is_active ? 'success' : 'danger'}>
                          {acc.is_active ? 'Hoạt động' : 'Tạm khóa'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </Table>
              )}
            </Card>
          )}

          {activeTab === 'transactions' && (
            <Card variant="default" className="p-5 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white">Lịch sử giao dịch quỹ</h3>
                <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setIsTxModalOpen(true)}>
                  Ghi nhận Thu/Chi
                </Button>
              </div>

              {transactions.length === 0 ? (
                <EmptyState title="Chưa có giao dịch nào" description="Ghi nhận thu chi để cập nhật ngân sách trực tiếp." />
              ) : (
                <Table headers={['Ngày', 'Tài khoản', 'Loại', 'Danh mục', 'Số tiền', 'Đối tác', 'Mô tả']}>
                  {transactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3 text-slate-300">{tx.transaction_date}</td>
                      <td className="px-5 py-3 text-slate-300">{tx.account_name}</td>
                      <td className="px-5 py-3">
                        <Badge variant={tx.transaction_type === 'INCOME' ? 'success' : 'danger'}>
                          {tx.transaction_type === 'INCOME' ? 'Thu' : 'Chi'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-slate-300">{tx.category}</td>
                      <td className={`px-5 py-3 font-bold ${tx.transaction_type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {tx.transaction_type === 'INCOME' ? '+' : '-'}{tx.amount.toLocaleString()} VND
                      </td>
                      <td className="px-5 py-3 text-slate-300">{tx.counterpart_name || 'N/A'}</td>
                      <td className="px-5 py-3 text-slate-400">{tx.description || ''}</td>
                    </tr>
                  ))}
                </Table>
              )}
            </Card>
          )}

          {activeTab === 'invoices' && (
            <Card variant="default" className="p-5 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white">Hóa đơn điện tử</h3>
                <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setIsInvoiceModalOpen(true)}>
                  Tạo Hóa Đơn Mới
                </Button>
              </div>

              {invoices.length === 0 ? (
                <EmptyState title="Chưa có hóa đơn nào" description="Tạo hóa đơn bán hàng để gửi khách hàng thanh toán qua VietQR." />
              ) : (
                <Table headers={['Số hóa đơn', 'Loại', 'Tổng cộng', 'Thuế', 'Ngày tạo', 'Trạng thái']}>
                  {invoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3 font-semibold text-white">{inv.invoice_number}</td>
                      <td className="px-5 py-3">
                        <Badge variant={inv.invoice_type === 'SALES' ? 'primary' : 'warning'}>
                          {inv.invoice_type === 'SALES' ? 'Bán ra' : 'Mua vào'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 font-bold text-slate-200">{inv.total.toLocaleString()} VND</td>
                      <td className="px-5 py-3 text-slate-400">{inv.tax_amount.toLocaleString()} VND</td>
                      <td className="px-5 py-3 text-slate-400">{inv.created_at.slice(0, 10)}</td>
                      <td className="px-5 py-3">
                        <Badge variant={inv.status === 'PAID' ? 'success' : 'neutral'}>
                          {inv.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </Table>
              )}
            </Card>
          )}

          {activeTab === 'tax' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card variant="default" className="p-5 flex flex-col gap-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Thuế Giá Trị Gia Tăng (VAT)</h3>
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400 text-sm">Doanh thu chịu thuế</span>
                    <span className="text-white font-bold">120,000,000 VND</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400 text-sm">Thuế suất</span>
                    <span className="text-white font-bold">10%</span>
                  </div>
                  <div className="flex justify-between pb-2">
                    <span className="text-slate-400 text-sm">Thuế VAT phải nộp</span>
                    <span className="text-rose-400 font-bold">12,000,000 VND</span>
                  </div>
                </div>
              </Card>

              <Card variant="default" className="p-5 flex flex-col gap-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Thuế Thu Nhập Cá Nhân (PIT)</h3>
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400 text-sm">Tổng lương đóng bảo hiểm</span>
                    <span className="text-white font-bold">45,000,000 VND</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400 text-sm">Số người phụ thuộc</span>
                    <span className="text-white font-bold">2</span>
                  </div>
                  <div className="flex justify-between pb-2">
                    <span className="text-slate-400 text-sm">Thuế TNCN tạm nộp</span>
                    <span className="text-rose-400 font-bold">1,850,000 VND</span>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </>
      )}

      {/* Account Modal */}
      <Modal isOpen={isAccountModalOpen} onClose={() => setIsAccountModalOpen(false)} title="Thêm tài khoản quỹ mới">
        <form onSubmit={handleCreateAccount} className="flex flex-col gap-4">
          <Input 
            label="Tên tài khoản quỹ" 
            placeholder="Ví dụ: Quỹ Tiền Mặt, VCB Công Ty" 
            required 
            value={newAccount.name} 
            onChange={e => setNewAccount({ ...newAccount, name: e.target.value })}
          />
          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-400 font-semibold">Loại tài khoản</span>
            <select 
              className="bg-[#12141c] border border-[#242936] text-white p-2 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              value={newAccount.account_type}
              onChange={e => setNewAccount({ ...newAccount, account_type: e.target.value })}
            >
              <option value="CASH">Tiền mặt</option>
              <option value="BANK">Ngân hàng</option>
            </select>
          </div>
          <Input 
            label="Số dư ban đầu (VND)" 
            type="number" 
            value={newAccount.balance} 
            onChange={e => setNewAccount({ ...newAccount, balance: Number(e.target.value) })}
          />
          {newAccount.account_type === 'BANK' && (
            <>
              <Input 
                label="Tên ngân hàng" 
                placeholder="Ví dụ: Vietcombank" 
                value={newAccount.bank_name} 
                onChange={e => setNewAccount({ ...newAccount, bank_name: e.target.value })}
              />
              <Input 
                label="Số tài khoản" 
                placeholder="Số tài khoản ngân hàng" 
                value={newAccount.account_number} 
                onChange={e => setNewAccount({ ...newAccount, account_number: e.target.value })}
              />
            </>
          )}
          <div className="flex justify-end gap-2.5 mt-2">
            <Button variant="outline" type="button" onClick={() => setIsAccountModalOpen(false)}>Hủy</Button>
            <Button variant="primary" type="submit">Lưu lại</Button>
          </div>
        </form>
      </Modal>

      {/* Transaction Modal */}
      <Modal isOpen={isTxModalOpen} onClose={() => setIsTxModalOpen(false)} title="Ghi nhận giao dịch quỹ">
        <form onSubmit={handleCreateTx} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-400 font-semibold">Chọn tài khoản nguồn/đích</span>
            <select 
              className="bg-[#12141c] border border-[#242936] text-white p-2 rounded-lg text-sm focus:outline-none"
              required
              value={newTx.account_id}
              onChange={e => setNewTx({ ...newTx, account_id: e.target.value })}
            >
              <option value="">-- Chọn tài khoản --</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name} ({acc.balance.toLocaleString()} VND)</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-400 font-semibold">Loại giao dịch</span>
            <select 
              className="bg-[#12141c] border border-[#242936] text-white p-2 rounded-lg text-sm focus:outline-none"
              value={newTx.transaction_type}
              onChange={e => setNewTx({ ...newTx, transaction_type: e.target.value })}
            >
              <option value="EXPENSE">Chi tiền</option>
              <option value="INCOME">Thu tiền</option>
            </select>
          </div>
          <Input 
            label="Số tiền (VND)" 
            type="number" 
            required 
            value={newTx.amount} 
            onChange={e => setNewTx({ ...newTx, amount: Number(e.target.value) })}
          />
          <Input 
            label="Danh mục phân loại" 
            placeholder="Ví dụ: Vật tư, Tiếp khách, Doanh thu" 
            required 
            value={newTx.category} 
            onChange={e => setNewTx({ ...newTx, category: e.target.value })}
          />
          <Input 
            label="Đối tác/Khách hàng" 
            placeholder="Tên đối tác hoặc khách hàng" 
            value={newTx.counterpart_name} 
            onChange={e => setNewTx({ ...newTx, counterpart_name: e.target.value })}
          />
          <Input 
            label="Mô tả chi tiết" 
            value={newTx.description} 
            onChange={e => setNewTx({ ...newTx, description: e.target.value })}
          />
          <div className="flex justify-end gap-2.5 mt-2">
            <Button variant="outline" type="button" onClick={() => setIsTxModalOpen(false)}>Hủy</Button>
            <Button variant="primary" type="submit">Ghi nhận</Button>
          </div>
        </form>
      </Modal>

      {/* Invoice Modal */}
      <Modal isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} title="Tạo hóa đơn điện tử mới">
        <form onSubmit={handleCreateInvoice} className="flex flex-col gap-4">
          <Input 
            label="Mã hóa đơn" 
            required 
            value={newInvoice.invoice_number} 
            onChange={e => setNewInvoice({ ...newInvoice, invoice_number: e.target.value })}
          />
          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-400 font-semibold">Loại hóa đơn</span>
            <select 
              className="bg-[#12141c] border border-[#242936] text-white p-2 rounded-lg text-sm focus:outline-none"
              value={newInvoice.invoice_type}
              onChange={e => setNewInvoice({ ...newInvoice, invoice_type: e.target.value })}
            >
              <option value="SALES">Bán hàng (Xuất hóa đơn)</option>
              <option value="PURCHASE">Mua hàng (Đầu vào)</option>
            </select>
          </div>
          
          <div className="border-t border-[#242936] pt-3 mt-1">
            <span className="text-xs text-slate-400 font-bold block mb-2">Chi tiết mặt hàng</span>
            <div className="flex gap-2">
              <Input 
                placeholder="Tên sản phẩm/dịch vụ" 
                className="flex-1"
                value={newInvoice.items[0].name}
                onChange={e => {
                  const updatedItems = [...newInvoice.items];
                  updatedItems[0].name = e.target.value;
                  setNewInvoice({ ...newInvoice, items: updatedItems });
                }}
              />
              <Input 
                type="number" 
                placeholder="Số lượng" 
                className="w-16"
                value={newInvoice.items[0].quantity}
                onChange={e => {
                  const updatedItems = [...newInvoice.items];
                  updatedItems[0].quantity = Number(e.target.value);
                  setNewInvoice({ ...newInvoice, items: updatedItems });
                }}
              />
              <Input 
                type="number" 
                placeholder="Đơn giá" 
                className="w-28"
                value={newInvoice.items[0].price}
                onChange={e => {
                  const updatedItems = [...newInvoice.items];
                  updatedItems[0].price = Number(e.target.value);
                  setNewInvoice({ ...newInvoice, items: updatedItems });
                }}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 mt-2">
            <Button variant="outline" type="button" onClick={() => setIsInvoiceModalOpen(false)}>Hủy</Button>
            <Button variant="primary" type="submit">Tạo hóa đơn</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
