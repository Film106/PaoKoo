"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Zap } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { createBrowserClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function QuickAddTransaction() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [txType, setTxType] = useState<"expense" | "income">("expense");
  const [walletId, setWalletId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchPersonalWallet() {
      const supabase = createBrowserClient();
      const { data } = await supabase.from("wallets").select("id").eq("type", "personal").limit(1).single();
      if (data) setWalletId(data.id);
    }
    fetchPersonalWallet();
  }, []);

  const handleSubmit = async () => {
    if (!amount || isNaN(Number(amount)) || !walletId) return;
    setIsSubmitting(true);
    
    const supabase = createBrowserClient();
    const { error } = await supabase.from("transactions").insert({
      wallet_id: walletId,
      amount: Number(amount),
      type: txType,
      category: selectedCategory || "Other",
      description: description || "Quick Add",
    });

    setIsSubmitting(false);
    if (!error) {
       setAmount("");
       setDescription("");
        setSelectedCategory(null);
        setIsOpen(false);
        router.refresh();
       // ideally trigger a refresh here, but for now just close
    } else {
       console.error("Failed to insert transaction:", error);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        className="fixed bottom-28 lg:bottom-8 right-8 z-50 w-16 h-16 rounded-full flex items-center justify-center cursor-pointer"
        style={{
          background: "linear-gradient(135deg, #00f5d4 0%, #4cc9f0 100%)",
          boxShadow:
            "0 0 30px rgba(0,245,212,0.3), 0 8px 32px rgba(0,0,0,0.3)",
        }}
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        id="quick-add-btn"
      >
        <Plus size={28} strokeWidth={3} color="#0a0a0f" />
      </motion.button>

      {/* Pulse ring behind FAB */}
      <div
        className="fixed bottom-28 lg:bottom-8 right-8 z-40 w-16 h-16 rounded-full pulse-ring"
        style={{
          background: "rgba(0,245,212,0.15)",
        }}
      />

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[60]"
              style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-[70] mx-auto max-w-lg"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div
                className="rounded-t-3xl p-6 pb-10"
                style={{
                  background: "linear-gradient(180deg, #1a1a2e 0%, #12121a 100%)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderBottom: "none",
                }}
              >
                {/* Handle bar */}
                <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-6" />

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold gradient-text">
                    Quick Add
                  </h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  >
                    <X size={16} className="text-text-secondary" />
                  </button>
                </div>

                {/* Type Toggle */}
                <div
                  className="flex rounded-xl p-1 mb-5"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                >
                  {(["expense", "income"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setTxType(type)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all capitalize cursor-pointer ${
                        txType === type
                          ? type === "expense"
                            ? "text-[#0a0a0f]"
                            : "text-[#0a0a0f]"
                          : "text-text-secondary"
                      }`}
                      style={
                        txType === type
                          ? {
                              background:
                                type === "expense"
                                  ? "linear-gradient(135deg, #f72585, #ff6b35)"
                                  : "linear-gradient(135deg, #00f5d4, #4cc9f0)",
                            }
                          : {}
                      }
                    >
                      {type === "expense" ? "💸 Expense" : "💰 Income"}
                    </button>
                  ))}
                </div>

                {/* Amount */}
                <div className="mb-4">
                  <label className="text-text-muted text-xs font-medium uppercase tracking-wider mb-2 block">
                    Amount (฿)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full text-3xl font-bold bg-transparent border-none outline-none text-text-primary placeholder:text-text-muted/30"
                    autoFocus
                    id="amount-input"
                  />
                  <div
                    className="h-px mt-2"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(0,245,212,0.3), transparent)",
                    }}
                  />
                </div>

                {/* Description */}
                <div className="mb-5">
                  <label className="text-text-muted text-xs font-medium uppercase tracking-wider mb-2 block">
                    Description
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={description}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
                      placeholder='e.g. "Starbucks Latte"'
                      className="w-full text-sm bg-transparent border-none outline-none text-text-primary placeholder:text-text-muted/40 py-2"
                      id="description-input"
                    />
                    <div
                      className="flex items-center gap-1 px-2 py-1 rounded-lg shrink-0"
                      style={{ background: "rgba(0,245,212,0.1)" }}
                    >
                      <Zap size={10} className="text-neon-cyan" />
                      <span className="text-[10px] text-neon-cyan font-semibold">
                        AI
                      </span>
                    </div>
                  </div>
                  <div
                    className="h-px mt-1"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
                    }}
                  />
                </div>

                {/* Categories */}
                <div className="mb-6">
                  <label className="text-text-muted text-xs font-medium uppercase tracking-wider mb-3 block">
                    Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.slice(0, 8).map((cat) => (
                      <motion.button
                        key={cat.name}
                        onClick={() => setSelectedCategory(cat.name)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                          selectedCategory === cat.name
                            ? "text-[#0a0a0f]"
                            : "text-text-secondary"
                        }`}
                        style={
                          selectedCategory === cat.name
                            ? { background: cat.color }
                            : {
                                background: "rgba(255,255,255,0.04)",
                                border: "1px solid rgba(255,255,255,0.06)",
                              }
                        }
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {cat.emoji} {cat.name}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Submit */}
                <motion.button
                  className="w-full btn-neon text-center text-base cursor-pointer disabled:opacity-50"
                  whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                  whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                  onClick={handleSubmit}
                  disabled={isSubmitting || !amount}
                  id="submit-transaction-btn"
                >
                  {isSubmitting ? "Adding..." : (
                    <>{txType === "expense" ? "💸" : "💰"} Add {txType === "expense" ? "Expense" : "Income"}</>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
