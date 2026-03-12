"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, BarChart3, Activity } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { createBrowserClient } from "@/utils/supabase/client";

export default function InvestPage() {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInvestData() {
      const supabase = createBrowserClient();
      
      const { data: walletData } = await supabase
        .from("wallets")
        .select("*")
        .eq("type", "investment")
        .limit(1)
        .single();

      if (walletData) {
        setBalance(walletData.balance);
      }
      
      setLoading(false);
    }

    fetchInvestData();
  }, []);

  return (
    <div className="p-6 lg:p-8 min-h-screen relative">
      <motion.header
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: "rgba(76, 201, 240, 0.1)" }}
          >
            <TrendingUp className="text-[#4cc9f0]" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              Investment Portfolio
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Grow your wealth together for the future.
            </p>
          </div>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <GlassCard className="col-span-full lg:col-span-1 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#4cc9f0] blur-[100px] opacity-20 rounded-full" />
          <h2 className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-2">
            Total Invested
          </h2>
          {loading ? (
            <div className="w-40 h-10 bg-white/5 rounded-md animate-pulse mb-6" />
          ) : (
            <p className="text-5xl font-extrabold text-[#4cc9f0] mb-6 glow-text-blue" style={{ textShadow: "0 0 20px rgba(76,201,240,0.4)" }}>
              ฿{balance ? balance.toLocaleString() : "0"}
            </p>
          )}

          <div className="flex gap-3">
            <button 
                onClick={() => alert("Asset buying coming soon! We are integrating with major brokers.")}
                className="flex-1 py-3 rounded-xl bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.08)] border border-white/5 text-sm font-semibold transition-all cursor-pointer"
            >
              Buy Asset
            </button>
            <button 
                onClick={() => alert("Portfolio analysis is being calculated...")}
                className="flex-1 py-3 rounded-xl bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.08)] border border-white/5 text-sm font-semibold transition-all text-[#4cc9f0] cursor-pointer"
            >
              Analysis
            </button>
          </div>
        </GlassCard>

        <GlassCard className="col-span-full lg:col-span-2 p-6 flex flex-col items-center justify-center text-center min-h-[300px]">
          <BarChart3 size={48} className="text-[#4cc9f0]/40 mb-4" />
          <h3 className="text-xl font-bold text-text-primary mb-2">
            Asset Tracking Coming Soon
          </h3>
          <p className="text-text-muted max-w-sm mx-auto">
            You will be able to link brokerage accounts or manually add stocks, crypto, and real estate to track compound growth.
          </p>
        </GlassCard>
      </div>
      
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
        <GlassCard className="p-6">
            <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              <Activity size={18} className="text-[#00f5d4]" />
              Market Overview
            </h3>
            <div className="space-y-4">
               {[
                 { name: "S&P 500", ticker: "SPY", price: "$512.30", change: "+1.2%" },
                 { name: "Bitcoin", ticker: "BTC", price: "$64,200", change: "+4.5%" },
                 { name: "Thai SET", ticker: "SET", price: "1,380.12", change: "-0.4%" }
               ].map((asset, i) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-[rgba(255,255,255,0.02)]">
                    <div>
                      <p className="font-semibold text-text-primary">{asset.name}</p>
                      <p className="text-xs text-text-muted">{asset.ticker}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-text-primary">{asset.price}</p>
                      <p className={`text-xs ${asset.change.startsWith('+') ? 'text-[#00f5d4]' : 'text-[#f72585]'}`}>
                        {asset.change}
                      </p>
                    </div>
                  </div>
               ))}
            </div>
        </GlassCard>
        
        <GlassCard className="p-6" style={{ background: "linear-gradient(135deg, rgba(76,201,240,0.1), rgba(177,151,252,0.1))" }}>
            <h3 className="text-xl font-bold text-white mb-2">Grow Your Future</h3>
            <p className="text-text-secondary text-sm mb-6">Connect your investment accounts to let our AI Coach find optimization opportunities.</p>
            <button className="btn-neon w-full">Connect Broker</button>
        </GlassCard>
      </div>
    </div>
  );
}
