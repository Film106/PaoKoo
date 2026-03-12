"use client";

import React, { PropsWithChildren } from "react";
import { motion } from "framer-motion";

interface GlassCardProps extends PropsWithChildren {
  className?: string;
  glow?: "cyan" | "magenta" | "none";
  delay?: number;
  onClick?: () => void;
}

export default function GlassCard({
  children,
  className = "",
  glow = "none",
  delay = 0,
  onClick,
}: GlassCardProps) {
  const glowClass =
    glow === "cyan"
      ? "glow-cyan"
      : glow === "magenta"
      ? "glow-magenta"
      : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.4, 0, 0.2, 1],
      }}
      className={`glass-card p-6 ${glowClass} ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
    >
      {children}
    </motion.div>
  );
}
