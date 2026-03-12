"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, ArrowDownRight, ArrowUpRight, Heart, RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import GlassCard from "@/components/ui/GlassCard";
import { createBrowserClient } from "@/utils/supabase/client";

export default function JointWalletPage() {
  const router = useRouter();
  const [balance, setBalance] = useState<number | null>(null);
  const [walletId, setWalletId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJointData() {
      const supabase = createBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: walletData } = await supabase
        .from("wallets")
        .select("*")
        .eq("type", "joint")
        .limit(1)
        .maybeSingle();

      if (walletData) {
        setBalance(walletData.balance);
        setWalletId(walletData.id);

        const { data: txData } = await supabase
          .from("transactions")
          .select("*")
          .eq("wallet_id", walletData.id)
          .order("created_at", { ascending: false })
          .limit(15);
          
        if (txData) setTransactions(txData);
      }
      
      setLoading(false);
    }

    fetchJointData();
  }, []);

  const handleDeposit = () => {
      alert("Joint deposit feature is coming soon! You can use the Quick Add button (+) on the dashboard for now.");
  };

  const handleSettleUp = () => {
      router.push("/"); // Lead back to dashboard where settle up card is highly functional
  };

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
            style={{ background: "rgba(177, 151, 252, 0.1)" }}
          >
            <Users className="text-[#b197fc]" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
              Our Wallet <Heart size={18} className="text-[#f72585] fill-[#f72585]" />
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Shared expenses, dates, and couple finances.
            </p>
          </div>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <GlassCard className="col-span-full lg:col-span-1 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#b197fc] blur-[100px] opacity-20 rounded-full" />
          <h2 className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-2">
            Joint Balance
          </h2>
          {loading ? (
            <div className="w-40 h-10 bg-white/5 rounded-md animate-pulse mb-6" />
          ) : (
            <p className="text-5xl font-extrabold text-[#b197fc] mb-6 glow-text-purple" style={{ textShadow: "0 0 20px rgba(177,151,252,0.4)" }}>
              ฿{balance ? balance.toLocaleString() : "0"}
            </p>
          )}

          <div className="flex gap-3">
            <button 
                onClick={handleDeposit}
                className="flex-1 py-3 rounded-xl bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.08)] border border-white/5 text-sm font-semibold transition-all cursor-pointer"
            >
              Deposit
            </button>
            <button 
                onClick={handleSettleUp}
                className="flex-1 py-3 rounded-xl bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.08)] border border-white/5 text-sm font-semibold transition-all cursor-pointer"
            >
              Settle Up
            </button>
          </div>
        </GlassCard>

        <GlassCard className="col-span-full lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <RefreshCcw size={18} className="text-text-secondary" />
              Shared Activity
            </h3>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-10 text-text-muted">
              <p>No joint transactions found.</p>
              <p className="text-xs mt-1">Start by adding a shared expense!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx: any, i) => (
                <motion.div
                  key={tx.id || i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.04)] transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{
                        background:
                          tx.type === "income"
                            ? "rgba(177, 151, 252, 0.1)"
                            : "rgba(247, 37, 133, 0.1)",
                      }}
                    >
                      {tx.type === "income" ? (
                        <ArrowDownRight size={18} className="text-[#b197fc]" />
                      ) : (
                        <ArrowUpRight size={18} className="text-[#f72585]" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary">
                        {tx.description || tx.category || "Shared Transaction"}
                      </p>
                      <p className="text-xs text-text-muted">
                        {new Date(tx.created_at).toLocaleDateString()} • Paid by You
                      </p>
                    </div>
                  </div>
                  <p
                    className={`font-bold ${
                      tx.type === "income" ? "text-[#b197fc]" : "text-[#f0f0f5]"
                    }`}
                  >
                    {tx.type === "income" ? "+" : "-"}฿{tx.amount.toLocaleString()}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
