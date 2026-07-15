import React, { useState, useEffect } from 'react';
import { Shield, Link as LinkIcon, Clock, Database, RefreshCw, Hash, FileJson, CheckCircle } from 'lucide-react';

interface LedgerRecord {
  id: string;
  tenant_id: string;
  tx_hash: string;
  payload_snapshot: any;
  network: string;
  status: string;
  created_at: string;
}

export default function BlockchainExplorer() {
  const [records, setRecords] = useState<LedgerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<LedgerRecord | null>(null);

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('nf_access_token');
      const res = await fetch('/api/v1/platform/blockchain/ledger?limit=50', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setRecords(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
    const interval = setInterval(fetchLedger, 5000); // Polling every 5s for demo
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            Blockchain Ledger Explorer
          </h1>
          <p className="text-gray-500 mt-2">Giám sát các giao dịch được neo trên mạng U2U Network theo thời gian thực.</p>
        </div>
        <button 
          onClick={fetchLedger}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <Database className="w-5 h-5 text-gray-500" />
                Latest Blocks / Transactions
              </h2>
              <span className="text-xs font-medium bg-green-100 text-green-700 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                LIVE NETWORK
              </span>
            </div>
            
            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {records.length === 0 && !loading && (
                <div className="p-8 text-center text-gray-500">
                  Chưa có giao dịch nào được ghi nhận.
                </div>
              )}
              {records.map(record => (
                <div 
                  key={record.id} 
                  onClick={() => setSelectedRecord(record)}
                  className={`p-4 hover:bg-blue-50 cursor-pointer transition-colors ${selectedRecord?.id === record.id ? 'bg-blue-50 border-l-4 border-blue-500' : 'border-l-4 border-transparent'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-gray-100 rounded-md">
                        <LinkIcon className="w-4 h-4 text-gray-500" />
                      </div>
                      <span className="font-mono text-sm text-blue-600 truncate max-w-[200px] sm:max-w-xs">{record.tx_hash}</span>
                    </div>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(record.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">Tenant: {record.tenant_id.split('-')[0]}...</span>
                    <span className="flex items-center gap-1 text-green-600 font-medium">
                      <CheckCircle className="w-3 h-3" />
                      {record.status}
                    </span>
                    <span className="text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">{record.network}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          {selectedRecord ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sticky top-8">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Hash className="w-5 h-5 text-gray-500" />
                Transaction Details
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Transaction Hash</label>
                  <div className="mt-1 font-mono text-sm bg-gray-50 p-2 rounded border border-gray-100 break-all text-blue-600">
                    {selectedRecord.tx_hash}
                  </div>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Timestamp</label>
                  <div className="mt-1 text-sm text-gray-800">
                    {new Date(selectedRecord.created_at).toLocaleString()}
                  </div>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Network</label>
                  <div className="mt-1 text-sm font-medium text-purple-600">
                    {selectedRecord.network}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase flex items-center gap-1 mb-1">
                    <FileJson className="w-3 h-3" />
                    Original Data Payload
                  </label>
                  <div className="bg-gray-900 rounded-lg p-3 overflow-x-auto">
                    <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                      {JSON.stringify(selectedRecord.payload_snapshot, null, 2)}
                    </pre>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Dữ liệu này đã được băm bằng SHA-256 để tạo thành Hash phía trên và được bảo vệ bất biến.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl border border-dashed border-gray-300 h-full min-h-[300px] flex flex-col items-center justify-center text-gray-500 p-6 text-center">
              <Shield className="w-12 h-12 text-gray-300 mb-3" />
              <p>Chọn một Transaction để xem chi tiết dữ liệu gốc được neo trên Blockchain.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
