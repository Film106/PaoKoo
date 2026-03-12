-- ============================================================
-- PaoKoo Database Schema (Supabase / PostgreSQL)
-- Couple's Wallet — Finance, Investment & Joint-Account Tracker
-- ============================================================

-- ── 1. PROFILES ──
-- Extended user profile linked to Supabase Auth
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL DEFAULT 'User',
  avatar_url TEXT,
  partner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  currency TEXT NOT NULL DEFAULT 'THB',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. COUPLES LINK ──
-- Pairing mechanism: one user invites another via a unique code
CREATE TABLE IF NOT EXISTS couples_link (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  invitee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  invite_code TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(6), 'hex'),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ
);

-- ── 3. WALLETS ──
-- Triple-wallet system: personal, joint, invest
CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  couple_link_id UUID REFERENCES couples_link(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('personal', 'joint', 'invest')),
  name TEXT NOT NULL,
  balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'THB',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 4. TRANSACTIONS ──
-- All income/expenses across wallets
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL DEFAULT 'Other',
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  ai_category TEXT,  -- AI-suggested category
  receipt_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 5. SHARED GOALS ──
-- Gamified savings goals for couples
CREATE TABLE IF NOT EXISTS shared_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_link_id UUID NOT NULL REFERENCES couples_link(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '🎯',
  target_amount DECIMAL(15, 2) NOT NULL CHECK (target_amount > 0),
  current_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  deadline DATE,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 6. AI INTERACTIONS ──
-- Log of AI "Roast or Toast" comments
CREATE TABLE IF NOT EXISTS ai_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('roast', 'toast')),
  message TEXT NOT NULL,
  context JSONB,  -- spending data that triggered the AI response
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 7. GROW TOGETHER (Net Worth Snapshots) ──
-- Periodic snapshots for the "Grow Together" tree feature
CREATE TABLE IF NOT EXISTS net_worth_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_link_id UUID NOT NULL REFERENCES couples_link(id) ON DELETE CASCADE,
  total_net_worth DECIMAL(15, 2) NOT NULL,
  tree_level INT NOT NULL DEFAULT 1 CHECK (tree_level BETWEEN 1 AND 5),
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(couple_link_id, snapshot_date)
);


-- ============================================================
-- INDEXES for Performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_transactions_wallet ON transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_wallets_owner ON wallets(owner_id);
CREATE INDEX IF NOT EXISTS idx_wallets_couple ON wallets(couple_link_id);
CREATE INDEX IF NOT EXISTS idx_shared_goals_couple ON shared_goals(couple_link_id);
CREATE INDEX IF NOT EXISTS idx_couples_link_invite ON couples_link(invite_code);
CREATE INDEX IF NOT EXISTS idx_net_worth_couple ON net_worth_snapshots(couple_link_id);


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE couples_link ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE net_worth_snapshots ENABLE ROW LEVEL SECURITY;

-- ── Profiles Policies ──
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can view partner profile"
  ON profiles FOR SELECT
  USING (id = (SELECT partner_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ── Couples Link Policies ──
CREATE POLICY "Users can view own couple links"
  ON couples_link FOR SELECT
  USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);

CREATE POLICY "Users can create invite links"
  ON couples_link FOR INSERT
  WITH CHECK (auth.uid() = inviter_id);

CREATE POLICY "Invitees can accept/reject links"
  ON couples_link FOR UPDATE
  USING (auth.uid() = invitee_id);

-- ── Wallets Policies ──
CREATE POLICY "Users can view own wallets"
  ON wallets FOR SELECT
  USING (
    auth.uid() = owner_id
    OR (
      type = 'joint'
      AND couple_link_id IN (
        SELECT id FROM couples_link
        WHERE (inviter_id = auth.uid() OR invitee_id = auth.uid())
        AND status = 'accepted'
      )
    )
  );

CREATE POLICY "Users can create own wallets"
  ON wallets FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own wallets"
  ON wallets FOR UPDATE
  USING (auth.uid() = owner_id);

-- ── Transactions Policies ──
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (
    auth.uid() = user_id
    OR wallet_id IN (
      SELECT w.id FROM wallets w
      WHERE w.type = 'joint'
      AND w.couple_link_id IN (
        SELECT cl.id FROM couples_link cl
        WHERE (cl.inviter_id = auth.uid() OR cl.invitee_id = auth.uid())
        AND cl.status = 'accepted'
      )
    )
  );

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);

-- ── Shared Goals Policies ──
CREATE POLICY "Couples can view shared goals"
  ON shared_goals FOR SELECT
  USING (
    couple_link_id IN (
      SELECT id FROM couples_link
      WHERE (inviter_id = auth.uid() OR invitee_id = auth.uid())
      AND status = 'accepted'
    )
  );

CREATE POLICY "Couples can create shared goals"
  ON shared_goals FOR INSERT
  WITH CHECK (
    couple_link_id IN (
      SELECT id FROM couples_link
      WHERE (inviter_id = auth.uid() OR invitee_id = auth.uid())
      AND status = 'accepted'
    )
  );

CREATE POLICY "Couples can update shared goals"
  ON shared_goals FOR UPDATE
  USING (
    couple_link_id IN (
      SELECT id FROM couples_link
      WHERE (inviter_id = auth.uid() OR invitee_id = auth.uid())
      AND status = 'accepted'
    )
  );

-- ── AI Interactions Policies ──
CREATE POLICY "Users can view own AI interactions"
  ON ai_interactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create AI interactions"
  ON ai_interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ── Net Worth Snapshots Policies ──
CREATE POLICY "Couples can view net worth snapshots"
  ON net_worth_snapshots FOR SELECT
  USING (
    couple_link_id IN (
      SELECT id FROM couples_link
      WHERE (inviter_id = auth.uid() OR invitee_id = auth.uid())
      AND status = 'accepted'
    )
  );

CREATE POLICY "System can insert snapshots"
  ON net_worth_snapshots FOR INSERT
  WITH CHECK (
    couple_link_id IN (
      SELECT id FROM couples_link
      WHERE (inviter_id = auth.uid() OR invitee_id = auth.uid())
      AND status = 'accepted'
    )
  );


-- ============================================================
-- TRIGGER: Auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- TRIGGER: Auto-create default wallets for new profile
-- ============================================================
CREATE OR REPLACE FUNCTION public.create_default_wallets()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.wallets (owner_id, type, name) VALUES
    (NEW.id, 'personal', 'My Wallet'),
    (NEW.id, 'invest', 'Investments');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_default_wallets();
