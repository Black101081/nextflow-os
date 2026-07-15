import React, { useState, useEffect } from 'react';
import { Sparkles, Activity, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface AICopilotCardProps {
  insightText: string;
  txHash?: string;
}

export const AICopilotCard: React.FC<AICopilotCardProps> = ({ insightText, txHash }) => {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    let i = 0;
    setDisplayedText('');
    const interval = setInterval(() => {
      setDisplayedText(insightText.substring(0, i));
      i++;
      if (i > insightText.length) clearInterval(interval);
    }, 25);
    return () => clearInterval(interval);
  }, [insightText]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="col-span-1 md:col-span-2 lg:col-span-3 rounded-3xl p-6 relative overflow-hidden backdrop-blur-xl bg-white/40 dark:bg-gray-900/40 border border-white/20 dark:border-gray-700/50 shadow-2xl"
    >
      {/* Background Gradient Mesh */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
            NextFlow AI Copilot
          </h2>
          {txHash && (
            <div className="ml-auto flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified on U2U
            </div>
          )}
        </div>

        <div className="flex-1 min-h-[80px] p-4 rounded-2xl bg-white/50 dark:bg-gray-800/50 border border-white/40 dark:border-gray-700/50 font-medium text-gray-800 dark:text-gray-200 leading-relaxed shadow-inner">
          {displayedText}
          <span className="inline-block w-1.5 h-4 ml-1 bg-indigo-500 animate-pulse" />
        </div>
        
        {txHash && (
          <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-mono">
            <span className="flex items-center gap-1"><Activity className="w-3.5 h-3.5"/> Hash Anchor:</span>
            <span className="truncate max-w-[200px] md:max-w-xs">{txHash}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
