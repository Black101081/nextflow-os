import React from 'react';
import { User, Mail, Phone, Shield, Wallet, Key, Award } from 'lucide-react';
import { Button, Card, Badge } from '../../../shared/components/ui';

interface AccountTabProps {
  walletConnected: boolean;
  onConnectWallet: () => void;
  branding: {
    brandName: string;
    brandLogo: string;
    primaryColor: string;
  };
}

export default function AccountTab({ walletConnected, onConnectWallet, branding }: AccountTabProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
          <User size={32} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Nguyễn Văn Khách Hàng
            <Badge variant="success">Active</Badge>
          </h2>
          <p className="text-xs text-slate-400 mt-1">ID khách hàng: #CUST-9082</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Details */}
        <Card variant="default" className="p-5 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2">Thông tin liên hệ</h3>
          <div className="flex flex-col gap-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-2">
                <Mail size={14} /> Email
              </span>
              <span className="text-slate-200">customer@nextflow.vn</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-2">
                <Phone size={14} /> Số điện thoại
              </span>
              <span className="text-slate-200">0987 654 321</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-2">
                <Award size={14} /> Cấp bậc thành viên
              </span>
              <span className="text-indigo-400 font-bold">Thành viên Vàng (Gold Member)</span>
            </div>
          </div>
        </Card>

        {/* Web3 Wallet Connection */}
        <Card variant="glass" className="p-5 flex flex-col gap-4 border-indigo-500/10">
          <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2 flex items-center gap-2">
            <Wallet size={16} className="text-indigo-400" /> Cấu hình Web3 Wallet
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Kết nối ví U2U Web3 để nhận thưởng tự động (Cashback) 50% bằng token NFTk dưới dạng mã hóa trên Blockchain.
          </p>
          {walletConnected ? (
            <div className="flex flex-col gap-3">
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400">Địa chỉ ví đã kết nối</span>
                  <span className="text-xs font-mono text-indigo-300">0xU2U81A7b9...F4A9</span>
                </div>
                <Badge variant="success">CONNECTED</Badge>
              </div>
              <p className="text-[10px] text-slate-500">
                Mọi giao dịch hoàn tất sẽ được tự động đồng bộ lên Blockchain Ledger của {branding.brandName}.
              </p>
            </div>
          ) : (
            <Button variant="primary" icon={<Wallet size={16} />} onClick={onConnectWallet} className="w-full">
              Kết nối U2U Wallet
            </Button>
          )}
        </Card>
      </div>

      {/* Security & Access Logs */}
      <Card variant="default" className="p-5 flex flex-col gap-4">
        <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2 flex items-center gap-2">
          <Shield size={16} className="text-emerald-400" /> Nhật ký thiết bị & Bảo mật
        </h3>
        <div className="flex flex-col gap-3 text-xs">
          <div className="flex justify-between items-center text-slate-400 border-b border-white/5 pb-2">
            <span className="flex items-center gap-2 text-slate-200">
              <Key size={14} /> Trình duyệt Chrome - Windows (Hiện tại)
            </span>
            <span>IP: 14.161.42.15 • 10 phút trước</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span className="flex items-center gap-2 text-slate-200">
              <Key size={14} /> iPhone 15 Pro - iOS App
            </span>
            <span>IP: 14.161.42.15 • Hôm qua</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
