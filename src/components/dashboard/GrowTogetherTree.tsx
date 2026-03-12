"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import { createBrowserClient } from "@/utils/supabase/client";

export default function GrowTogetherTree() {
  const [netWorth, setNetWorth] = useState(0);
  const [loading, setLoading] = useState(true);
  const milestone = 500000; // Target milestone for the tree to be fully grown

  useEffect(() => {
    async function fetchNetWorth() {
      const supabase = createBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch all wallets (personal + joint if connected)
      const { data: wallets } = await supabase.from("wallets").select("balance");
      const total = wallets?.reduce((sum, w) => sum + (w.balance || 0), 0) || 0;
      setNetWorth(total);
      setLoading(false);
    }
    fetchNetWorth();
  }, []);

  const progress = Math.min((netWorth / milestone) * 100, 100);

  // Tree growth stages
  const getTreeStage = (p: number) => {
    if (p < 20) return { emoji: "🌱", label: "Seedling", color: "#69db7c" };
    if (p < 40) return { emoji: "🌿", label: "Sprout", color: "#51cf66" };
    if (p < 60) return { emoji: "🪴", label: "Growing", color: "#40c057" };
    if (p < 80) return { emoji: "🌳", label: "Thriving", color: "#37b24d" };
    return { emoji: "🌲", label: "Mighty Oak", color: "#2f9e44" };
  };

  const stage = getTreeStage(progress);

  return (
    <GlassCard delay={0.5} className="relative overflow-hidden">
      {/* Ambient glow */}
      <div
        className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-20"
        style={{ background: stage.color }}
      />

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div>
          <p className="text-text-secondary text-sm font-medium tracking-wide uppercase">
            Grow Together 🌱
          </p>
          <p className="text-text-muted text-xs mt-1">
            Your couple&apos;s wealth tree
          </p>
        </div>
      </div>

      {/* Tree Visualization */}
      <div className="flex flex-col items-center py-4 relative z-10">
        {loading ? (
             <div className="w-16 h-16 bg-white/5 rounded-full animate-pulse mb-3" />
        ) : (
            <motion.div
              className="text-6xl mb-3 float"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.7 }}
            >
              {stage.emoji}
            </motion.div>
        )}
        <motion.p
          className="text-sm font-semibold mb-1"
          style={{ color: stage.color }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          {loading ? "..." : stage.label}
        </motion.p>
        <p className="text-xs text-text-muted">
          ฿{(netWorth / 1000).toFixed(0)}k / ฿{(milestone / 1000).toFixed(0)}k
        </p>
      </div>

      {/* Progress bar */}
      <div className="relative z-10">
        <div
          className="h-3 rounded-full overflow-hidden progress-glow"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${stage.color}, #00f5d4)`,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.5, delay: 0.6, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-text-muted mt-1.5">
          <span>Level {Math.floor(progress / 20) + 1}</span>
          <span>{progress.toFixed(0)}%</span>
        </div>
      </div>
    </GlassCard>
  );
}

