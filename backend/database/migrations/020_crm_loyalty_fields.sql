-- Add ai_health_score and web3_wallet_balance to customers table
ALTER TABLE nf_core.customers
ADD COLUMN IF NOT EXISTS ai_health_score INT DEFAULT 100,
ADD COLUMN IF NOT EXISTS web3_wallet_balance DOUBLE PRECISION DEFAULT 0.0;
