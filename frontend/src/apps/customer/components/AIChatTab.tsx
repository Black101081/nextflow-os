import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, Send, Loader2, Mic, PhoneCall, ShieldCheck, Headset, User } from 'lucide-react';

interface AIChatTabProps {
  chatMessages: any[];
  sendingChat: boolean;
  chatInput: string;
  setChatInput: (val: string) => void;
  aiSuggestions: string[];
  handleSendMessage: (e: React.FormEvent, msgOverride?: string) => void;
}

export default function AIChatTab({
  chatMessages, sendingChat, chatInput, setChatInput, aiSuggestions, handleSendMessage
}: AIChatTabProps) {
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [callStatus, setCallStatus] = useState('Đang kết nối...');

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, sendingChat]);

  const recognitionRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCamera, setHasCamera] = useState(false);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'vi-VN';

      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        if (text) {
          handleSendMessage({ preventDefault: () => {} } as React.FormEvent, text);
        }
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error', event);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [handleSendMessage]);

  const handleMicPress = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error(err);
      }
    } else {
      setIsListening(true);
    }
  };

  const handleMicRelease = () => {
    if (!isListening) return;
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error(err);
      }
    } else {
      const mockVoiceText = "Hỗ trợ tôi đặt lịch hẹn";
      handleSendMessage({ preventDefault: () => {} } as React.FormEvent, mockVoiceText);
    }
  };

  // Live WebRTC Camera stream setup
  useEffect(() => {
    let localStream: MediaStream | null = null;
    if (showVideoCall) {
      setHasCamera(false);
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then((stream) => {
          localStream = stream;
          setHasCamera(true);
          // Wait a tick for videoRef to render
          setTimeout(() => {
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          }, 100);
        })
        .catch((err) => {
          console.error("Camera access denied or unavailable", err);
        });
    } else {
      setHasCamera(false);
    }
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [showVideoCall]);

  // Simulate Triage Video Call
  const startVideoCall = () => {
    setShowVideoCall(true);
    setCallStatus('Đang kết nối...');
    setTimeout(() => {
      setCallStatus('Đang chờ Tổng đài viên...');
    }, 1500);
    setTimeout(() => {
      setCallStatus('Đã kết nối: NV Nguyễn Văn A');
    }, 4000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-[calc(100vh-140px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-[0_5px_15px_rgba(168,85,247,0.3)]">
            <Bot size={22} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold m-0 text-white leading-tight">AI Concierge</h2>
            <div className="text-[11px] font-semibold text-purple-400 flex items-center gap-1 mt-0.5 uppercase tracking-wider">
              <Sparkles size={10} /> Context-Aware Mode
            </div>
          </div>
        </div>
        
        <button 
          onClick={startVideoCall}
          className="bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 px-3.5 py-2 rounded-xl text-sky-400 flex items-center gap-1.5 cursor-pointer text-xs font-bold transition-colors active:scale-95"
        >
          <Headset size={16} /> <span className="hidden xs:inline">Gặp CSKH</span>
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-white/[0.02] backdrop-blur-sm border border-white/5 rounded-3xl p-4 flex flex-col overflow-y-auto gap-4 relative hide-scrollbar shadow-inner">
        
        {/* Voice Recognition Overlay */}
        <AnimatePresence>
          {isListening && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-3xl z-10 flex flex-col items-center justify-center"
            >
              <Mic size={48} className="text-purple-400 mb-8 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
              
              {/* Voice Waves */}
              <div className="flex gap-2 items-end h-[60px]">
                {[1, 2, 3, 4, 5].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ height: ['20%', '100%', '20%'] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1, ease: 'easeInOut' }}
                    className="w-2.5 bg-gradient-to-t from-purple-500 to-pink-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                  />
                ))}
              </div>
              
              <p className="text-white mt-8 text-sm font-bold tracking-wide">Đang lắng nghe...</p>
              <p className="text-slate-400 text-xs mt-2 font-medium">Thả nút để gửi</p>
            </motion.div>
          )}
        </AnimatePresence>

        {chatMessages.map(msg => {
          const isUser = msg.sender_type === 'CUSTOMER';
          return (
            <div key={msg.id} className={`max-w-[85%] ${isUser ? 'self-end' : 'self-start'}`}>
              <div className={`px-4 py-3 text-sm leading-relaxed text-white shadow-sm
                ${isUser 
                  ? 'bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl rounded-br-sm' 
                  : 'bg-white/10 border border-white/5 rounded-2xl rounded-bl-sm backdrop-blur-md'
                }`}
              >
                {msg.content}
              </div>
              {!isUser && <div className="text-[10px] text-slate-500 mt-1.5 ml-1 font-semibold tracking-wide">AI Assistant</div>}
            </div>
          );
        })}
        {sendingChat && (
          <div className="self-start px-4 py-3 rounded-2xl rounded-bl-sm bg-white/5 border border-white/5 backdrop-blur-md">
            <Loader2 size={18} className="animate-spin text-purple-400" />
          </div>
        )}
        <div ref={chatEndRef} className="h-[1px]"></div>
      </div>

      {/* Suggestions */}
      {aiSuggestions.length > 0 && !isListening && (
        <div className="flex gap-2 overflow-x-auto py-3 hide-scrollbar snap-x">
          {aiSuggestions.map((sug, idx) => (
            <button 
              key={idx} 
              onClick={(e) => handleSendMessage(e, sug)} 
              className="whitespace-nowrap px-4 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-300 text-xs font-semibold cursor-pointer transition-colors snap-center active:scale-95"
            >
              {sug}
            </button>
          ))}
        </div>
      )}

      {/* Input Group */}
      <div className="flex gap-2 mt-2 items-center">
        <button 
          onMouseDown={handleMicPress} onMouseUp={handleMicRelease} onMouseLeave={handleMicRelease}
          onTouchStart={handleMicPress} onTouchEnd={handleMicRelease}
          className={`w-[52px] h-[52px] shrink-0 rounded-2xl flex items-center justify-center cursor-pointer transition-all active:scale-90 border
            ${isListening 
              ? 'bg-rose-500 border-rose-400 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)] scale-95' 
              : 'bg-white/5 border-white/10 text-purple-400 hover:bg-white/10 hover:text-purple-300'
            }`}
        >
          <Mic size={22} />
        </button>
        
        <form onSubmit={handleSendMessage} className="flex-1 flex gap-2 relative">
          <input 
            type="text" 
            value={chatInput} 
            onChange={e=>setChatInput(e.target.value)} 
            placeholder="Nhập tin nhắn..." 
            className="w-full py-4 pl-5 pr-14 rounded-2xl bg-white/5 border border-white/10 text-white text-[15px] outline-none focus:border-purple-500/50 transition-colors placeholder:text-slate-500" 
          />
          <button 
            type="submit" 
            disabled={sendingChat || !chatInput} 
            className={`absolute right-1.5 top-1.5 bottom-1.5 w-[40px] rounded-xl flex items-center justify-center border-none transition-all
              ${(sendingChat || !chatInput) 
                ? 'bg-transparent text-slate-500' 
                : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] cursor-pointer active:scale-90'
              }`}
          >
            <Send size={18} className="ml-1" />
          </button>
        </form>
      </div>

      {/* Video Call Triage Modal */}
      <AnimatePresence>
        {showVideoCall && (
          <motion.div 
            initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[3000] bg-slate-950 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 flex justify-between items-center z-10 bg-gradient-to-b from-black/80 to-transparent">
              <div className="text-white font-bold text-lg flex items-center gap-2">
                <ShieldCheck size={20} className="text-emerald-500" /> CSKH Trực tuyến
              </div>
            </div>

            {/* Video Area */}
            <div className="flex-1 relative mx-4 rounded-[32px] overflow-hidden bg-slate-900 border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              
              {/* Operator Video (Simulated) */}
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80')] bg-center bg-cover opacity-70"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
              
              {/* Customer Mini Video (Live WebRTC Feed) */}
              <div className="absolute top-5 right-5 w-[110px] h-[150px] rounded-2xl bg-black/40 border-2 border-white/20 overflow-hidden backdrop-blur-xl flex items-center justify-center shadow-lg">
                {hasCamera ? (
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  <User size={36} className="text-white/40" />
                )}
              </div>

              {/* Status Overlay */}
              <div className="absolute bottom-8 left-0 right-0 text-center flex flex-col items-center">
                <div className="text-xl font-bold text-white drop-shadow-md mb-3 px-4 text-center">{callStatus}</div>
                {callStatus.includes('Đang') && (
                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <Loader2 size={24} className="animate-spin text-sky-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Call Controls */}
            <div className="p-8 flex justify-center gap-6 pb-12">
              <button className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center cursor-pointer transition-colors backdrop-blur-md active:scale-95">
                <Mic size={26} />
              </button>
              <button 
                onClick={() => setShowVideoCall(false)}
                className="w-16 h-16 rounded-full bg-rose-500 hover:bg-rose-400 border border-rose-400 text-white flex items-center justify-center cursor-pointer shadow-[0_0_25px_rgba(244,63,94,0.5)] transition-colors active:scale-95"
              >
                <PhoneCall size={26} className="rotate-[135deg]" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
