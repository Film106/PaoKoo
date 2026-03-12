"use client";

import React from "react";
import { motion } from "framer-motion";
import { Bell, Search, Calendar } from "lucide-react";
import WalletCards from "@/components/dashboard/WalletCards";
import NetWorthChart from "@/components/dashboard/NetWorthChart";
import ExpenseDonut from "@/components/dashboard/ExpenseDonut";
import SettleUpCard from "@/components/dashboard/SettleUpCard";
import GrowTogetherTree from "@/components/dashboard/GrowTogetherTree";
import AiCoachCard from "@/components/dashboard/AiCoachCard";
import SharedGoals from "@/components/dashboard/SharedGoals";
import QuickAddTransaction from "@/components/dashboard/QuickAddTransaction";
import Link from "next/link";

export default function DashboardPage() {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="p-6 lg:p-8 min-h-screen relative">
      {/* Header */}
      <motion.header
        className="flex items-center justify-between mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Good Evening, Sarwut 👋
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Calendar size={12} className="text-text-muted" />
            <p className="text-sm text-text-muted">{currentDate}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <motion.button
            className="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
            whileHover={{
              background: "rgba(255,255,255,0.08)",
              scale: 1.05,
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => alert("Search coming soon!")}
          >
            <Search size={16} className="text-text-secondary" />
          </motion.button>
          
          {/* Notifications */}
          <motion.button
            className="w-10 h-10 rounded-xl flex items-center justify-center relative cursor-pointer"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
            whileHover={{
              background: "rgba(255,255,255,0.08)",
              scale: 1.05,
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => alert("No new notifications")}
          >
            <Bell size={16} className="text-text-secondary" />
            <span
              className="absolute top-2 right-2 w-2 h-2 rounded-full"
              style={{ background: "#f72585" }}
            />
          </motion.button>

          {/* Avatar Linked to Settings */}
          <Link href="/settings">
            <motion.div
              className="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #f72585, #ff6b35)",
              }}
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              <span className="text-sm font-bold text-white">S</span>
            </motion.div>
          </Link>
        </div>
      </motion.header>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Wallet Overview Cards */}
        <WalletCards />

        {/* Net Worth Chart (spans 2 cols) */}
        <NetWorthChart />

        {/* Expense Donut */}
        <ExpenseDonut />

        {/* Shared Goals (spans 2 cols) */}
        <SharedGoals />

        {/* Settle Up Card */}
        <SettleUpCard />

        {/* AI Coach Card (full width) */}
        <AiCoachCard />

        {/* Grow Together Tree */}
        <GrowTogetherTree />
      </div>

      {/* Quick Add FAB */}
      <QuickAddTransaction />
    </div>
  );
}
