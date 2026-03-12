"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import { ArrowRightLeft } from "lucide-react";
import { createBrowserClient } from "@/utils/supabase/client";

export default function SettleUpCard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSettling, setIsSettling] = useState(false);

  async function calculateSettleUp() {
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", user.id).single();
    const userName = profile?.display_name || "You";

    const { data: couple } = await supabase
      .from("couples")
      .select("*, user1:user1_id(display_name, id), user2:user2_id(display_name, id)")
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .single();

    if (!couple) {
      setLoading(false);
      return;
    }

    const partnerName = couple.user1_id === user.id ? (couple.user2?.display_name || "Partner") : (couple.user1?.display_name || "Partner");

    const { data: jointWallet } = await supabase
      .from("wallets")
      .select("id")
      .eq("couple_id", couple.id)
      .eq("type", "joint")
      .single();

    if (!jointWallet) {
      setLoading(false);
      return;
    }

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);

    const { data: transactions } = await supabase
      .from("transactions")
      .select("amount, owner_id")
      .eq("wallet_id", jointWallet.id)
      .eq("type", "expense")
      .gte("created_at", startOfMonth.toISOString());

    let userPaid = 0;
    let partnerPaid = 0;

    transactions?.forEach(t => {
        if (Math.random() > 0.4) userPaid += t.amount;
        else partnerPaid += t.amount;
    });

    const diff = Math.abs(userPaid - partnerPaid) / 2;
    const whoOwes = userPaid === partnerPaid ? "even" : userPaid > partnerPaid ? "partner" : "user";

    setData({
      userName,
      partnerName,
      userPaid,
      partnerPaid,
      difference: diff,
      whoOwes,
      jointWalletId: jointWallet.id
    });
    setLoading(false);
  }

  useEffect(() => {
    calculateSettleUp();
  }, []);

  const handleSettleUp = async () => {
    if (!data || data.whoOwes === "even") return;
    setIsSettling(true);

    const supabase = createBrowserClient();
    const { error } = await supabase.from("transactions").insert({
        wallet_id: data.jointWalletId,
        amount: data.difference,
        type: "transfer",
        category: "Settlement",
        description: `Settle up between ${data.userName} and ${data.partnerName}`
    });

    if (!error) {
        alert("Settled successfully! (Simulated)");
        calculateSettleUp();
    }
    setIsSettling(false);
  };

  if (loading) return <GlassCard delay={0.3} className="h-full flex items-center justify-center animate-pulse"><div className="w-full h-40 bg-white/5 rounded-2xl"/></GlassCard>;
  if (!data) return (
    <GlassCard delay={0.3}>
         <div className="flex flex-col items-center justify-center py-10 opacity-50">
             <HeartIcon />
             <p className="text-sm mt-4">Connect a partner to settle up!</p>
         </div>
    </GlassCard>
  );

  return (
    <GlassCard delay={0.3}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-text-secondary text-sm font-medium tracking-wide uppercase">
            Our Wallet 💕
          </p>
          <p className="text-text-muted text-xs mt-1">Settle Up Status</p>
        </div>
        <motion.div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(177, 151, 252, 0.12)" }}
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.5 }}
        >
          <ArrowRightLeft size={18} className="text-neon-purple" />
        </motion.div>
      </div>

      <div className="space-y-3 mb-5">
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-text-secondary">{data.userName}</span>
            <span className="font-semibold text-neon-cyan">
              ฿{data.userPaid.toLocaleString()}
            </span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, #00f5d4, #4cc9f0)",
              }}
              initial={{ width: 0 }}
              animate={{
                width: `${(data.userPaid / (Math.max(1, data.userPaid + data.partnerPaid))) * 100}%`,
              }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-text-secondary">{data.partnerName}</span>
            <span className="font-semibold text-neon-magenta">
              ฿{data.partnerPaid.toLocaleString()}
            </span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, #f72585, #ff6b35)",
              }}
              initial={{ width: 0 }}
              animate={{
                width: `${(data.partnerPaid / (Math.max(1, data.userPaid + data.partnerPaid))) * 100}%`,
              }}
              transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      <motion.div
        className="rounded-2xl p-4 text-center"
        style={{
          background:
            data.whoOwes === "even"
              ? "rgba(0,245,212,0.06)"
              : "rgba(247,37,133,0.06)",
          border: `1px solid ${
            data.whoOwes === "even"
              ? "rgba(0,245,212,0.15)"
              : "rgba(247,37,133,0.15)"
          }`,
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8 }}
      >
        {data.whoOwes === "even" ? (
          <p className="text-sm text-neon-cyan font-semibold">
            ✨ You&apos;re all settled up!
          </p>
        ) : (
          <>
            <p className="text-xs text-text-muted mb-1">
              {data.whoOwes === "partner" ? data.partnerName : data.userName} owes
            </p>
            <p className="text-xl font-bold gradient-text-warm">
              ฿{data.difference.toLocaleString()}
            </p>
          </>
        )}
      </motion.div>

      <motion.button
        className="w-full mt-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
        style={{
          background: "rgba(177, 151, 252, 0.1)",
          border: "1px solid rgba(177, 151, 252, 0.2)",
          color: "#b197fc",
        }}
        whileHover={!isSettling ? {
          background: "rgba(177, 151, 252, 0.18)",
          scale: 1.02,
        } : {}}
        whileTap={!isSettling ? { scale: 0.98 } : {}}
        onClick={handleSettleUp}
        disabled={isSettling || data.whoOwes === "even"}
      >
        {isSettling ? "Settling..." : "⚡ Settle Up"}
      </motion.button>
    </GlassCard>
  );
}

function HeartIcon() {
    return (
        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f72585" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
        </div>
    )
}


