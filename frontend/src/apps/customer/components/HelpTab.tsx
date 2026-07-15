import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Bot, FileText, PhoneCall } from 'lucide-react';
import { Card, Button } from '../../../shared/components/ui';

interface HelpTabProps {
  onOpenChat: () => void;
}

export default function HelpTab({ onOpenChat }: HelpTabProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    { q: 'Làm thế nào để tôi đặt lịch hẹn trực tuyến?', a: 'Bạn chỉ cần truy cập vào Tab "Đặt lịch", chọn dịch vụ, thời gian phù hợp và kỹ thuật viên bạn mong muốn. Hệ thống sẽ tự động duyệt lịch và gửi tin nhắn Zalo xác nhận.' },
    { q: 'Tích lũy điểm thưởng và đổi quà như thế nào?', a: 'Mỗi giao dịch thanh toán thành công sẽ tự động tích điểm vào tài khoản của bạn (1% giá trị đơn hàng). Điểm thưởng có thể dùng để đổi Voucher hoặc quà tặng trực tiếp tại cửa hàng.' },
    { q: 'Ví Web3 U2U và Token NFTk là gì?', a: 'Đó là tính năng hoàn tiền mã hóa. Khi bạn thanh toán hóa đơn bằng cổng tiền mã hóa hoặc liên kết ví, hệ thống Smart Contract của U2U Network sẽ tự động đúc (mint) token NFTk gửi thẳng vào ví của bạn.' },
    { q: 'Tôi có thể thay đổi hoặc hủy lịch hẹn đã đặt không?', a: 'Có, bạn có thể gọi hotline trực tiếp hoặc trao đổi qua Chatbot AI trong Tab Trợ lý AI để yêu cầu dời lịch hẹn trước giờ phục vụ tối thiểu 2 tiếng.' }
  ];

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      {/* Help Channels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card variant="glass" className="p-5 flex flex-col gap-3 justify-between items-start border-indigo-500/10">
          <div className="flex flex-col gap-1">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Bot size={16} className="text-indigo-400" /> Trợ lý ảo AI Assistant
            </h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              Trò chuyện với chatbot AI để tra cứu đơn hàng, tư vấn dịch vụ và giải đáp thắc mắc tự động 24/7.
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={onOpenChat}>
            Chat với AI
          </Button>
        </Card>

        <Card variant="default" className="p-5 flex flex-col gap-3 justify-between items-start">
          <div className="flex flex-col gap-1">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <PhoneCall size={16} className="text-emerald-400" /> Hotline tổng đài CSKH
            </h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              Liên hệ trực tiếp với nhân viên tư vấn của chúng tôi nếu bạn cần hỗ trợ khẩn cấp.
            </p>
          </div>
          <a href="tel:19001234" className="text-emerald-400 text-xs font-bold hover:underline">
            Gọi ngay: 1900 1234 (Miễn phí)
          </a>
        </Card>
      </div>

      {/* FAQs Accordion */}
      <Card variant="default" className="p-5 flex flex-col gap-4">
        <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2 flex items-center gap-2">
          <HelpCircle size={16} className="text-indigo-400" /> Các câu hỏi thường gặp
        </h3>

        <div className="flex flex-col gap-2">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border-b border-white/5 pb-3 last:border-b-0 last:pb-0">
              <button 
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex justify-between items-center text-left py-2 text-xs font-bold text-slate-200 hover:text-white transition-colors"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {openFaq === idx && (
                <p className="text-[11px] text-slate-400 leading-relaxed mt-2 pl-1.5 border-l-2 border-indigo-500/30">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
