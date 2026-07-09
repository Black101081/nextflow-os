-- MIGRATION 015: VIETQR BILLING
-- Loại bỏ Stripe, thay thế bằng VietQR (Napas)

ALTER TABLE nf_core.invoices 
DROP COLUMN IF EXISTS stripe_invoice_id,
DROP COLUMN IF EXISTS payment_link_url,
ADD COLUMN IF NOT EXISTS vietqr_string TEXT,
ADD COLUMN IF NOT EXISTS bank_bin VARCHAR(20),
ADD COLUMN IF NOT EXISTS bank_account VARCHAR(50),
ADD COLUMN IF NOT EXISTS transfer_content VARCHAR(100);

ALTER TABLE nf_core.invoices ALTER COLUMN currency SET DEFAULT 'VND';

-- Cập nhật gateway default trong transactions
ALTER TABLE nf_core.transactions ALTER COLUMN gateway SET DEFAULT 'vietqr';
