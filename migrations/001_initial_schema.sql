-- ===================================
-- Initial Database Schema
-- Partner Portal Application
-- Created: 2024-12-03
-- ===================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================
-- 1. USERS TABLE
-- ===================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255), -- Only for admins (nullable for partners)
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'partner')),
  company VARCHAR(255), -- Only for partners
  pin_hash VARCHAR(255), -- Only for partners (4-digit PIN, hashed)
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended')),
  email_verified BOOLEAN DEFAULT false,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- ===================================
-- 2. PRICE LISTS TABLE
-- ===================================
CREATE TABLE IF NOT EXISTS price_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  currency VARCHAR(10) NOT NULL CHECK (currency IN ('USD', 'INR', 'EUR', 'GBP')),
  helium_license_monthly DECIMAL(10, 2) NOT NULL,
  helium_license_annual DECIMAL(10, 2) NOT NULL,
  development_rate_per_hour DECIMAL(10, 2) NOT NULL,
  deployment_cost DECIMAL(10, 2) NOT NULL,
  maintenance_cost DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(partner_id) -- One price list per partner
);

-- Indexes for price_lists table
CREATE INDEX IF NOT EXISTS idx_price_lists_partner ON price_lists(partner_id);

-- ===================================
-- 3. PROPOSALS TABLE
-- ===================================
CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  value DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL,
  timeline VARCHAR(100) NOT NULL,
  
  -- JSONB for flexible content storage
  executive_summary TEXT,
  project_scope JSONB, -- Array of strings
  timeline_phases JSONB, -- Array of {period, title, description}
  investment_items JSONB, -- Array of {name, description, amount}
  deliverables JSONB, -- Array of strings
  technology_stack JSONB, -- {frontend, backend, infrastructure}
  terms_and_conditions JSONB, -- Array of strings
  
  approved_at TIMESTAMP,
  approved_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for proposals table
CREATE INDEX IF NOT EXISTS idx_proposals_partner ON proposals(partner_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_created ON proposals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_proposals_content ON proposals USING GIN(project_scope, deliverables); -- For JSONB search

-- ===================================
-- 4. PROPOSAL REQUESTS TABLE
-- ===================================
CREATE TABLE IF NOT EXISTS proposal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'closed')),
  admin_response TEXT,
  responded_by UUID REFERENCES users(id),
  responded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for proposal_requests table
CREATE INDEX IF NOT EXISTS idx_proposal_requests_proposal ON proposal_requests(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_requests_status ON proposal_requests(status);

-- ===================================
-- 5. SESSIONS TABLE
-- ===================================
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL, -- JWT token
  expires_at TIMESTAMP NOT NULL,
  ip_address VARCHAR(45), -- IPv6 compatible
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for sessions table
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- ===================================
-- 6. AUDIT LOGS TABLE
-- ===================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL, -- 'login', 'create_partner', 'update_proposal', etc.
  resource_type VARCHAR(50), -- 'partner', 'proposal', 'price_list'
  resource_id UUID,
  details JSONB, -- Additional context
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for audit_logs table
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- ===================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ===================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Note: RLS policies will be managed through API routes using service role key
-- For now, we'll use service role key which bypasses RLS
-- In production, you can add specific RLS policies if needed

-- ===================================
-- 8. UPDATE TRIGGERS
-- ===================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_price_lists_updated_at BEFORE UPDATE ON price_lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON proposals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- Schema Creation Complete
-- ===================================

