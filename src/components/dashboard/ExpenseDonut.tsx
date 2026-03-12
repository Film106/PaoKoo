"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import GlassCard from "@/components/ui/GlassCard";
import { createBrowserClient } from "@/utils/supabase/client";

const CATEGORY_COLORS: Record<string, string> = {
  Food: "#f72585",
  Shopping: "#7209b7",
  Transport: "#3a0ca3",
  Housing: "#4361ee",
  Utilities: "#4cc9f0",
  Entertainment: "#ffb703",
  Others: "#52526a",
};

const CATEGORY_EMOJIS: Record<string, string> = {
  Food: "🍱",
  Shopping: "🛍️",
  Transport: "🚗",
  Housing: "🏠",
  Utilities: "⚡",
  Entertainment: "🎬",
  Others: "📦",
};

export default function ExpenseDonut() {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExpenses() {
      const supabase = createBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch transactions for current month categorized as expense
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: transactions } = await supabase
        .from("transactions")
        .select("*")
        .eq("type", "expense")
        .gte("created_at", startOfMonth.toISOString());

      if (transactions) {
        const categoryMap: Record<string, number> = {};
        let sum = 0;

        transactions.forEach((t) => {
          const cat = t.category || "Others";
          categoryMap[cat] = (categoryMap[cat] || 0) + (t.amount || 0);
          sum += (t.amount || 0);
        });

        const formattedData = Object.keys(categoryMap).map((name) => ({
          name,
          value: categoryMap[name],
          color: CATEGORY_COLORS[name] || CATEGORY_COLORS["Others"],
          emoji: CATEGORY_EMOJIS[name] || CATEGORY_EMOJIS["Others"],
        }));

        setData(formattedData.sort((a, b) => b.value - a.value));
        setTotal(sum);
      }
      setLoading(false);
    }
    fetchExpenses();
  }, []);

  return (
    <GlassCard delay={0.2}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-text-secondary text-sm font-medium tracking-wide uppercase">
            Monthly Expenses
          </p>
          <motion.p
            className="text-2xl font-bold mt-1"
            style={{ color: "#f72585" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {loading ? "..." : `฿${total.toLocaleString()}`}
          </motion.p>
        </div>
        <motion.div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: "rgba(247, 37, 133, 0.12)",
          }}
          whileHover={{ rotate: -15 }}
        >
          <span className="text-xl">🔥</span>
        </motion.div>
      </div>

      <div className="h-48 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.length > 0 ? data : [{ name: "None", value: 1, color: "rgba(255,255,255,0.05)" }]}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
              animationBegin={200}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {(data.length > 0 ? data : [{ color: "rgba(255,255,255,0.05)" }]).map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [
                `฿${value.toLocaleString()}`,
                name,
              ]}
              contentStyle={{
                background: "rgba(18,18,26,0.95)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
              }}
              itemStyle={{ color: "#f0f0f5" }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-xs text-text-muted">Total</p>
            <p className="text-sm font-bold text-text-primary">
              ฿{(total / 1000).toFixed(1)}k
            </p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        {data.slice(0, 4).map((cat: any, i: number) => (
          <motion.div
            key={cat.name}
            className="flex items-center gap-2 text-xs"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
          >
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: cat.color }}
            />
            <span className="text-text-secondary truncate">{cat.emoji} {cat.name}</span>
          </motion.div>
        ))}
        {data.length === 0 && !loading && (
            <p className="col-span-2 text-center text-[10px] text-text-muted italic">No expenses this month</p>
        )}
      </div>
    </GlassCard>
  );
}
