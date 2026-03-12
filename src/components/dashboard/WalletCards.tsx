import React, { useState, useEffect } from "react";
import { createBrowserClient } from "@/utils/supabase/client";
import Link from "next/link";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import { Wallet, Users, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";

const BASE_WALLETS = [
  {
    type: "personal",
    name: "My Wallet",
    fallbackBalance: 0,
    change: 12.5,
    positive: true,
    icon: Wallet,
    color: "#00f5d4",
    bgColor: "rgba(0, 245, 212, 0.1)",
    emoji: "💳",
  },
  {
    type: "joint",
    name: "Our Wallet",
    fallbackBalance: 0,
    change: -3.2,
    positive: false,
    icon: Users,
    color: "#b197fc",
    bgColor: "rgba(177, 151, 252, 0.1)",
    emoji: "💕",
  },
  {
    type: "investment",
    name: "Invest",
    fallbackBalance: 0,
    change: 8.7,
    positive: true,
    icon: TrendingUp,
    color: "#4cc9f0",
    bgColor: "rgba(76, 201, 240, 0.1)",
    emoji: "📈",
  },
];

export default function WalletCards() {
  const [walletBalances, setWalletBalances] = useState<Record<string, number>>({});
  
  useEffect(() => {
    async function fetchWallets() {
      const supabase = createBrowserClient();
      const { data, error } = await supabase.from("wallets").select("type, balance");
      if (data) {
        const balances: Record<string, number> = {};
        data.forEach(w => { balances[w.type] = w.balance; });
        setWalletBalances(balances);
      }
    }
    fetchWallets();
  }, []);
  return (
    <div className="col-span-full grid grid-cols-1 sm:grid-cols-3 gap-4">
      {BASE_WALLETS.map((wallet, i) => {
        const balance = walletBalances[wallet.type] !== undefined ? walletBalances[wallet.type] : wallet.fallbackBalance;
        const href = wallet.type === "personal" ? "/wallet" : wallet.type === "joint" ? "/joint" : "/invest";

        return (
          <Link key={wallet.name} href={href} className="block">
            <GlassCard delay={0.05 + i * 0.1} className="!p-5 h-full cursor-pointer hover:border-white/20 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: wallet.bgColor }}
                >
                  <span className="text-lg">{wallet.emoji}</span>
                </div>
                <motion.div
                  className="flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-lg"
                  style={{
                    background: wallet.positive
                      ? "rgba(0,245,212,0.08)"
                      : "rgba(247,37,133,0.08)",
                    color: wallet.positive ? "#00f5d4" : "#f72585",
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                >
                  {wallet.positive ? (
                    <ArrowUpRight size={12} />
                  ) : (
                    <ArrowDownRight size={12} />
                  )}
                  {Math.abs(wallet.change)}%
                </motion.div>
              </div>

              <p className="text-text-secondary text-xs font-medium mb-1">
                {wallet.name}
              </p>
              <motion.p
                className="text-xl font-bold"
                style={{ color: wallet.color }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                ฿{balance.toLocaleString()}
              </motion.p>
            </GlassCard>
          </Link>
        );
      })}
    </div>
  );
}

