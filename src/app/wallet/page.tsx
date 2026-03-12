"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Wallet, ArrowDownRight, ArrowUpRight, TrendingUp, Plus, X } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { createBrowserClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function PersonalWalletPage() {
  const router = useRouter();
  const [balance, setBalance] = useState<number | null>(null);
  const [walletId, setWalletId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function fetchWalletData() {
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    // Get the personal wallet for this user 
    // Replace with actual user_id logic later
    const { data: walletData, error: walletError } = await supabase
      .from("wallets")
      .select("*")
      .eq("owner_id", user.id)
      .eq("type", "personal")
      .limit(1)
      .single();

    if (walletData) {
      setBalance(walletData.balance);
      setWalletId(walletData.id);

      const { data: txData } = await supabase
        .from("transactions")
        .select("*")
        .eq("wallet_id", walletData.id)
        .order("created_at", { ascending: false })
        .limit(10);
        
      if (txData) setTransactions(txData);
    }
    
    setLoading(false);
  }

  useEffect(() => {
    fetchWalletData();
  }, []);

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !walletId) return;
    setSubmitting(true);

    const supabase = createBrowserClient();
    const { error } = await supabase.from("transactions").insert({
        wallet_id: walletId,
        amount: Number(amount),
        type: "income",
        category: "Transfer",
        description: "Added funds"
    });

    if (!error) {
        setAmount("");
        setIsModalOpen(false);
        fetchWalletData();
        router.refresh();
    }
    setSubmitting(false);
  };

  const handleTransfer = () => {
      alert("Transfer feature coming soon! You can use 'Quick Add' on the dashboard to record transfers manually.");
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
            style={{ background: "rgba(0, 245, 212, 0.1)" }}
          >
            <Wallet className="text-[#00f5d4]" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              Personal Wallet
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Your individual spending & income tracking.
            </p>
          </div>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <GlassCard className="col-span-full lg:col-span-1 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00f5d4] blur-[100px] opacity-20 rounded-full" />
          <h2 className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-2">
            Available Balance
          </h2>
          {loading ? (
            <div className="w-40 h-10 bg-white/5 rounded-md animate-pulse mb-6" />
          ) : (
            <p className="text-5xl font-extrabold text-[#00f5d4] mb-6 glow-text-cyan">
              ฿{balance !== null ? balance.toLocaleString() : "0"}
            </p>
          )}

          <div className="flex gap-3">
            <button 
                onClick={() => setIsModalOpen(true)}
                className="flex-1 py-3 rounded-xl bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.08)] border border-white/5 text-sm font-semibold transition-all cursor-pointer"
            >
              Add Funds
            </button>
            <button 
                onClick={handleTransfer}
                className="flex-1 py-3 rounded-xl bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.08)] border border-white/5 text-sm font-semibold transition-all cursor-pointer"
            >
              Transfer
            </button>
          </div>
        </GlassCard>

        <GlassCard className="col-span-full lg:col-span-2 p-6">
          <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-text-secondary" />
            Recent Transactions
          </h3>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-10 text-text-muted">
              <p>No transactions found.</p>
              <p className="text-xs mt-1">Add some using the Quick Add button.</p>
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
                            ? "rgba(0, 245, 212, 0.1)"
                            : "rgba(247, 37, 133, 0.1)",
                      }}
                    >
                      {tx.type === "income" ? (
                        <ArrowDownRight size={18} className="text-[#00f5d4]" />
                      ) : (
                        <ArrowUpRight size={18} className="text-[#f72585]" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary">
                        {tx.description || tx.category || "Transaction"}
                      </p>
                      <p className="text-xs text-text-muted">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`font-bold ${
                      tx.type === "income" ? "text-[#00f5d4]" : "text-[#f0f0f5]"
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

      {/* Add Funds Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md p-6 rounded-3xl"
            style={{ 
              background: "linear-gradient(180deg, #1a1a2e 0%, #12121a 100%)",
              border: "1px solid rgba(255,255,255,0.1)"
            }}
          >
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold gradient-text">Add Funds 💰</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-white"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleAddFunds} className="space-y-4">
                <div>
                   <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Amount (฿)</label>
                   <input 
                     type="number" 
                     required
                     autoFocus
                     placeholder="0.00"
                     value={amount}
                     onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
                     className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-2xl font-bold text-white focus:outline-none focus:border-neon-cyan/50"
                   />
                </div>
                <motion.button
                  type="submit"
                  disabled={submitting}
                  className="w-full btn-neon py-3 mt-4 disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {submitting ? "Processing..." : "Add to Wallet"}
                </motion.button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
