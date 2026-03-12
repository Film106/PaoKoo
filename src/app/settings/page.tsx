"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, User, Bell, Shield, Heart, Copy, Link as LinkIcon, CheckCircle2 } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { createBrowserClient } from "@/utils/supabase/client";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [partner, setPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [coupleId, setCoupleId] = useState<string | null>(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [copied, setCopied] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      const supabase = createBrowserClient();
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (currentUser) {
        // Fetch Profile
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", currentUser.id).single();
        setUser(profile || currentUser);
        
        // Check for Couple connection
        const { data: coupleData } = await supabase
           .from("couples")
           .select("*, user1:user1_id(display_name), user2:user2_id(display_name)")
           .or(`user1_id.eq.${currentUser.id},user2_id.eq.${currentUser.id}`)
           .limit(1)
           .maybeSingle();
           
        if (coupleData) {
            setCoupleId(coupleData.id);
            const partnerId = coupleData.user1_id === currentUser.id ? coupleData.user2_id : coupleData.user1_id;
            const partnerProfile = coupleData.user1_id === currentUser.id ? coupleData.user2 : coupleData.user1;
            setPartner({ id: partnerId, name: partnerProfile?.display_name || "Partner", since: coupleData.created_at });
        }
      }
      setLoading(false);
    }
    loadSettings();
  }, []);

  const handleSearch = async () => {
      if (!searchEmail) return;
      setSearching(true);
      setSearchResults([]);
      setMessage({ type: "", text: "" });

      const supabase = createBrowserClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .ilike("display_name", `%${searchEmail}%`)
        .neq("id", user?.id);

      if (data) setSearchResults(data);
      if (error) setMessage({ type: "error", text: "Search failed" });
      setSearching(false);
  };

  const handleCopyCode = () => {
     if (user?.id) {
         navigator.clipboard.writeText(user.id);
         setCopied(true);
         setTimeout(() => setCopied(false), 2000);
     }
  };

  const handleConnectPartner = async (targetId: string) => {
      if (!user) return;
      if (targetId === user.id) {
          setMessage({ type: "error", text: "You cannot connect with yourself." });
          return;
      }
      setConnecting(true);
      setMessage({ type: "", text: "" });
      
      try {
          const supabase = createBrowserClient();
          // Insert couple
          const { error: coupleErr } = await supabase.from("couples").insert({
             user1_id: user.id,
             user2_id: targetId
          });
          
          if (coupleErr) throw coupleErr;
          
          // Retrieve couple id to provision wallets
          const { data: newCouple } = await supabase.from("couples")
            .select("id")
            .eq("user1_id", user.id)
            .eq("user2_id", targetId)
            .single();
            
          if (newCouple) {
             // Create joint wallet
             await supabase.from("wallets").insert([
                 { name: "Our Joint Account", type: "joint", owner_id: user.id, couple_id: newCouple.id, balance: 0 },
                 { name: "Our Investments", type: "investment", owner_id: user.id, couple_id: newCouple.id, balance: 0 }
             ]);
          }
          
          setMessage({ type: "success", text: "Successfully connected! Refreshing..." });
          setTimeout(() => window.location.reload(), 1500);
      } catch (err: any) {
          setMessage({ type: "error", text: err.message || "Failed to connect." });
      } finally {
          setConnecting(false);
      }
  };

  const handleDisconnectPartner = async () => {
      if (!coupleId || !confirm("Are you sure you want to disconnect? Shared wallets and their histories will be permanently removed for both users.")) return;
      setDisconnecting(true);
      
      try {
          const supabase = createBrowserClient();
          
          // 1. Delete associated wallets first (to satisfy FK constraint)
          const { error: walletErr } = await supabase
            .from("wallets")
            .delete()
            .eq("couple_id", coupleId);
            
          if (walletErr) throw walletErr;

          // 2. Delete the couple record
          const { error } = await supabase.from("couples").delete().eq("id", coupleId);
          if (error) throw error;
          
          window.location.reload();
      } catch (err: any) {
          alert("Failed to disconnect: " + err.message);
      } finally {
          setDisconnecting(false);
      }
  };
  return (
    <div className="p-6 lg:p-8 min-h-screen relative">
      <motion.header
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: "rgba(255, 255, 255, 0.05)" }}
          >
            <Settings className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              Preferences
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Manage your account, partner connection, and app settings.
            </p>
          </div>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
         <button className="flex items-center gap-3 p-4 rounded-xl bg-[rgba(0,245,212,0.1)] border border-[#00f5d4]/20 hover:bg-[rgba(0,245,212,0.15)] transition-colors text-left">
            <User size={20} className="text-[#00f5d4]" />
            <div>
               <p className="font-bold text-white text-sm">Account</p>
               <p className="text-xs text-[#00f5d4]/70">Profile details</p>
            </div>
         </button>
         <button className="flex items-center gap-3 p-4 rounded-xl bg-[rgba(247,37,133,0.1)] border border-[#f72585]/20 hover:bg-[rgba(247,37,133,0.15)] transition-colors text-left">
            <Heart size={20} className="text-[#f72585]" />
            <div>
               <p className="font-bold text-white text-sm">Partner</p>
               <p className="text-xs text-[#f72585]/70">Connection status</p>
            </div>
         </button>
         <button className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors text-left">
            <Bell size={20} className="text-text-secondary" />
            <div>
               <p className="font-bold text-white text-sm">Notifications</p>
               <p className="text-xs text-text-muted">Push & Email alerts</p>
            </div>
         </button>
         <button className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors text-left">
            <Shield size={20} className="text-text-secondary" />
            <div>
               <p className="font-bold text-white text-sm">Security</p>
               <p className="text-xs text-text-muted">Passwords & 2FA</p>
            </div>
         </button>
      </div>

      <GlassCard className="max-w-3xl border border-white/5">
         <h2 className="text-lg font-bold text-white mb-6 border-b border-white/5 pb-4">Partner Connection</h2>
         
         {loading ? (
             <div className="h-24 bg-white/5 rounded-xl animate-pulse" />
         ) : partner ? (
             <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                <div className="flex items-center gap-4 w-full md:w-auto">
                   <div className="flex -space-x-4">
                      <div className="w-16 h-16 rounded-full border-4 border-[#0a0a0f] bg-gradient-to-br from-[#00f5d4] to-[#4cc9f0] flex items-center justify-center z-10 shadow-lg">
                         <span className="font-bold text-[#0a0a0f] text-xl">{user?.display_name?.charAt(0) || "Y"}</span>
                      </div>
                      <div className="w-16 h-16 rounded-full border-4 border-[#0a0a0f] bg-gradient-to-br from-[#f72585] to-[#ff6b35] flex items-center justify-center shadow-lg relative">
                         <span className="font-bold text-white text-xl">{partner.name.charAt(0)}</span>
                         <Heart size={14} className="absolute -bottom-1 right-0 text-[#f72585] fill-[#f72585]" />
                      </div>
                   </div>
                   <div>
                      <p className="font-bold text-white text-lg">Paired with {partner.name}</p>
                      <p className="text-sm text-[#f72585] mt-1 font-semibold">Since {new Date(partner.since).toLocaleDateString()}</p>
                   </div>
                </div>
                                <button 
                    onClick={handleDisconnectPartner}
                    disabled={disconnecting}
                    className="px-5 py-2.5 rounded-xl border border-[#f72585]/30 text-[#f72585] text-sm font-semibold hover:bg-[#f72585]/10 transition-colors w-full md:w-auto flex items-center justify-center gap-2 cursor-pointer"
                 >
                    {disconnecting ? "Disconnecting..." : "Disconnect Partner"}
                 </button>
             </div>
         ) : (
             <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                 <p className="text-text-primary mb-4">You are not paired with anyone yet. Connect with your partner to share wallets and goals!</p>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                        <p className="text-sm text-text-muted mb-2 font-semibold uppercase tracking-wider">Your Connection Code</p>
                        <div className="flex items-center gap-2">
                            <code className="flex-1 p-3 bg-[#0a0a0f] rounded-lg text-xs break-all text-[#00f5d4]">
                                {user?.id}
                            </code>
                            <button onClick={handleCopyCode} className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                                {copied ? <CheckCircle2 size={16} className="text-[#00f5d4]" /> : <Copy size={16} className="text-white" />}
                            </button>
                        </div>
                        <p className="text-xs text-text-muted mt-2">Send this code to your partner so they can link with you.</p>
                    </div>
                    
                    <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                        <p className="text-sm text-text-muted mb-2 font-semibold uppercase tracking-wider">Search Partner</p>
                        <div className="flex flex-col gap-3">
                            <div className="flex gap-2">
                                <input 
                                    type="text"
                                    value={searchEmail}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchEmail(e.target.value)}
                                    placeholder="Search by name..."
                                    className="flex-1 bg-[#0a0a0f] border border-white/10 rounded-lg p-3 text-xs text-white placeholder:text-text-muted/50 focus:outline-none focus:border-[#00f5d4]/50"
                                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSearch()}
                                />
                                <div className="flex gap-2">
                                    <button 
                                        onClick={handleSearch}
                                        disabled={searching || !searchEmail}
                                        className="px-4 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-semibold text-white transition-colors disabled:opacity-50"
                                    >
                                        {searching ? "..." : "Search"}
                                    </button>
                                    {searchEmail && (
                                        <button 
                                            onClick={() => { 
                                                setSearchResults([]); 
                                                setSearchEmail(""); 
                                                setMessage({ type: "", text: "" });
                                            }}
                                            className="px-3 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-semibold text-text-muted transition-colors border border-white/5"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                            </div>

                            {searchResults.length > 0 && (
                                <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar mt-2 border-t border-white/5 pt-3">
                                    {searchResults.map((res) => (
                                        <div key={res.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f72585] to-[#ff6b35] flex items-center justify-center text-[10px] font-bold">
                                                    {res.display_name?.charAt(0) || "U"}
                                                </div>
                                                <span className="text-xs font-medium text-white">{res.display_name}</span>
                                            </div>
                                            <button 
                                                onClick={() => handleConnectPartner(res.id)}
                                                disabled={connecting}
                                                className="px-3 py-1.5 rounded-md bg-[#00f5d4] text-[#0a0a0f] text-[10px] font-bold hover:scale-105 transition-transform disabled:opacity-50"
                                            >
                                                {connecting ? "..." : "Connect"}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {!searching && searchEmail && searchResults.length === 0 && message.text === "" && (
                                <p className="text-[10px] text-text-muted text-center py-2 animate-pulse">Press Enter or click Search</p>
                            )}

                            {message.text && (
                                <p className={`text-xs mt-1 ${message.type === 'error' ? 'text-[#f72585]' : 'text-[#00f5d4]'}`}>
                                    {message.text}
                                </p>
                            )}
                        </div>
                    </div>
                 </div>
             </div>
         )}
         
         <div className="mt-8">
            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4">Settle Up Automation</h3>
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
               <div>
                  <p className="font-semibold text-white">Auto-calculate split expenses</p>
                  <p className="text-xs text-text-muted mt-1">Automatically determines who owes who based on the 50/50 rule.</p>
               </div>
               <div className="w-12 h-6 rounded-full bg-[#00f5d4] flex items-center px-1 cursor-pointer">
                  <div className="w-4 h-4 rounded-full bg-[#0a0a0f] transform translate-x-6 shadow-sm" />
               </div>
            </div>
         </div>
      </GlassCard>
    </div>
  );
}
