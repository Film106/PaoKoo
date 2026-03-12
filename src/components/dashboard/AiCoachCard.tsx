"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import { Sparkles, RefreshCw } from "lucide-react";

const DEMO_COMMENTS = [
  {
    type: "roast" as const,
    message:
      "☕ You spent ฿2,400 on coffee this month... That's literally a flight to Chiang Mai. Your wallet is crying, but at least you're caffeinated! 💀",
  },
  {
    type: "toast" as const,
    message:
      "🎉 AMAZING! You saved 15% more than last month! At this rate, that Japan trip fund will be ready by August. Keep slaying, money queen! 👑",
  },
  {
    type: "roast" as const,
    message:
      "🛍️ Shopee at 2 AM again? You added ฿890 in 'Shopping' while your emergency fund sits at 92%. Your future self is judging you... but also impressed by the deals. 😏",
  },
  {
    type: "toast" as const,
    message:
      "💎 Your net worth just crossed ฿140k! You two are building wealth together like pros. The Grow Tree is smiling. Keep it up, power couple! 🌳✨",
  },
];

export default function AiCoachCard() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const comment = DEMO_COMMENTS[currentIndex];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % DEMO_COMMENTS.length);
      setIsRefreshing(false);
    }, 600);
  };

  // Auto-cycle every 10s
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % DEMO_COMMENTS.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <GlassCard
      delay={0.4}
      glow={comment.type === "roast" ? "magenta" : "cyan"}
      className="col-span-full"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background:
                comment.type === "roast"
                  ? "rgba(247, 37, 133, 0.12)"
                  : "rgba(0, 245, 212, 0.12)",
            }}
            animate={{ rotate: isRefreshing ? 360 : 0 }}
          >
            <Sparkles
              size={18}
              style={{
                color: comment.type === "roast" ? "#f72585" : "#00f5d4",
              }}
            />
          </motion.div>
          <div>
            <p className="text-sm font-semibold text-text-primary">
              AI Financial Coach
            </p>
            <p className="text-xs text-text-muted">
              {comment.type === "roast" ? "🔥 Roast Mode" : "🎉 Toast Mode"}
            </p>
          </div>
        </div>
        <motion.button
          onClick={handleRefresh}
          className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer"
          style={{ background: "rgba(255,255,255,0.04)" }}
          whileHover={{ scale: 1.1, background: "rgba(255,255,255,0.08)" }}
          whileTap={{ scale: 0.9 }}
        >
          <RefreshCw
            size={14}
            className={`text-text-secondary ${
              isRefreshing ? "animate-spin" : ""
            }`}
          />
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl p-4"
          style={{
            background:
              comment.type === "roast"
                ? "rgba(247, 37, 133, 0.05)"
                : "rgba(0, 245, 212, 0.05)",
            border: `1px solid ${
              comment.type === "roast"
                ? "rgba(247, 37, 133, 0.12)"
                : "rgba(0, 245, 212, 0.12)"
            }`,
          }}
        >
          <p className="text-sm leading-relaxed text-text-primary/90">
            {comment.message}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Reaction dots */}
      <div className="flex items-center justify-center gap-1.5 mt-4">
        {DEMO_COMMENTS.map((_, i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background:
                i === currentIndex
                  ? comment.type === "roast"
                    ? "#f72585"
                    : "#00f5d4"
                  : "rgba(255,255,255,0.1)",
            }}
            animate={i === currentIndex ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>
    </GlassCard>
  );
}
