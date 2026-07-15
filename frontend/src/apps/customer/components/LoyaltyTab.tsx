import React from 'react';
import { Award, Gift, ShieldCheck, Heart, RefreshCw, Link2, Key } from 'lucide-react';
import { Card, Badge, Button } from '../../../shared/components/ui';

interface LoyaltyTabProps {
  walletConnected: boolean;
  nftBalance: number;
  onConnectWallet: () => void;
  branding: {
    brandName: string;
  };
}

export default function LoyaltyTab({ walletConnected, nftBalance, onConnectWallet, branding }: LoyaltyTabProps) {
  // Query blockchain events cached in localStorage
  const blockchainEvents = JSON.parse(localStorage.getItem('u2u_chain_events') || '[]');

  return (
    <div className="flex flex-col gap-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="glass" className="p-5 flex flex-col justify-between gap-3 border-indigo-500/10">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Hạng thành viên</span>
              <span className="text-xl font-extrabold text-white mt-1">GOLD MEMBER</span>
            </div>
            <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400">
              <Award size={20} />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <span>Tích lũy thêm 350 điểm để lên hạng Diamond</span>
          </div>
        </Card>

        <Card variant="glass" className="p-5 flex flex-col justify-between gap-3 border-emerald-500/10">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Điểm tích lũy</span>
              <span className="text-xl font-extrabold text-emerald-400 mt-1">850 Điểm</span>
            </div>
            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
              <Gift size={20} />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <span>Hạn sử dụng: 31/12/2026</span>
          </div>
        </Card>

        <Card variant="glass" className="p-5 flex flex-col justify-between gap-3 border-indigo-500/10">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Ví Web3 (NFTk Tokens)</span>
              <span className="text-xl font-extrabold text-indigo-400 mt-1">{nftBalance.toLocaleString()} NFTk</span>
            </div>
            <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400">
              <ShieldCheck size={20} />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            {walletConnected ? (
              <span className="text-indigo-300 font-mono">0xU2U81A7b9...F4A9</span>
            ) : (
              <button onClick={onConnectWallet} className="underline text-indigo-400 hover:text-indigo-300 transition-colors">
                Chưa kết nối ví Web3
              </button>
            )}
          </div>
        </Card>
      </div>

      {/* Blockchain Ledger Events */}
      <Card variant="default" className="p-5 flex flex-col gap-4">
        <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2 flex items-center gap-2">
          <Link2 size={16} className="text-indigo-400" /> Sổ cái Giao dịch Blockchain (U2U Network Ledger)
        </h3>
        <p className="text-xs text-slate-400">
          Dưới đây là lịch sử các sự kiện hợp đồng thông minh (Smart Contract) của bạn được ghi nhận bất biến trên mạng lưới U2U Network.
        </p>

        {blockchainEvents.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs">
            Chưa có giao dịch blockchain nào được thực hiện. Liên kết ví hoặc thanh toán hóa đơn để bắt đầu.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {blockchainEvents.map((ev: any, idx: number) => (
              <div key={idx} className="p-3 bg-white/5 border border-white/5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    {ev.type}
                    <Badge variant="success">CONFIRMED</Badge>
                  </span>
                  <span className="text-[10px] text-slate-400">{ev.details}</span>
                </div>
                <div className="flex flex-col items-end gap-1 font-mono text-[10px] text-slate-500 text-right">
                  <span>TxHash: {ev.txHash}</span>
                  <span>Block: #{ev.block} • {new Date(ev.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
