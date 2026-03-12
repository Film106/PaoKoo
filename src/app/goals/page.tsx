"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Target, Plus, X, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import GlassCard from "@/components/ui/GlassCard";
import { createBrowserClient } from "@/utils/supabase/client";

export default function GoalsPage() {
  const router = useRouter();
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function fetchGoalsData() {
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("goals")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setGoals(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchGoalsData();
  }, []);

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !target) return;
    setIsSubmitting(true);

    const supabase = createBrowserClient();
    const { error } = await supabase.from("goals").insert({
        title,
        target_amount: Number(target),
        current_amount: 0
    });

    if (!error) {
        setTitle("");
        setTarget("");
        setIsModalOpen(false);
        fetchGoalsData();
        router.refresh();
    }
    setIsSubmitting(false);
  };

  const handleDeleteGoal = async (id: string) => {
    if (!confirm("Are you sure you want to delete this goal?")) return;
    const supabase = createBrowserClient();
    const { error } = await supabase.from("goals").delete().eq("id", id);
    if (!error) {
        fetchGoalsData();
        router.refresh();
    }
  };

  return (
    <div className="p-6 lg:p-8 min-h-screen relative">
      <motion.header
        className="flex items-center justify-between mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: "rgba(254, 228, 64, 0.1)" }}
          >
            <Target className="text-[#fee440]" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              Our Shared Goals
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Track progress toward your dreams together.
            </p>
          </div>
        </div>
        
        <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-neon flex items-center gap-2 cursor-pointer"
        >
          <Plus size={18} color="#0a0a0f" />
          <span className="hidden sm:inline">New Goal</span>
        </button>
      </motion.header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse" />
            ))}
        </div>
      ) : goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
               <Target size={40} className="text-text-muted" />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">No Goals Yet</h3>
            <p className="text-text-secondary max-w-sm text-center mb-6">
                Setting shared financial goals is the first step to achieving them. Create your first goal today!
            </p>
            <button onClick={() => setIsModalOpen(true)} className="btn-neon cursor-pointer">Create Your First Goal</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {goals.map((goal, i) => {
                const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
                
                return (
                    <GlassCard key={goal.id || i} delay={i * 0.1} className="relative overflow-hidden flex flex-col justify-between group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#fee440] blur-[80px] opacity-10 rounded-full" />
                        <div>
                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <h3 className="font-bold text-lg text-text-primary">{goal.title}</h3>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => handleDeleteGoal(goal.id)}
                                        className="p-1.5 rounded-lg bg-white/5 text-text-muted hover:text-[#f72585] hover:bg-[#f72585]/10 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                    <div className="text-xs font-semibold px-2 py-1 bg-[rgba(254,228,64,0.1)] text-[#fee440] rounded-lg">
                                        {progress.toFixed(0)}%
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between items-end mb-4 relative z-10">
                                <div>
                                    <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Current</p>
                                    <p className="text-2xl font-bold text-white">฿{goal.current_amount.toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Target</p>
                                    <p className="text-sm font-semibold text-text-secondary">฿{goal.target_amount.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="relative z-10">
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mb-2">
                                <motion.div 
                                    className="h-full rounded-full bg-gradient-to-r from-[#fee440] to-[#f72585]"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 1, delay: 0.2 + (i * 0.1) }}
                                />
                            </div>
                            <p className="text-[10px] text-center text-text-muted mt-2">
                                ฿{(goal.target_amount - goal.current_amount).toLocaleString()} remaining
                            </p>
                        </div>
                    </GlassCard>
                );
            })}
        </div>
      )}

      {/* New Goal Modal */}
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
                     placeholder="e.g. Dream House"
                     value={title}
                     onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                     className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-neon-cyan/50"
                   />
                </div>
                <div>
                   <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Target Amount (฿)</label>
                   <input 
                     type="number" 
                     required
                     placeholder="0.00"
                     value={target}
                     onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTarget(e.target.value)}
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
    </div>
  );
}
