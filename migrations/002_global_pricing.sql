-- ===================================
-- Migration: Global Pricing System
-- Changes price_lists to be global (currency-based) instead of partner-specific
-- ===================================

-- Drop the unique constraint on partner_id
ALTER TABLE price_lists DROP CONSTRAINT IF EXISTS price_lists_partner_id_key;

-- Make partner_id nullable (for global pricing)
ALTER TABLE price_lists ALTER COLUMN partner_id DROP NOT NULL;

-- Add unique constraint on currency (one price list per currency)
ALTER TABLE price_lists ADD CONSTRAINT price_lists_currency_unique UNIQUE (currency);

-- Drop the old index
DROP INDEX IF EXISTS idx_price_lists_partner;

-- Create new index on currency
CREATE INDEX IF NOT EXISTS idx_price_lists_currency ON price_lists(currency);

-- Insert default global pricing based on Neural Arc Knowledge Base
-- India (INR) pricing
INSERT INTO price_lists (currency, helium_license_monthly, helium_license_annual, development_rate_per_hour, deployment_cost, maintenance_cost)
VALUES (
  'INR',
  75000,      -- ₹50,000-75,000: Small teams (using mid-range)
  900000,     -- Annual: 12 * 75000
  1200,       -- ₹1,200/hour
  375000,     -- Standard deployment: ₹3,75,000 - ₹6,00,000 (using mid-range)
  60000       -- Standard support: ₹60,000 - ₹1,00,000 (using mid-range)
)
ON CONFLICT (currency) DO NOTHING;

-- International (USD) pricing
INSERT INTO price_lists (currency, helium_license_monthly, helium_license_annual, development_rate_per_hour, deployment_cost, maintenance_cost)
VALUES (
  'USD',
  2000,       -- $2,000-10,000: Medium teams (using mid-range)
  24000,      -- Annual: 12 * 2000
  35,         -- $35/hour
  5000,       -- Standard deployment: $5,000 - $8,000 (using mid-range)
  800         -- Standard support: $800 - $1,400 (using mid-range)
)
ON CONFLICT (currency) DO NOTHING;

-- EUR pricing (using USD rates as base)
INSERT INTO price_lists (currency, helium_license_monthly, helium_license_annual, development_rate_per_hour, deployment_cost, maintenance_cost)
VALUES (
  'EUR',
  1800,       -- Approx EUR equivalent
  21600,      -- Annual
  32,         -- Approx EUR equivalent
  4500,       -- Approx EUR equivalent
  720         -- Approx EUR equivalent
)
ON CONFLICT (currency) DO NOTHING;

-- GBP pricing (using USD rates as base)
INSERT INTO price_lists (currency, helium_license_monthly, helium_license_annual, development_rate_per_hour, deployment_cost, maintenance_cost)
VALUES (
  'GBP',
  1600,       -- Approx GBP equivalent
  19200,      -- Annual
  28,         -- Approx GBP equivalent
  4000,       -- Approx GBP equivalent
  640         -- Approx GBP equivalent
)
ON CONFLICT (currency) DO NOTHING;

