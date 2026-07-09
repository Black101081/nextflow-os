import React, { useEffect, useState } from 'react';

interface PointTransaction {
  id: string;
  points_change: number;
  reason: string;
  created_at: string;
}

interface UserPointsInfo {
  total_points: number;
  current_tier: string;
  transactions: PointTransaction[];
}

interface LeaderboardEntry {
  user_id: string;
  first_name: string;
  last_name: string;
  role: string;
  total_points: number;
  current_tier: string;
}

import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const GamificationBoard: React.FC = () => {
  const { user } = useAuth();
  const auth = { tenantId: user?.tenant_id || '', apiKey: user?.api_key || '' };
  const [pointsInfo, setPointsInfo] = useState<UserPointsInfo | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ptsRes, lbRes] = await Promise.all([
        apiService.getMyPoints(auth),
        apiService.getLeaderboard(auth)
      ]);

      setPointsInfo(ptsRes);
      setLeaderboard(lbRes);
    } catch (err) {
      console.error('Gamification fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Platinum': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Gold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Silver': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-orange-50 text-orange-800 border-orange-200';
    }
  };

  const getTierGradient = (tier: string) => {
    switch (tier) {
      case 'Platinum': return 'from-purple-500 to-indigo-600';
      case 'Gold': return 'from-yellow-400 to-yellow-600';
      case 'Silver': return 'from-gray-300 to-gray-500';
      default: return 'from-orange-300 to-orange-500';
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Đang tải bảng xếp hạng...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gamification & KPI</h1>
          <p className="text-gray-500 mt-1">Xếp hạng hiệu suất và điểm thưởng NF Token</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Điểm của tôi */}
        <div className={`col-span-1 rounded-2xl shadow-lg border p-6 text-white bg-gradient-to-br ${getTierGradient(pointsInfo?.current_tier || 'Bronze')} relative overflow-hidden`}>
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10"></div>
          <h2 className="text-lg font-medium opacity-90">Tổng NF Token của bạn</h2>
          <div className="mt-4 flex items-end space-x-2">
            <span className="text-5xl font-extrabold">{pointsInfo?.total_points || 0}</span>
            <span className="text-xl opacity-80 mb-1">NF</span>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <span className="text-sm font-medium opacity-90">Hạng hiện tại</span>
            <span className="px-3 py-1 rounded-full bg-white bg-opacity-20 text-sm font-bold shadow-sm backdrop-blur-sm">
              {pointsInfo?.current_tier || 'Bronze'}
            </span>
          </div>
        </div>

        {/* Lịch sử giao dịch điểm */}
        <div className="col-span-1 md:col-span-2 bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Lịch sử nhận thưởng</h2>
          {pointsInfo?.transactions.length === 0 ? (
            <div className="text-center text-gray-500 py-8">Chưa có lịch sử nhận NF Token.</div>
          ) : (
            <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
              {pointsInfo?.transactions.map(tx => (
                <div key={tx.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${tx.points_change >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {tx.points_change >= 0 ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 12H6"></path></svg>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{tx.reason}</p>
                      <p className="text-xs text-gray-500">{new Date(tx.created_at).toLocaleString('vi-VN')}</p>
                    </div>
                  </div>
                  <span className={`font-bold ${tx.points_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.points_change > 0 ? '+' : ''}{tx.points_change} NF
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="p-6 border-b bg-gray-50 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
            <span>Bảng Xếp Hạng Công Ty (Top 50)</span>
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hạng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nhân viên</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vai trò</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng NF</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tier</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaderboard.map((user, idx) => (
                <tr key={user.user_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-sm ${
                        idx === 0 ? 'bg-yellow-100 text-yellow-600 ring-2 ring-yellow-400' :
                        idx === 1 ? 'bg-gray-200 text-gray-600 ring-2 ring-gray-300' :
                        idx === 2 ? 'bg-orange-100 text-orange-600 ring-2 ring-orange-300' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {idx + 1}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold">
                          {(user.first_name?.[0] || '') + (user.last_name?.[0] || 'U')}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.first_name} {user.last_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">{user.role}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-lg font-bold text-gray-900">{user.total_points}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getTierColor(user.current_tier)}`}>
                      {user.current_tier}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GamificationBoard;
