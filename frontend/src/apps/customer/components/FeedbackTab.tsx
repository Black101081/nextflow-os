import React, { useState } from 'react';
import { Star, MessageSquare, Heart, CheckCircle2 } from 'lucide-react';
import { Card, Button, useToast } from '../../../shared/components/ui';

export default function FeedbackTab() {
  const { showToast } = useToast();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      showToast('success', 'Cảm ơn bạn đã gửi đánh giá phản hồi!');
    }, 1000);
  };

  if (submitted) {
    return (
      <Card variant="default" className="p-8 text-center max-w-md mx-auto flex flex-col items-center gap-4">
        <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center">
          <CheckCircle2 size={24} />
        </div>
        <h3 className="text-base font-bold text-white">Gửi phản hồi thành công</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Ý kiến đóng góp của bạn rất có ý nghĩa trong việc cải thiện dịch vụ của chúng tôi ngày một tốt hơn.
        </p>
        <Button variant="outline" size="sm" onClick={() => { setSubmitted(false); setComment(''); setRating(5); }}>
          Gửi phản hồi khác
        </Button>
      </Card>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <Card variant="default" className="p-6">
        <h3 className="text-base font-bold text-white border-b border-white/5 pb-3 mb-5 flex items-center gap-2">
          <MessageSquare size={18} className="text-indigo-400" /> Đánh giá chất lượng dịch vụ
        </h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-slate-400">Bạn đánh giá trải nghiệm dịch vụ thế nào?</span>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  className="text-2xl focus:outline-none transition-transform active:scale-95"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                >
                  <Star 
                    className={`transition-colors ${
                      star <= (hoverRating ?? rating) 
                        ? 'fill-amber-400 text-amber-400' 
                        : 'text-slate-600'
                    }`} 
                    size={28}
                  />
                </button>
              ))}
            </div>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-1">
              {rating === 5 && 'Tuyệt vời'}
              {rating === 4 && 'Rất tốt'}
              {rating === 3 && 'Bình thường'}
              {rating === 2 && 'Tệ'}
              {rating === 1 && 'Rất tệ'}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Để lại ý kiến đóng góp của bạn</label>
            <textarea 
              rows={4}
              required
              placeholder="Chia sẻ trải nghiệm của bạn (về cơ sở vật chất, thái độ phục vụ, chất lượng kỹ thuật viên, v.v.)..."
              className="w-full bg-[#1e293b] border border-[#334155] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
              value={comment}
              onChange={e => setComment(e.target.value)}
            />
          </div>

          <Button variant="primary" type="submit" loading={loading} className="w-full">
            Gửi phản hồi
          </Button>
        </form>
      </Card>
    </div>
  );
}
