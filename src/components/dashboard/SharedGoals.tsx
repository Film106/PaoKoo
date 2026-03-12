"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import { createBrowserClient } from "@/utils/supabase/client";
import { Plus, X } from "lucide-react";

export default function SharedGoals() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function fetchGoals() {
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase.from("goals").select("*").order("created_at", { ascending: false }).limit(2);
    if (data) {
      setGoals(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle || !newGoalTarget) return;
    setIsSubmitting(true);

    const supabase = createBrowserClient();
    const { error } = await supabase.from("goals").insert({
        title: newGoalTitle,
        target_amount: Number(newGoalTarget),
        current_amount: 0
    });

    if (!error) {
        setNewGoalTitle("");
        setNewGoalTarget("");
        setIsModalOpen(false);
        fetchGoals();
    }
    setIsSubmitting(false);
  };

  return (
    <GlassCard delay={0.35} className="col-span-full lg:col-span-2 relative">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-text-secondary text-sm font-medium tracking-wide uppercase">
            Shared Goals 🎯
          </p>
          <p className="text-text-muted text-xs mt-1">
            Saving together, winning together
          </p>
        </div>
        <motion.button
          className="text-xs px-3 py-1.5 rounded-lg font-medium cursor-pointer hover:bg-neon-cyan/10 transition-colors flex items-center gap-1"
          style={{
            background: "rgba(0,245,212,0.08)",
            color: "#00f5d4",
            border: "1px solid rgba(0,245,212,0.15)",
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={14} /> New Goal
        </motion.button>
      </div>

      <div className="space-y-4">
        {loading ? (
             <div className="space-y-4">
                <div className="h-24 bg-white/5 rounded-2xl animate-pulse" />
                <div className="h-24 bg-white/5 rounded-2xl animate-pulse" />
             </div>
        ) : goals.map((goal, i) => {
          const progress = (goal.current_amount / goal.target_amount) * 100;
          const emoji = goal.title.toLowerCase().includes("wedding") ? "💍" : 
                        goal.title.toLowerCase().includes("house") ? "🏡" : 
                        goal.title.toLowerCase().includes("travel") ? "✈️" : "🎯";

          return (
            <motion.div
              key={goal.id}
              className="rounded-2xl p-4"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.04)",
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.15 }}
              whileHover={{
                background: "rgba(255,255,255,0.04)",
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{emoji}</span>
                  <span className="text-sm font-semibold text-text-primary">
                    {goal.title}
                  </span>
                </div>
                <span className="text-xs font-semibold" style={{ color: "#00f5d4" }}>
                  {progress.toFixed(0)}%
                </span>
              </div>

              <div
                className="h-2 rounded-full overflow-hidden mb-2 progress-glow"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: progress >= 90
                      ? "linear-gradient(90deg, #00f5d4, #69db7c)"
                      : progress >= 50
                      ? "linear-gradient(90deg, #4cc9f0, #00f5d4)"
                      : "linear-gradient(90deg, #b197fc, #4cc9f0)",
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, progress)}%` }}
                  transition={{ duration: 1.2, delay: 0.6 + i * 0.15, ease: "easeOut" }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-text-muted">
                <span>฿{(goal.current_amount / 1000).toFixed(0)}k saved</span>
                <span>฿{(goal.target_amount / 1000).toFixed(0)}k goal</span>
              </div>
            </motion.div>
          );
        })}
        {!loading && goals.length === 0 && (
            <div className="text-center py-8 bg-white/[0.02] rounded-2xl border border-dashed border-white/10">
                <p className="text-sm text-text-muted">No active goals found.</p>
                <p className="text-xs text-text-muted/60 mt-1">Start saving for your dreams together!</p>
            </div>
        )}
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md p-6 rounded-3xl"
            style={{ 
              background: "linear-gradient(180deg, #1a1a2e 0%, #12121a 100%)",
              border: "1px solid rgba(255,255,255,0.1)"
            }}
          >
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold gradient-text">New Goal 🎯</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-white"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleAddGoal} className="space-y-4">
                <div>
                   <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Goal Name</label>
                   <input 
                     type="text" 
                     required
                     placeholder="e.g. Wedding Trip"
                     value={newGoalTitle}
                     onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewGoalTitle(e.target.value)}
                     className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-neon-cyan/50"
                   />
                </div>
                <div>
                   <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Target Amount (฿)</label>
                   <input 
                     type="number" 
                     required
                     placeholder="e.g. 50000"
                     value={newGoalTarget}
                     onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewGoalTarget(e.target.value)}
                     className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-neon-cyan/50"
                   />
                </div>
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-neon py-3 mt-4 disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? "Creating..." : "Create Goal"}
                </motion.button>
            </form>
          </motion.div>
        </div>
      )}
    </GlassCard>
  );
}


