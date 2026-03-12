"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { createBrowserClient } from "@/utils/supabase/client";
import {
  LayoutDashboard,
  Wallet,
  Users,
  TrendingUp,
  Target,
  Bot,
  Settings,
  ChevronLeft,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Wallet, label: "My Wallet", href: "/wallet" },
  { icon: Users, label: "Our Wallet", href: "/joint" },
  { icon: TrendingUp, label: "Invest", href: "/invest" },
  { icon: Target, label: "Goals", href: "/goals" },
  { icon: Bot, label: "AI Coach", href: "/ai-coach" },
];

const BOTTOM_ITEMS = [
  { icon: Settings, label: "Settings", href: "/settings" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [displayName, setDisplayName] = useState("User");

  useEffect(() => {
    async function loadUser() {
      const supabase = createBrowserClient();
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", data.user.id).single();
        if (profile?.display_name) setDisplayName(profile.display_name);
      }
    }
    loadUser();
  }, []);

  const handleLogout = async () => {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <motion.aside
      className="hidden lg:flex fixed left-0 top-0 h-full z-40 flex-col py-6 px-3"
      style={{
        background: "linear-gradient(180deg, rgba(18,18,26,0.98) 0%, rgba(10,10,15,0.98) 100%)",
        borderRight: "1px solid rgba(255,255,255,0.04)",
        backdropFilter: "blur(20px)",
      }}
      animate={{ width: collapsed ? 72 : 220 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-3 mb-8">
        <motion.div
          className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
          style={{
            background: "linear-gradient(135deg, #00f5d4 0%, #4cc9f0 100%)",
          }}
          whileHover={{ rotate: 15, scale: 1.05 }}
        >
          <span className="text-lg font-black text-[#0a0a0f]">P</span>
        </motion.div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
          >
            <h1 className="text-base font-bold gradient-text leading-tight">
              PaoKoo
            </h1>
            <p className="text-[10px] text-text-muted">Couple&apos;s Wallet</p>
          </motion.div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <motion.a
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative cursor-pointer ${
                isActive
                  ? "text-text-primary"
                  : "text-text-secondary hover:text-text-primary"
              }`}
              style={
                isActive
                  ? {
                      background: "rgba(0, 245, 212, 0.08)",
                      border: "1px solid rgba(0, 245, 212, 0.12)",
                    }
                  : {}
              }
              whileHover={{
                x: 2,
                backgroundColor: isActive
                  ? "rgba(0, 245, 212, 0.1)"
                  : "rgba(255, 255, 255, 0.03)",
              }}
            >
              {isActive && (
                <motion.div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                  style={{
                    background: "linear-gradient(180deg, #00f5d4, #4cc9f0)",
                  }}
                  layoutId="activeTab"
                />
              )}
              <item.icon
                size={20}
                style={{
                  color: isActive ? "#00f5d4" : undefined,
                }}
                className="shrink-0"
              />
              {!collapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </motion.a>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="space-y-1 mb-2">
        {BOTTOM_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <motion.a
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                isActive ? "text-text-primary bg-white/5" : "text-text-secondary hover:text-text-primary"
              }`}
              whileHover={{
                x: 2,
                backgroundColor: "rgba(255, 255, 255, 0.03)",
              }}
            >
              <item.icon size={20} className="shrink-0" style={{ color: isActive ? "#00f5d4" : undefined }} />
              {!collapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </motion.a>
          );
        })}
      </div>

      {/* User profile */}
      {!collapsed && (
        <motion.div
          className="rounded-2xl p-3 mx-1"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.04)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg, #f72585, #ff6b35)",
              }}
            >
              <span className="text-xs font-bold text-white">{displayName.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-text-primary truncate">
                {displayName}
              </p>
              <p className="text-[10px] text-text-muted truncate">
                Online
              </p>
            </div>
            <LogOut
              size={14}
              onClick={handleLogout}
              className="text-text-muted hover:text-[#f72585] shrink-0 cursor-pointer transition-colors"
            />
          </div>
        </motion.div>
      )}

      {/* Collapse toggle */}
      <motion.button
        className="absolute -right-3 top-1/2 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer"
        style={{
          background: "rgba(18,18,26,0.9)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
        onClick={() => setCollapsed(!collapsed)}
        whileHover={{ scale: 1.1 }}
        animate={{ rotate: collapsed ? 180 : 0 }}
      >
        <ChevronLeft size={12} className="text-text-secondary" />
      </motion.button>
    </motion.aside>
  );
}
