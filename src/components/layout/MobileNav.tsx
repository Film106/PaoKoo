"use client";

import React from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Wallet,
  Users,
  Target,
  Bot,
  Settings,
} from "lucide-react";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Home", href: "/" },
  { icon: Wallet, label: "Wallet", href: "/wallet" },
  { icon: Users, label: "Joint", href: "/joint" },
  { icon: Target, label: "Goals", href: "/goals" },
  { icon: Bot, label: "AI", href: "/ai-coach" },
  { icon: Settings, label: "Sets", href: "/settings" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/95 to-transparent backdrop-blur-lg">
      <nav className="flex items-center justify-around bg-white/5 border border-white/10 rounded-2xl p-2 shadow-2xl">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.label} href={item.href} className="flex-1">
              <motion.div
                className={`flex flex-col items-center justify-center py-2 transition-colors ${
                  isActive ? "text-[#00f5d4]" : "text-text-muted hover:text-white"
                }`}
                whileTap={{ scale: 0.9 }}
              >
                <item.icon size={22} className={isActive ? "drop-shadow-[0_0_8px_rgba(0,245,212,0.5)]" : ""} />
                <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    className="w-1 h-1 rounded-full bg-[#00f5d4] mt-1"
                    layoutId="activeDot"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
