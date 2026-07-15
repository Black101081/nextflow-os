import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Calendar, 
  CreditCard, 
  GitBranch, 
  CheckCircle,
  AlertCircle,
  Clock,
  MapPin,
  Plus
} from 'lucide-react';
import { Button, Card, Table, Input, Badge, Modal, useToast, Skeleton, EmptyState } from '../../../shared/components/ui';

export default function HRManager() {
  const { showToast } = useToast();
  
  // Tab states: 'employees' | 'attendance' | 'payroll' | 'org'
  const [activeTab, setActiveTab] = useState<'employees' | 'attendance' | 'payroll' | 'org'>('employees');
  
  const [employees, setEmployees] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);

  // Form states
  const [newEmployee, setNewEmployee] = useState({
    employee_code: '',
    full_name: '',
    phone: '',
    email: '',
    position: 'Nhân viên kinh doanh',
    department: 'Kinh doanh',
    start_date: new Date().toISOString().split('T')[0],
    base_salary: 0,
  });

  const [newAttendance, setNewAttendance] = useState({
    employee_id: '',
    date: new Date().toISOString().split('T')[0],
    check_in_time: new Date().toISOString(),
    check_out_time: new Date().toISOString(),
    status: 'PRESENT',
  });

  const fetchHRData = async () => {
    setLoading(true);
    try {
      const empRes = await fetch('/api/v1/hr/employees', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      }).then(r => r.json());

      const attRes = await fetch('/api/v1/hr/attendance', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      }).then(r => r.json());

      if (empRes.status === 'success') setEmployees(empRes.data);
      if (attRes.status === 'success') setAttendance(attRes.data);
    } catch (err) {
      console.error(err);
      showToast('error', 'Không thể tải dữ liệu nhân sự.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHRData();
  }, []);

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/hr/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newEmployee)
      }).then(r => r.json());

      if (res.status === 'success') {
        showToast('success', 'Thêm nhân viên thành công!');
        setIsEmployeeModalOpen(false);
        fetchHRData();
      } else {
        showToast('error', res.error || 'Có lỗi xảy ra.');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Lỗi kết nối máy chủ.');
    }
  };

  const handleCreateAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/hr/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newAttendance)
      }).then(r => r.json());

      if (res.status === 'success') {
        showToast('success', 'Ghi nhận chấm công thành công!');
        setIsAttendanceModalOpen(false);
        fetchHRData();
      } else {
        showToast('error', res.error || 'Có lỗi xảy ra.');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Lỗi kết nối máy chủ.');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users className="text-indigo-400" /> Quản lý Nhân sự & Bảng lương
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Theo dõi hồ sơ nhân sự, lịch sử chấm công, tính lương tự động và sơ đồ tổ chức doanh nghiệp.
          </p>
        </div>
        <div className="flex gap-2.5">
          <Button variant="outline" size="sm" icon={<Calendar size={14} />} onClick={() => setIsAttendanceModalOpen(true)}>
            Chấm công nhanh
          </Button>
          <Button variant="primary" size="sm" icon={<UserPlus size={14} />} onClick={() => setIsEmployeeModalOpen(true)}>
            Thêm nhân viên
          </Button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-white/5 pb-2 gap-3.5">
        {(['employees', 'attendance', 'payroll', 'org'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-xs font-semibold px-2 py-1.5 transition-all relative ${
              activeTab === tab ? 'text-indigo-400 font-bold' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab === 'employees' && 'Danh sách nhân viên'}
            {tab === 'attendance' && 'Bảng chấm công'}
            {tab === 'payroll' && 'Bảng tính lương'}
            {tab === 'org' && 'Sơ đồ tổ chức'}
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
          {activeTab === 'employees' && (
            <Card variant="default" className="p-5 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white">Hồ Sơ Nhân Sự</h3>
                <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setIsEmployeeModalOpen(true)}>
                  Thêm nhân viên mới
                </Button>
              </div>

              {employees.length === 0 ? (
                <EmptyState title="Chưa có nhân viên nào" description="Hãy thêm nhân viên đầu tiên để thiết lập quyền truy cập." action={
                  <Button variant="primary" size="sm" onClick={() => setIsEmployeeModalOpen(true)}>Thêm nhân viên</Button>
                } />
              ) : (
                <Table headers={['Mã NV', 'Họ & Tên', 'Số điện thoại', 'Email', 'Phòng ban', 'Chức vụ', 'Trạng thái']}>
                  {employees.map(emp => (
                    <tr key={emp.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3 font-semibold text-white">{emp.employee_code || 'N/A'}</td>
                      <td className="px-5 py-3 text-slate-200">{emp.full_name}</td>
                      <td className="px-5 py-3 text-slate-400">{emp.phone || 'N/A'}</td>
                      <td className="px-5 py-3 text-slate-400">{emp.email || 'N/A'}</td>
                      <td className="px-5 py-3 text-slate-300">{emp.department || 'N/A'}</td>
                      <td className="px-5 py-3 text-slate-300">{emp.position || 'N/A'}</td>
                      <td className="px-5 py-3">
                        <Badge variant={emp.status === 'ACTIVE' ? 'success' : 'danger'}>
                          {emp.status === 'ACTIVE' ? 'Đang làm việc' : 'Đã nghỉ việc'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </Table>
              )}
            </Card>
          )}

          {activeTab === 'attendance' && (
            <Card variant="default" className="p-5 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white">Nhật Ký Chấm Công</h3>
                <Button variant="primary" size="sm" icon={<Clock size={14} />} onClick={() => setIsAttendanceModalOpen(true)}>
                  Chấm công thủ công
                </Button>
              </div>

              {attendance.length === 0 ? (
                <EmptyState title="Chưa có dữ liệu chấm công" description="Nhân viên có thể check-in trên di động để ghi nhận giờ làm việc." />
              ) : (
                <Table headers={['Ngày', 'Nhân viên', 'Giờ checkin', 'Giờ checkout', 'Số giờ làm', 'Trạng thái']}>
                  {attendance.map(att => (
                    <tr key={att.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3 text-slate-300">{att.date}</td>
                      <td className="px-5 py-3 font-semibold text-white">{att.employee_name}</td>
                      <td className="px-5 py-3 text-slate-400">
                        {att.check_in_time ? new Date(att.check_in_time).toLocaleTimeString() : 'N/A'}
                      </td>
                      <td className="px-5 py-3 text-slate-400">
                        {att.check_out_time ? new Date(att.check_out_time).toLocaleTimeString() : 'N/A'}
                      </td>
                      <td className="px-5 py-3 text-slate-300 font-bold">{att.total_hours || 0} giờ</td>
                      <td className="px-5 py-3">
                        <Badge variant={att.status === 'PRESENT' ? 'success' : 'danger'}>
                          {att.status === 'PRESENT' ? 'Đúng giờ' : 'Nghỉ làm'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </Table>
              )}
            </Card>
          )}

          {activeTab === 'payroll' && (
            <div className="flex flex-col gap-6">
              <Card variant="default" className="p-5 flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">Chu kỳ bảng lương: Tháng 5/2026</h3>
                    <span className="text-[10px] text-slate-500 uppercase font-bold mt-1 block">Bản nháp tính toán</span>
                  </div>
                  <Button variant="primary" size="sm" icon={<CheckCircle size={14} />}>
                    Phê duyệt & Lưu Blockchain
                  </Button>
                </div>

                <Table headers={['Mã NV', 'Nhân viên', 'Lương cơ bản', 'Phụ cấp', 'Chấm công', 'Thuế PIT', 'Thực lĩnh']}>
                  {employees.map(emp => {
                    const days = 22;
                    const pit = (emp.base_salary || 10000000) * 0.05;
                    const net = (emp.base_salary || 10000000) - pit;
                    return (
                      <tr key={emp.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-5 py-3 text-slate-300">{emp.employee_code || 'N/A'}</td>
                        <td className="px-5 py-3 font-semibold text-white">{emp.full_name}</td>
                        <td className="px-5 py-3 text-slate-200">{(emp.base_salary || 0).toLocaleString()} VND</td>
                        <td className="px-5 py-3 text-slate-400">0 VND</td>
                        <td className="px-5 py-3 text-slate-300">{days} ngày công</td>
                        <td className="px-5 py-3 text-rose-400">{pit.toLocaleString()} VND</td>
                        <td className="px-5 py-3 font-bold text-emerald-400">{net.toLocaleString()} VND</td>
                      </tr>
                    );
                  })}
                </Table>
              </Card>
            </div>
          )}

          {activeTab === 'org' && (
            <Card variant="default" className="p-8 flex flex-col items-center justify-center text-center gap-6">
              <GitBranch className="text-indigo-400 animate-pulse" size={48} />
              <div>
                <h3 className="text-sm font-bold text-white">Sơ đồ cơ cấu tổ chức động</h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Hiển thị phân cấp báo cáo của ban lãnh đạo và các phòng ban trực thuộc tự động theo trường manager_id của nhân viên.
                </p>
              </div>
              <div className="flex flex-col items-center gap-4 bg-[#12141c] border border-[#242936] p-5 rounded-xl max-w-sm w-full shadow-md">
                <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-lg text-sm font-semibold">
                  Ban Giám Đốc (CEO)
                </div>
                <div className="w-0.5 h-6 bg-[#242936]" />
                <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="px-3 py-1.5 bg-[#1a1d29] border border-[#242936] text-slate-200 rounded-lg text-xs font-medium">
                    Phòng Kinh Doanh
                  </div>
                  <div className="px-3 py-1.5 bg-[#1a1d29] border border-[#242936] text-slate-200 rounded-lg text-xs font-medium">
                    Phòng Kỹ Thuật
                  </div>
                </div>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Employee Modal */}
      <Modal isOpen={isEmployeeModalOpen} onClose={() => setIsEmployeeModalOpen(false)} title="Thêm hồ sơ nhân viên mới">
        <form onSubmit={handleCreateEmployee} className="flex flex-col gap-4">
          <Input 
            label="Mã nhân viên" 
            placeholder="Ví dụ: NV001" 
            required 
            value={newEmployee.employee_code} 
            onChange={e => setNewEmployee({ ...newEmployee, employee_code: e.target.value })}
          />
          <Input 
            label="Họ và tên" 
            placeholder="Nhập tên đầy đủ" 
            required 
            value={newEmployee.full_name} 
            onChange={e => setNewEmployee({ ...newEmployee, full_name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Số điện thoại" 
              placeholder="09..." 
              value={newEmployee.phone} 
              onChange={e => setNewEmployee({ ...newEmployee, phone: e.target.value })}
            />
            <Input 
              label="Email cá nhân" 
              placeholder="name@gmail.com" 
              value={newEmployee.email} 
              onChange={e => setNewEmployee({ ...newEmployee, email: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Chức vụ" 
              value={newEmployee.position} 
              onChange={e => setNewEmployee({ ...newEmployee, position: e.target.value })}
            />
            <Input 
              label="Phòng ban" 
              value={newEmployee.department} 
              onChange={e => setNewEmployee({ ...newEmployee, department: e.target.value })}
            />
          </div>
          <Input 
            label="Mức lương cơ bản (VND)" 
            type="number" 
            required 
            value={newEmployee.base_salary} 
            onChange={e => setNewEmployee({ ...newEmployee, base_salary: Number(e.target.value) })}
          />
          <div className="flex justify-end gap-2.5 mt-2">
            <Button variant="outline" type="button" onClick={() => setIsEmployeeModalOpen(false)}>Hủy</Button>
            <Button variant="primary" type="submit">Thêm nhân viên</Button>
          </div>
        </form>
      </Modal>

      {/* Attendance Modal */}
      <Modal isOpen={isAttendanceModalOpen} onClose={() => setIsAttendanceModalOpen(false)} title="Ghi nhận chấm công nhân viên">
        <form onSubmit={handleCreateAttendance} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-400 font-semibold">Chọn nhân viên</span>
            <select 
              className="bg-[#12141c] border border-[#242936] text-white p-2 rounded-lg text-sm focus:outline-none"
              required
              value={newAttendance.employee_id}
              onChange={e => setNewAttendance({ ...newAttendance, employee_id: e.target.value })}
            >
              <option value="">-- Chọn nhân viên --</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.position})</option>
              ))}
            </select>
          </div>
          <Input 
            label="Ngày chấm công" 
            type="date" 
            required 
            value={newAttendance.date} 
            onChange={e => setNewAttendance({ ...newAttendance, date: e.target.value })}
          />
          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-400 font-semibold">Trạng thái</span>
            <select 
              className="bg-[#12141c] border border-[#242936] text-white p-2 rounded-lg text-sm focus:outline-none"
              value={newAttendance.status}
              onChange={e => setNewAttendance({ ...newAttendance, status: e.target.value })}
            >
              <option value="PRESENT">Có mặt (Đúng giờ)</option>
              <option value="LATE">Đi muộn</option>
              <option value="ABSENT">Vắng mặt</option>
            </select>
          </div>
          <div className="flex justify-end gap-2.5 mt-2">
            <Button variant="outline" type="button" onClick={() => setIsAttendanceModalOpen(false)}>Hủy</Button>
            <Button variant="primary" type="submit">Ghi nhận</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
