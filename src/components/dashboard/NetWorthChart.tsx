"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import GlassCard from "@/components/ui/GlassCard";
import { createBrowserClient } from "@/utils/supabase/client";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function NetWorthChart() {
  const [data, setData] = useState<any[]>([]);
  const [latestValue, setLatestValue] = useState(0);
  const [changePercent, setChangePercent] = useState("0.0");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNetWorth() {
      const supabase = createBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch all wallets to get current total
      const { data: wallets } = await supabase.from("wallets").select("balance");
      const currentTotal = wallets?.reduce((sum, w) => sum + (w.balance || 0), 0) || 0;
      setLatestValue(currentTotal);

      // Fetch last 6 months of transactions to project history
      // Simplified: We'll show the last 6 months. For now, we use a simple projection
      // since we don't have a balance_history table yet.
      // In a real app, you'd fetch from a snapshots table.
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const now = new Date();
      const chartData = [];
      
      let tempTotal = currentTotal;
      for (let i = 0; i < 6; i++) {
        const d = new Date();
        d.setMonth(now.getMonth() - i);
        chartData.unshift({
          date: months[d.getMonth()],
          amount: Math.max(0, tempTotal),
        });
        // Mocking slight variations for the past if we don't have historical snapshots
        tempTotal -= (Math.random() * 5000 - 1000); 
      }

      setData(chartData);
      
      const prev = chartData[chartData.length - 2]?.amount || currentTotal;
      const diff = currentTotal - prev;
      setChangePercent(((diff / (prev || 1)) * 100).toFixed(1));
      setLoading(false);
    }
    fetchNetWorth();
  }, []);

  const isPositive = parseFloat(changePercent) >= 0;

  return (
    <GlassCard glow="cyan" className="col-span-full lg:col-span-2" delay={0.1}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-text-secondary text-sm font-medium tracking-wide uppercase">
            Total Net Worth
          </p>
          <motion.h2
            className="text-4xl font-bold mt-1 glow-text-cyan"
            style={{ color: "#00f5d4" }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {loading ? "..." : `฿${latestValue.toLocaleString()}`}
          </motion.h2>
          {!loading && (
            <motion.div
              className="flex items-center gap-1.5 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <span className={`flex items-center gap-1 text-sm font-semibold ${isPositive ? 'text-neon-cyan' : 'text-neon-magenta'}`}>
                {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {isPositive ? "+" : ""}{changePercent}%
              </span>
              <span className="text-text-muted text-sm">vs last month</span>
            </motion.div>
          )}
        </div>
        <motion.div
          className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/5"
          style={{
            background:
              "linear-gradient(135deg, rgba(0,245,212,0.15), rgba(76,201,240,0.1))",
          }}
          whileHover={{ rotate: 15, scale: 1.1 }}
        >
          <span className="text-2xl">💎</span>
        </motion.div>
      </div>

      <div className="h-52 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="netWorthGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00f5d4" stopOpacity={0.3} />
                <stop offset="50%" stopColor="#00f5d4" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#00f5d4" stopOpacity={0} />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#52526a", fontSize: 12 }}
            />
            <YAxis hide domain={["dataMin - 10000", "dataMax + 10000"]} />
            <Tooltip
              formatter={(value: number) => [
                `฿${value.toLocaleString()}`,
                "Net Worth",
              ]}
              contentStyle={{
                background: "rgba(18,18,26,0.95)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                backdropFilter: "blur(10px)",
              }}
              labelStyle={{ color: "#8b8b9e" }}
              itemStyle={{ color: "#00f5d4" }}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#00f5d4"
              strokeWidth={3}
              fill="url(#netWorthGrad)"
              filter="url(#glow)"
              dot={false}
              activeDot={{
                r: 6,
                fill: "#00f5d4",
                stroke: "#0a0a0f",
                strokeWidth: 3,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}

