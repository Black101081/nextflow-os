import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Warehouse, 
  Tag, 
  ArrowLeftRight, 
  Truck,
  Plus, 
  AlertTriangle,
  QrCode,
  PackageCheck
} from 'lucide-react';
import { Button, Card, Table, Input, Badge, Modal, useToast, Skeleton, EmptyState } from '../../../shared/components/ui';

export default function InventoryManager() {
  const { showToast } = useToast();
  
  // Tab states: 'warehouses' | 'products' | 'stock' | 'suppliers'
  const [activeTab, setActiveTab] = useState<'warehouses' | 'products' | 'stock' | 'suppliers'>('products');
  
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Form states
  const [newWarehouse, setNewWarehouse] = useState({
    name: '',
    address: '',
  });

  const [newProduct, setNewProduct] = useState({
    sku: '',
    name: '',
    category: 'Vật liệu',
    unit: 'cái',
    cost_price: 0,
    sell_price: 0,
    min_stock: 5,
    barcode: '',
  });

  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      const whRes = await fetch('/api/v1/inventory/warehouses', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      }).then(r => r.json());

      const prodRes = await fetch('/api/v1/inventory/products', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      }).then(r => r.json());

      if (whRes.status === 'success') setWarehouses(whRes.data);
      if (prodRes.status === 'success') setProducts(prodRes.data);
    } catch (err) {
      console.error(err);
      showToast('error', 'Không thể tải dữ liệu kho.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const handleCreateWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/inventory/warehouses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newWarehouse)
      }).then(r => r.json());

      if (res.status === 'success') {
        showToast('success', 'Thêm kho hàng thành công!');
        setIsWarehouseModalOpen(false);
        fetchInventoryData();
      } else {
        showToast('error', res.error || 'Có lỗi xảy ra.');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Lỗi kết nối máy chủ.');
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/inventory/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newProduct)
      }).then(r => r.json());

      if (res.status === 'success') {
        showToast('success', 'Tạo sản phẩm thành công!');
        setIsProductModalOpen(false);
        fetchInventoryData();
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
            <Box className="text-indigo-400" /> Quản lý Kho & Cung ứng
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Quản lý kho hàng đa chi nhánh, danh mục sản phẩm, biến động tồn kho và danh sách nhà cung cấp.
          </p>
        </div>
        <div className="flex gap-2.5">
          <Button variant="outline" size="sm" icon={<Warehouse size={14} />} onClick={() => setIsWarehouseModalOpen(true)}>
            Thêm kho hàng
          </Button>
          <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setIsProductModalOpen(true)}>
            Thêm sản phẩm
          </Button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-white/5 pb-2 gap-3.5">
        {(['warehouses', 'products', 'stock', 'suppliers'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-xs font-semibold px-2 py-1.5 transition-all relative ${
              activeTab === tab ? 'text-indigo-400 font-bold' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab === 'warehouses' && 'Danh mục Kho'}
            {tab === 'products' && 'Danh mục Sản phẩm'}
            {tab === 'stock' && 'Tồn kho & Movements'}
            {tab === 'suppliers' && 'Nhà cung cấp'}
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
          {activeTab === 'warehouses' && (
            <Card variant="default" className="p-5 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white">Danh Sách Kho Hàng</h3>
                <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setIsWarehouseModalOpen(true)}>
                  Thêm kho mới
                </Button>
              </div>

              {warehouses.length === 0 ? (
                <EmptyState title="Chưa có kho hàng nào" description="Hãy tạo kho mặc định để lưu trữ hàng hoá tồn kho." action={
                  <Button variant="primary" size="sm" onClick={() => setIsWarehouseModalOpen(true)}>Thêm kho</Button>
                } />
              ) : (
                <Table headers={['Tên kho', 'Địa chỉ', 'Mặc định', 'Ngày tạo']}>
                  {warehouses.map(wh => (
                    <tr key={wh.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3 font-semibold text-white">{wh.name}</td>
                      <td className="px-5 py-3 text-slate-300">{wh.address || 'N/A'}</td>
                      <td className="px-5 py-3">
                        <Badge variant={wh.is_default ? 'success' : 'neutral'}>
                          {wh.is_default ? 'Mặc định' : 'Phụ'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-slate-400">{wh.created_at.slice(0, 10)}</td>
                    </tr>
                  ))}
                </Table>
              )}
            </Card>
          )}

          {activeTab === 'products' && (
            <Card variant="default" className="p-5 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white">Danh Mục Sản Phẩm</h3>
                <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setIsProductModalOpen(true)}>
                  Thêm sản phẩm mới
                </Button>
              </div>

              {products.length === 0 ? (
                <EmptyState title="Chưa có sản phẩm nào" description="Tạo sản phẩm và SKU để bắt đầu nhập kho." action={
                  <Button variant="primary" size="sm" onClick={() => setIsProductModalOpen(true)}>Thêm sản phẩm</Button>
                } />
              ) : (
                <Table headers={['SKU', 'Tên sản phẩm', 'Phân loại', 'Giá nhập', 'Giá bán', 'Min Stock', 'Mã vạch']}>
                  {products.map(prod => (
                    <tr key={prod.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3 font-semibold text-white">{prod.sku}</td>
                      <td className="px-5 py-3 text-slate-200">{prod.name}</td>
                      <td className="px-5 py-3 text-slate-400">{prod.category || 'N/A'}</td>
                      <td className="px-5 py-3 text-slate-300 font-semibold">{(prod.cost_price || 0).toLocaleString()} VND</td>
                      <td className="px-5 py-3 text-emerald-400 font-bold">{(prod.sell_price || 0).toLocaleString()} VND</td>
                      <td className="px-5 py-3 text-slate-300">{prod.min_stock} {prod.unit}</td>
                      <td className="px-5 py-3 text-slate-400 font-mono flex items-center gap-1.5">
                        <QrCode size={14} /> {prod.barcode || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </Table>
              )}
            </Card>
          )}

          {activeTab === 'stock' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card variant="default" className="p-5 md:col-span-2 flex flex-col gap-4">
                <h3 className="text-sm font-bold text-white">Báo cáo chênh lệch tồn kho & Cảnh báo</h3>
                <Table headers={['SKU', 'Sản phẩm', 'Hiện có', 'Yêu cầu Min', 'Tình trạng']}>
                  {products.map(prod => {
                    const currentStock = 2; // Mock
                    const isLow = currentStock < (prod.min_stock || 5);
                    return (
                      <tr key={prod.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-5 py-3 text-slate-300">{prod.sku}</td>
                        <td className="px-5 py-3 text-white font-semibold">{prod.name}</td>
                        <td className="px-5 py-3 font-bold">{currentStock}</td>
                        <td className="px-5 py-3 text-slate-400">{prod.min_stock}</td>
                        <td className="px-5 py-3">
                          <Badge variant={isLow ? 'danger' : 'success'}>
                            {isLow ? 'Cần nhập hàng' : 'Đầy đủ'}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </Table>
              </Card>

              <Card variant="default" className="p-5 flex flex-col gap-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Biến động gần đây</h3>
                <div className="flex flex-col gap-3.5">
                  <div className="flex items-start gap-3 bg-[#12141c] p-3 rounded-lg border border-[#242936]">
                    <PackageCheck className="text-emerald-400 mt-0.5 shrink-0" size={16} />
                    <div>
                      <span className="text-xs font-bold text-white block">Nhập kho nhà cung cấp</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Mã PO: PO-85721 • 10 phút trước</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-[#12141c] p-3 rounded-lg border border-[#242936]">
                    <AlertTriangle className="text-amber-400 mt-0.5 shrink-0" size={16} />
                    <div>
                      <span className="text-xs font-bold text-white block">Tồn kho dưới mức tối thiểu</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Sản phẩm: Kem massage SkinClinic • 1 giờ trước</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'suppliers' && (
            <Card variant="default" className="p-5 flex flex-col gap-4">
              <h3 className="text-sm font-bold text-white">Nhà cung cấp & Độ tin cậy AI</h3>
              <Table headers={['Nhà cung cấp', 'Đại diện', 'Số điện thoại', 'Email', 'Độ tin cậy AI']}>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3 font-semibold text-white">Dược Mỹ Phẩm SkinClinic VN</td>
                  <td className="px-5 py-3 text-slate-300">Nguyễn Văn A</td>
                  <td className="px-5 py-3 text-slate-400">0987654321</td>
                  <td className="px-5 py-3 text-slate-400">info@skinclinic.vn</td>
                  <td className="px-5 py-3">
                    <Badge variant="success">98% (Rất cao)</Badge>
                  </td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3 font-semibold text-white">Thiết Bị Thẩm Mỹ Minh Trí</td>
                  <td className="px-5 py-3 text-slate-300">Trần Thị B</td>
                  <td className="px-5 py-3 text-slate-400">0912345678</td>
                  <td className="px-5 py-3 text-slate-400">sales@minhtri.com</td>
                  <td className="px-5 py-3">
                    <Badge variant="warning">82% (Trung bình)</Badge>
                  </td>
                </tr>
              </Table>
            </Card>
          )}
        </>
      )}

      {/* Warehouse Modal */}
      <Modal isOpen={isWarehouseModalOpen} onClose={() => setIsWarehouseModalOpen(false)} title="Thêm kho hàng mới">
        <form onSubmit={handleCreateWarehouse} className="flex flex-col gap-4">
          <Input 
            label="Tên kho hàng" 
            placeholder="Ví dụ: Kho Trung Tâm, Kho Chi Nhánh 1" 
            required 
            value={newWarehouse.name} 
            onChange={e => setNewWarehouse({ ...newWarehouse, name: e.target.value })}
          />
          <Input 
            label="Địa chỉ chi tiết" 
            placeholder="Nhập địa chỉ kho hàng" 
            value={newWarehouse.address} 
            onChange={e => setNewWarehouse({ ...newWarehouse, address: e.target.value })}
          />
          <div className="flex justify-end gap-2.5 mt-2">
            <Button variant="outline" type="button" onClick={() => setIsWarehouseModalOpen(false)}>Hủy</Button>
            <Button variant="primary" type="submit">Thêm kho</Button>
          </div>
        </form>
      </Modal>

      {/* Product Modal */}
      <Modal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} title="Thêm sản phẩm mới vào danh mục">
        <form onSubmit={handleCreateProduct} className="flex flex-col gap-4">
          <Input 
            label="Mã SKU sản phẩm" 
            placeholder="Ví dụ: SP-CLINIC-001" 
            required 
            value={newProduct.sku} 
            onChange={e => setNewProduct({ ...newProduct, sku: e.target.value })}
          />
          <Input 
            label="Tên sản phẩm" 
            placeholder="Nhập tên sản phẩm đầy đủ" 
            required 
            value={newProduct.name} 
            onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Phân loại" 
              placeholder="Ví dụ: Mỹ phẩm, Vật tư" 
              value={newProduct.category} 
              onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
            />
            <Input 
              label="Đơn vị tính" 
              placeholder="Ví dụ: chai, tuýp, cái" 
              value={newProduct.unit} 
              onChange={e => setNewProduct({ ...newProduct, unit: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Giá nhập kho (VND)" 
              type="number" 
              value={newProduct.cost_price} 
              onChange={e => setNewProduct({ ...newProduct, cost_price: Number(e.target.value) })}
            />
            <Input 
              label="Giá bán đề xuất (VND)" 
              type="number" 
              value={newProduct.sell_price} 
              onChange={e => setNewProduct({ ...newProduct, sell_price: Number(e.target.value) })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Tồn tối thiểu (Min)" 
              type="number" 
              value={newProduct.min_stock} 
              onChange={e => setNewProduct({ ...newProduct, min_stock: Number(e.target.value) })}
            />
            <Input 
              label="Mã vạch (Barcode)" 
              placeholder="Mã vạch sản phẩm" 
              value={newProduct.barcode} 
              onChange={e => setNewProduct({ ...newProduct, barcode: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2.5 mt-2">
            <Button variant="outline" type="button" onClick={() => setIsProductModalOpen(false)}>Hủy</Button>
            <Button variant="primary" type="submit">Lưu sản phẩm</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
