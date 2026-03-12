// ── PaoKoo Type Definitions ──

export interface Profile {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  partner_id: string | null;
  created_at: string;
}

export interface CoupleLink {
  id: string;
  inviter_id: string;
  invitee_id: string | null;
  invite_code: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
}

export type WalletType = "personal" | "joint" | "invest";

export interface Wallet {
  id: string;
  owner_id: string;
  couple_id: string | null;
  type: WalletType;
  name: string;
  balance: number;
  currency: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  wallet_id: string;
  user_id: string;
  type: "income" | "expense" | "transfer";
  amount: number;
  category: string;
  description: string;
  date: string;
  ai_category: string | null;
  created_at: string;
}

export interface SharedGoal {
  id: string;
  couple_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  emoji: string;
  deadline: string | null;
  created_at: string;
}

export interface AiInteraction {
  id: string;
  user_id: string;
  type: "roast" | "toast";
  message: string;
  context: string;
  created_at: string;
}

// Dashboard-specific types
export interface NetWorthDataPoint {
  date: string;
  amount: number;
}

export interface ExpenseCategory {
  name: string;
  value: number;
  color: string;
  emoji: string;
}

export interface SettleUpBalance {
  user_name: string;
  partner_name: string;
  user_paid: number;
  partner_paid: number;
  difference: number;
  who_owes: "user" | "partner" | "even";
}
