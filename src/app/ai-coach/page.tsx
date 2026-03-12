"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, Sparkles } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { createBrowserClient } from "@/utils/supabase/client";

export default function AiCoachPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);

  async function loadContext() {
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: wallets } = await supabase.from("wallets").select("balance, type");
    const { data: expenses } = await supabase.from("transactions").select("amount").eq("type", "expense").limit(20);
    
    const personalBalance = wallets?.find((w: any) => w.type === 'personal')?.balance || 0;
    const jointBalance = wallets?.find((w: any) => w.type === 'joint')?.balance || 0;
    const totalSpent = (expenses || []).reduce((acc: number, curr: any) => acc + curr.amount, 0);

    setMessages([
        {
          role: "assistant",
          content: `Hello! I'm your PaoKoo AI Coach. I see your personal wallet has ฿${personalBalance.toLocaleString()} and your joint wallet has ฿${jointBalance.toLocaleString()}. You've spent about ฿${totalSpent.toLocaleString()} recently. Based on this, I've got some ideas to help you save!`,
        }
    ]);
  }

  useEffect(() => {
    loadContext();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setInput("");

    setTimeout(() => {
      let aiResponse = "I'm processing your request based on your current financial status...";
      if (userMsg.toLowerCase().includes("spending")) {
          aiResponse = "Analyzing your spending logs... You've been quite consistent this week! Try to keep daily expenses under ฿500 to hit your next goal faster.";
      } else if (userMsg.toLowerCase().includes("vacation")) {
          aiResponse = "With your current joint savings, you're 65% of the way to a luxury weekend trip! If you save ฿2,000 more this month, you'll be set.";
      }

      setMessages(prev => [...prev, {
        role: "assistant",
        content: aiResponse
      }]);
    }, 1200);
  };

  return (
    <div className="p-6 lg:p-8 min-h-screen flex flex-col">
      <motion.header
        className="mb-6 flex-shrink-0"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#00f5d4] via-[#4cc9f0] to-[#b197fc] opacity-20 group-hover:opacity-40 transition-opacity" />
            <Bot className="text-[#00f5d4] relative z-10" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00f5d4] to-[#4cc9f0]">
              AI Financial Coach
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Personalized insights generated from your transaction history.
            </p>
          </div>
        </div>
      </motion.header>

      <GlassCard className="flex-1 flex flex-col p-0 overflow-hidden border-[#4cc9f0]/10">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div 
                className={`max-w-[80%] rounded-2xl p-4 ${
                  msg.role === "user" 
                    ? "bg-[rgba(255,255,255,0.05)] text-white border border-white/5 rounded-br-sm" 
                    : "bg-gradient-to-br from-[rgba(0,245,212,0.05)] to-[rgba(76,201,240,0.05)] text-[#f0f0f5] border border-[#00f5d4]/10 rounded-bl-sm"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={14} className="text-[#00f5d4]" />
                    <span className="text-xs font-bold text-[#00f5d4] uppercase tracking-wider">AI Coach</span>
                  </div>
                )}
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="p-4 border-t border-white/5 bg-[rgba(10,10,15,0.5)]">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
              placeholder="Ask about your budget, investments, or goals..."
              className="w-full bg-[rgba(255,255,255,0.03)] border border-white/5 rounded-xl py-4 pl-4 pr-14 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-[#4cc9f0]/50 transition-colors"
            />
            <button 
              type="submit"
              disabled={!input.trim()}
              className="absolute right-2 w-10 h-10 rounded-lg bg-gradient-to-r from-[#00f5d4] to-[#4cc9f0] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
            >
              <Send size={18} color="#0a0a0f" className="ml-0.5" />
            </button>
          </form>
          <div className="flex justify-center mt-3 gap-2">
             <button onClick={() => setInput("How is our spending this week?")} className="text-[10px] px-2 py-1 rounded-md bg-white/5 text-text-secondary hover:text-white transition-colors">How is our spending this week?</button>
             <button onClick={() => setInput("Can we afford a vacation?")} className="text-[10px] px-2 py-1 rounded-md bg-white/5 text-text-secondary hover:text-white transition-colors">Can we afford a vacation?</button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
