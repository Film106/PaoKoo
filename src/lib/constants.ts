import type { ExpenseCategory, NetWorthDataPoint, SettleUpBalance } from "@/types";

// ── App Branding ──
export const APP_NAME = "PaoKoo";
export const APP_TAGLINE = "Couple's Wallet";

// ── Transaction Categories ──
export const CATEGORIES = [
  { name: "Food & Beverage", emoji: "🍜", color: "#ff6b6b" },
  { name: "Transport", emoji: "🚗", color: "#ffa94d" },
  { name: "Shopping", emoji: "🛍️", color: "#ffd43b" },
  { name: "Entertainment", emoji: "🎮", color: "#69db7c" },
  { name: "Bills & Utilities", emoji: "💡", color: "#4fc3f7" },
  { name: "Health", emoji: "💊", color: "#b197fc" },
  { name: "Education", emoji: "📚", color: "#ff8787" },
  { name: "Travel", emoji: "✈️", color: "#38d9a9" },
  { name: "Investment", emoji: "📈", color: "#22b8cf" },
  { name: "Gift", emoji: "🎁", color: "#e599f7" },
  { name: "Other", emoji: "📦", color: "#868e96" },
] as const;

// ── AI Auto-categorize Keywords ──
export const CATEGORY_KEYWORDS: Record<string, string> = {
  starbucks: "Food & Beverage",
  coffee: "Food & Beverage",
  grab: "Transport",
  uber: "Transport",
  bts: "Transport",
  mrt: "Transport",
  lazada: "Shopping",
  shopee: "Shopping",
  netflix: "Entertainment",
  spotify: "Entertainment",
  electric: "Bills & Utilities",
  water: "Bills & Utilities",
  internet: "Bills & Utilities",
  hospital: "Health",
  pharmacy: "Health",
  gym: "Health",
  book: "Education",
  course: "Education",
  flight: "Travel",
  hotel: "Travel",
  bitcoin: "Investment",
  stock: "Investment",
};

// ── Demo Data ──
export const DEMO_NET_WORTH: NetWorthDataPoint[] = [
  { date: "Sep", amount: 85000 },
  { date: "Oct", amount: 92000 },
  { date: "Nov", amount: 88000 },
  { date: "Dec", amount: 105000 },
  { date: "Jan", amount: 118000 },
  { date: "Feb", amount: 125000 },
  { date: "Mar", amount: 142000 },
];

export const DEMO_EXPENSES: ExpenseCategory[] = [
  { name: "Food & Beverage", value: 8500, color: "#ff6b6b", emoji: "🍜" },
  { name: "Transport", value: 3200, color: "#ffa94d", emoji: "🚗" },
  { name: "Shopping", value: 5400, color: "#ffd43b", emoji: "🛍️" },
  { name: "Entertainment", value: 2800, color: "#69db7c", emoji: "🎮" },
  { name: "Bills & Utilities", value: 6200, color: "#4fc3f7", emoji: "💡" },
  { name: "Health", value: 1500, color: "#b197fc", emoji: "💊" },
];

export const DEMO_SETTLE_UP: SettleUpBalance = {
  user_name: "You",
  partner_name: "Babe 💕",
  user_paid: 12500,
  partner_paid: 9800,
  difference: 2700,
  who_owes: "partner",
};

export const DEMO_GOALS = [
  { title: "Trip to Japan 🇯🇵", target: 120000, current: 78000, emoji: "✈️" },
  { title: "Wedding Fund 💒", target: 500000, current: 185000, emoji: "💍" },
  { title: "Emergency Fund 🛡️", target: 100000, current: 92000, emoji: "🏦" },
];
