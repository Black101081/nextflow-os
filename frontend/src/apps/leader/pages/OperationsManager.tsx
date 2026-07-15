import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  FileText, 
  Cpu, 
  Layers, 
  BarChart, 
  Plus, 
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { Button, Card, Table, Input, Badge, Modal, useToast, Skeleton, EmptyState } from '../../../shared/components/ui';

export default function OperationsManager() {
  const { showToast } = useToast();
  
  // Tab states: 'contracts' | 'assets' | 'projects' | 'channels'
  const [activeTab, setActiveTab] = useState<'contracts' | 'assets' | 'projects' | 'channels'>('contracts');
  
  const [contracts, setContracts] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);

  // Form states
  const [newContract, setNewContract] = useState({
    contract_number: '',
    contract_type: 'CLIENT', // CLIENT, PARTNER, SUPPLIER
    title: '',
    counterpart_name: '',
    value: 0,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
  });

  const [newAsset, setNewAsset] = useState({
    asset_code: '',
    name: '',
    category: 'Thiết bị',
    location: 'Trụ sở chính',
    purchase_date: new Date().toISOString().split('T')[0],
    purchase_price: 0,
    useful_life_years: 5,
  });

  const [newProject, setNewProject] = useState({
    project_code: '',
    name: '',
    description: '',
    project_type: 'INTERNAL',
    budget: 0,
    start_date: new Date().toISOString().split('T')[0],
    target_end_date: '',
  });

  const [newChannel, setNewChannel] = useState({
    channel_type: 'SHOPEE',
    channel_name: '',
    shop_id: '',
  });

  const fetchOperationsData = async () => {
    setLoading(true);
    try {
      const contractRes = await fetch('/api/v1/operations/contracts', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      }).then(r => r.json());

      const assetRes = await fetch('/api/v1/operations/assets', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      }).then(r => r.json());

      const projectRes = await fetch('/api/v1/operations/projects', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      }).then(r => r.json());

      const channelRes = await fetch('/api/v1/operations/channels', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      }).then(r => r.json());

      if (contractRes.status === 'success') setContracts(contractRes.data);
      if (assetRes.status === 'success') setAssets(assetRes.data);
      if (projectRes.status === 'success') setProjects(projectRes.data);
      if (channelRes.status === 'success') setChannels(channelRes.data);
    } catch (err) {
      console.error(err);
      showToast('error', 'Không thể tải dữ liệu vận hành.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperationsData();
  }, []);

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/operations/contracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newContract)
      }).then(r => r.json());

      if (res.status === 'success') {
        showToast('success', 'Thêm hợp đồng thành công!');
        setIsContractModalOpen(false);
        fetchOperationsData();
      } else {
        showToast('error', res.error || 'Có lỗi xảy ra.');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Lỗi kết nối máy chủ.');
    }
  };

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/operations/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newAsset)
      }).then(r => r.json());

      if (res.status === 'success') {
        showToast('success', 'Thêm tài sản thành công!');
        setIsAssetModalOpen(false);
        fetchOperationsData();
      } else {
        showToast('error', res.error || 'Có lỗi xảy ra.');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Lỗi kết nối máy chủ.');
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/operations/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newProject)
      }).then(r => r.json());

      if (res.status === 'success') {
        showToast('success', 'Thêm dự án thành công!');
        setIsProjectModalOpen(false);
        fetchOperationsData();
      } else {
        showToast('error', res.error || 'Có lỗi xảy ra.');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Lỗi kết nối máy chủ.');
    }
  };

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/operations/channels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newChannel)
      }).then(r => r.json());

      if (res.status === 'success') {
        showToast('success', 'Đồng bộ kênh bán hàng thành công!');
        setIsChannelModalOpen(false);
        fetchOperationsData();
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
            <Briefcase className="text-indigo-400" /> Vận hành & Quản trị Dự án
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Quản trị hợp đồng pháp lý, tài sản cố định, tiến độ dự án (Gantt) và đồng bộ kênh bán hàng đa sàn Shopee/Lazada/TikTok Shop.
          </p>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-white/5 pb-2 gap-3.5">
        {(['contracts', 'assets', 'projects', 'channels'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-xs font-semibold px-2 py-1.5 transition-all relative ${
              activeTab === tab ? 'text-indigo-400 font-bold' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab === 'contracts' && 'Hợp đồng pháp lý'}
            {tab === 'assets' && 'Tài sản cố định'}
            {tab === 'projects' && 'Quản lý Dự án & Gantt'}
            {tab === 'channels' && 'Kênh bán hàng đa sàn'}
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
          {activeTab === 'contracts' && (
            <Card variant="default" className="p-5 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white">Quản Lý Hợp Đồng</h3>
                <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setIsContractModalOpen(true)}>
                  Thêm hợp đồng mới
                </Button>
              </div>

              {contracts.length === 0 ? (
                <EmptyState title="Chưa có hợp đồng nào" description="Đăng tải hợp đồng khách hàng hoặc nhà cung cấp để kiểm soát hiệu lực pháp lý." action={
                  <Button variant="primary" size="sm" onClick={() => setIsContractModalOpen(true)}>Thêm hợp đồng</Button>
                } />
              ) : (
                <Table headers={['Số hợp đồng', 'Tên hợp đồng', 'Phân loại', 'Đối tác', 'Giá trị', 'Ngày bắt đầu', 'Trạng thái']}>
                  {contracts.map(cnt => (
                    <tr key={cnt.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3 font-semibold text-white">{cnt.contract_number}</td>
                      <td className="px-5 py-3 text-slate-200">{cnt.title}</td>
                      <td className="px-5 py-3 text-slate-400">
                        <Badge variant={cnt.contract_type === 'CLIENT' ? 'success' : 'primary'}>
                          {cnt.contract_type}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-slate-300">{cnt.counterpart_name || 'N/A'}</td>
                      <td className="px-5 py-3 font-bold text-slate-200">
                        {cnt.value ? `${cnt.value.toLocaleString()} VND` : 'N/A'}
                      </td>
                      <td className="px-5 py-3 text-slate-400">{cnt.start_date}</td>
                      <td className="px-5 py-3">
                        <Badge variant={cnt.status === 'ACTIVE' ? 'success' : 'neutral'}>
                          {cnt.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </Table>
              )}
            </Card>
          )}

          {activeTab === 'assets' && (
            <Card variant="default" className="p-5 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white">Quản Lý Tài Sản Cố Định</h3>
                <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setIsAssetModalOpen(true)}>
                  Khai báo tài sản
                </Button>
              </div>

              {assets.length === 0 ? (
                <EmptyState title="Chưa khai báo tài sản nào" description="Theo dõi máy móc, thiết bị và cấu hao tài sản tự động." action={
                  <Button variant="primary" size="sm" onClick={() => setIsAssetModalOpen(true)}>Khai báo tài sản</Button>
                } />
              ) : (
                <Table headers={['Mã tài sản', 'Tên tài sản', 'Phân loại', 'Vị trí', 'Giá mua', 'Giá trị hiện tại', 'Trạng thái']}>
                  {assets.map(ast => (
                    <tr key={ast.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3 font-semibold text-white">{ast.asset_code}</td>
                      <td className="px-5 py-3 text-slate-200">{ast.name}</td>
                      <td className="px-5 py-3 text-slate-400">{ast.category || 'N/A'}</td>
                      <td className="px-5 py-3 text-slate-300">{ast.location || 'N/A'}</td>
                      <td className="px-5 py-3 font-semibold">
                        {ast.purchase_price ? `${ast.purchase_price.toLocaleString()} VND` : '0 VND'}
                      </td>
                      <td className="px-5 py-3 font-bold text-indigo-400">
                        {ast.current_value ? `${ast.current_value.toLocaleString()} VND` : '0 VND'}
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={ast.status === 'ACTIVE' ? 'success' : 'danger'}>
                          {ast.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </Table>
              )}
            </Card>
          )}

          {activeTab === 'projects' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card variant="default" className="lg:col-span-2 p-5 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white">Tiến độ Dự án (Gantt style)</h3>
                  <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setIsProjectModalOpen(true)}>
                    Tạo Dự Án Mới
                  </Button>
                </div>

                {projects.length === 0 ? (
                  <EmptyState title="Chưa có dự án nào" description="Tạo dự án để quản trị chi phí thực tế và tiến độ công việc." />
                ) : (
                  <div className="flex flex-col gap-4">
                    {projects.map(proj => (
                      <div key={proj.id} className="p-4 bg-[#12141c] border border-[#242936] rounded-xl flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">{proj.project_code}</span>
                            <h4 className="text-sm font-bold text-white mt-0.5">{proj.name}</h4>
                          </div>
                          <Badge variant={proj.status === 'RUNNING' ? 'primary' : 'success'}>
                            {proj.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center text-xs text-slate-400 mt-1">
                          <span>Ngân sách: {proj.budget ? `${proj.budget.toLocaleString()} VND` : '0'}</span>
                          <span>Chi phí thực tế: {proj.actual_cost ? `${proj.actual_cost.toLocaleString()} VND` : '0'}</span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-[#1e2230] h-1.5 rounded-full overflow-hidden mt-1">
                          <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${proj.completion_percentage || 0}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Work-logs */}
              <Card variant="default" className="p-5 flex flex-col gap-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Hoạt động dự án</h3>
                <div className="flex flex-col gap-3">
                  <div className="p-3 bg-[#12141c] border border-[#242936] rounded-lg text-xs">
                    <span className="text-white font-bold block">Nguyễn Văn A ghi nhận log timesheet</span>
                    <span className="text-slate-500 mt-1 block">4 giờ làm việc trên dự án SP001</span>
                  </div>
                  <div className="p-3 bg-[#12141c] border border-[#242936] rounded-lg text-xs">
                    <span className="text-white font-bold block">Hoàn thành Milestone 1</span>
                    <span className="text-emerald-400 mt-1 block">Dự án NextFlow OS v2.0</span>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'channels' && (
            <Card variant="default" className="p-5 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white">Đồng Bộ Kênh Bán Hàng Sàn TMĐT</h3>
                <Button variant="primary" size="sm" icon={<ShoppingBag size={14} />} onClick={() => setIsChannelModalOpen(true)}>
                  Liên kết kênh bán
                </Button>
              </div>

              {channels.length === 0 ? (
                <EmptyState title="Chưa liên kết kênh bán hàng nào" description="Kết nối tài khoản bán hàng trên Shopee, Lazada hoặc TikTok Shop để tự động đồng bộ đơn hàng về NextFlow OS." action={
                  <Button variant="primary" size="sm" onClick={() => setIsChannelModalOpen(true)}>Liên kết ngay</Button>
                } />
              ) : (
                <Table headers={['Sàn TMĐT', 'Tên gian hàng', 'Shop ID', 'Đơn hàng đồng bộ', 'Doanh thu đồng bộ', 'Trạng thái']}>
                  {channels.map(chan => (
                    <tr key={chan.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3 font-semibold text-white flex items-center gap-2">
                        <Badge variant={chan.channel_type === 'SHOPEE' ? 'primary' : chan.channel_type === 'TIKTOK' ? 'neutral' : 'warning'}>
                          {chan.channel_type}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-slate-200">{chan.channel_name || 'N/A'}</td>
                      <td className="px-5 py-3 text-slate-400 font-mono">{chan.shop_id || 'N/A'}</td>
                      <td className="px-5 py-3 font-semibold text-slate-300">{chan.total_orders} đơn</td>
                      <td className="px-5 py-3 font-bold text-emerald-400">{(chan.total_revenue || 0).toLocaleString()} VND</td>
                      <td className="px-5 py-3">
                        <Badge variant={chan.is_active ? 'success' : 'danger'}>
                          {chan.is_active ? 'Connected' : 'Disconnected'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </Table>
              )}
            </Card>
          )}
        </>
      )}

      {/* Contract Modal */}
      <Modal isOpen={isContractModalOpen} onClose={() => setIsContractModalOpen(false)} title="Thêm hợp đồng pháp lý mới">
        <form onSubmit={handleCreateContract} className="flex flex-col gap-4">
          <Input 
            label="Số hợp đồng" 
            placeholder="Ví dụ: HD-2026-001" 
            required 
            value={newContract.contract_number} 
            onChange={e => setNewContract({ ...newContract, contract_number: e.target.value })}
          />
          <Input 
            label="Tên hợp đồng / Nội dung" 
            placeholder="Ví dụ: Hợp đồng cung cấp dịch vụ phần mềm" 
            required 
            value={newContract.title} 
            onChange={e => setNewContract({ ...newContract, title: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-slate-400 font-semibold">Phân loại hợp đồng</span>
              <select 
                className="bg-[#12141c] border border-[#242936] text-white p-2 rounded-lg text-sm focus:outline-none"
                value={newContract.contract_type}
                onChange={e => setNewContract({ ...newContract, contract_type: e.target.value })}
              >
                <option value="CLIENT">Khách hàng</option>
                <option value="PARTNER">Đối tác</option>
                <option value="SUPPLIER">Nhà cung cấp</option>
              </select>
            </div>
            <Input 
              label="Tên đối tác ký kết" 
              placeholder="Nhập tên đối tác" 
              value={newContract.counterpart_name} 
              onChange={e => setNewContract({ ...newContract, counterpart_name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Giá trị hợp đồng (VND)" 
              type="number" 
              value={newContract.value} 
              onChange={e => setNewContract({ ...newContract, value: Number(e.target.value) })}
            />
            <Input 
              label="Ngày hiệu lực" 
              type="date" 
              required 
              value={newContract.start_date} 
              onChange={e => setNewContract({ ...newContract, start_date: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2.5 mt-2">
            <Button variant="outline" type="button" onClick={() => setIsContractModalOpen(false)}>Hủy</Button>
            <Button variant="primary" type="submit">Lưu hợp đồng</Button>
          </div>
        </form>
      </Modal>

      {/* Asset Modal */}
      <Modal isOpen={isAssetModalOpen} onClose={() => setIsAssetModalOpen(false)} title="Khai báo tài sản cố định">
        <form onSubmit={handleCreateAsset} className="flex flex-col gap-4">
          <Input 
            label="Mã tài sản" 
            placeholder="Ví dụ: TS-PC-001" 
            required 
            value={newAsset.asset_code} 
            onChange={e => setNewAsset({ ...newAsset, asset_code: e.target.value })}
          />
          <Input 
            label="Tên tài sản" 
            placeholder="Ví dụ: Laptop Dell XPS 15" 
            required 
            value={newAsset.name} 
            onChange={e => setNewAsset({ ...newAsset, name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Phân loại" 
              value={newAsset.category} 
              onChange={e => setNewAsset({ ...newAsset, category: e.target.value })}
            />
            <Input 
              label="Vị trí đặt tài sản" 
              value={newAsset.location} 
              onChange={e => setNewAsset({ ...newAsset, location: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Giá trị mua (VND)" 
              type="number" 
              value={newAsset.purchase_price} 
              onChange={e => setNewAsset({ ...newAsset, purchase_price: Number(e.target.value) })}
            />
            <Input 
              label="Thời gian trích khấu hao (năm)" 
              type="number" 
              value={newAsset.useful_life_years} 
              onChange={e => setNewAsset({ ...newAsset, useful_life_years: Number(e.target.value) })}
            />
          </div>
          <div className="flex justify-end gap-2.5 mt-2">
            <Button variant="outline" type="button" onClick={() => setIsAssetModalOpen(false)}>Hủy</Button>
            <Button variant="primary" type="submit">Thêm tài sản</Button>
          </div>
        </form>
      </Modal>

      {/* Project Modal */}
      <Modal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} title="Tạo dự án mới">
        <form onSubmit={handleCreateProject} className="flex flex-col gap-4">
          <Input 
            label="Mã dự án" 
            placeholder="Ví dụ: DA001" 
            required 
            value={newProject.project_code} 
            onChange={e => setNewProject({ ...newProject, project_code: e.target.value })}
          />
          <Input 
            label="Tên dự án" 
            placeholder="Nhập tên dự án đầy đủ" 
            required 
            value={newProject.name} 
            onChange={e => setNewProject({ ...newProject, name: e.target.value })}
          />
          <Input 
            label="Mô tả dự án" 
            value={newProject.description} 
            onChange={e => setNewProject({ ...newProject, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Ngân sách dự án (VND)" 
              type="number" 
              value={newProject.budget} 
              onChange={e => setNewProject({ ...newProject, budget: Number(e.target.value) })}
            />
            <Input 
              label="Ngày khởi chạy" 
              type="date" 
              required 
              value={newProject.start_date} 
              onChange={e => setNewProject({ ...newProject, start_date: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2.5 mt-2">
            <Button variant="outline" type="button" onClick={() => setIsProjectModalOpen(false)}>Hủy</Button>
            <Button variant="primary" type="submit">Tạo dự án</Button>
          </div>
        </form>
      </Modal>

      {/* Channel Modal */}
      <Modal isOpen={isChannelModalOpen} onClose={() => setIsChannelModalOpen(false)} title="Liên kết gian hàng thương mại điện tử">
        <form onSubmit={handleCreateChannel} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-400 font-semibold">Chọn sàn thương mại điện tử</span>
            <select 
              className="bg-[#12141c] border border-[#242936] text-white p-2 rounded-lg text-sm focus:outline-none"
              value={newChannel.channel_type}
              onChange={e => setNewChannel({ ...newChannel, channel_type: e.target.value })}
            >
              <option value="SHOPEE">Shopee Shop</option>
              <option value="LAZADA">Lazada Store</option>
              <option value="TIKTOK">TikTok Shop</option>
            </select>
          </div>
          <Input 
            label="Tên gian hàng / shop hiển thị" 
            placeholder="Ví dụ: Mỹ phẩm NextFlow Chính Hãng" 
            required 
            value={newChannel.channel_name} 
            onChange={e => setNewChannel({ ...newChannel, channel_name: e.target.value })}
          />
          <Input 
            label="Mã định danh gian hàng (Shop ID)" 
            placeholder="Nhập Shop ID từ API tích hợp sàn" 
            required 
            value={newChannel.shop_id} 
            onChange={e => setNewChannel({ ...newChannel, shop_id: e.target.value })}
          />
          <div className="flex justify-end gap-2.5 mt-2">
            <Button variant="outline" type="button" onClick={() => setIsChannelModalOpen(false)}>Hủy</Button>
            <Button variant="primary" type="submit">Liên kết gian hàng</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
