"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { LogIn, Mail, Lock, User } from "lucide-react";
import { createBrowserClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createBrowserClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
        router.push("/");
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createBrowserClient();

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        // Use router.push followed by refresh for better Next.js integration
        router.push("/");
        router.refresh();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName
            }
          }
        });
        if (error) throw error;
        
        // Ensure profile is created for the new user
        if (data?.user) {
          await supabase.from("profiles").upsert({
            id: data.user.id,
            display_name: displayName,
          });
          
          await supabase.from("wallets").insert({
            name: "My Cash",
            type: "personal",
            owner_id: data.user.id,
            balance: 0
          });
        }
        
        router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative p-4 overflow-hidden bg-[#0a0a0f]">
      {/* Background Orbs */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#00f5d4] rounded-full blur-[150px] opacity-10" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#f72585] rounded-full blur-[150px] opacity-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4"
            style={{
              background: "linear-gradient(135deg, #00f5d4 0%, #4cc9f0 100%)",
            }}
            whileHover={{ rotate: 15, scale: 1.05 }}
          >
            <span className="text-3xl font-black text-[#0a0a0f]">P</span>
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to PaoKoo</h1>
          <p className="text-text-muted">Your premier couple&apos;s wealth tracker.</p>
        </div>

        <div
          className="rounded-3xl p-8"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.05)",
            backdropFilter: "blur(20px)",
          }}
        >
          <h2 className="text-xl font-bold text-white mb-6">
            {isLogin ? "Sign In" : "Create Account"}
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-[rgba(247,37,133,0.1)] border border-[#f72585]/20 text-[#f72585] text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  Display Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDisplayName(e.target.value)}
                    className="w-full bg-[rgba(0,0,0,0.2)] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-text-muted/50 focus:outline-none focus:border-[#00f5d4]/50 transition-colors"
                    placeholder="e.g. Sarwut"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  className="w-full bg-[rgba(0,0,0,0.2)] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-text-muted/50 focus:outline-none focus:border-[#00f5d4]/50 transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  className="w-full bg-[rgba(0,0,0,0.2)] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-text-muted/50 focus:outline-none focus:border-[#00f5d4]/50 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full btn-neon flex items-center justify-center gap-2 mt-6 cursor-pointer disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <span>Processing...</span>
              ) : (
                <>
                  <span>{isLogin ? "Sign In" : "Sign Up"}</span>
                  <LogIn size={18} color="#0a0a0f" />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-text-muted hover:text-white transition-colors cursor-pointer"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
