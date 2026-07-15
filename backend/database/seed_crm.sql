INSERT INTO nf_core.customers (tenant_id, full_name, phone_number, email, total_spent, order_count, last_order_date, segment, ai_health_score, web3_wallet_balance)
SELECT 
    t.id, 
    'Nguyễn Văn A', '0901234567', 'nva@example.com', 15000000, 12, NOW() - INTERVAL '5 days', 'VIP', 95, 1500.0
FROM nf_core.tenants t LIMIT 1;

INSERT INTO nf_core.customers (tenant_id, full_name, phone_number, email, total_spent, order_count, last_order_date, segment, ai_health_score, web3_wallet_balance)
SELECT 
    t.id, 
    'Trần Thị B', '0912345678', 'ttb@example.com', 250000, 1, NOW() - INTERVAL '150 days', 'CHURNING', 25, 25.0
FROM nf_core.tenants t LIMIT 1;

INSERT INTO nf_core.customers (tenant_id, full_name, phone_number, email, total_spent, order_count, last_order_date, segment, ai_health_score, web3_wallet_balance)
SELECT 
    t.id, 
    'Lê Văn C', '0923456789', 'lvc@example.com', 4500000, 5, NOW() - INTERVAL '30 days', 'REGULAR', 75, 450.0
FROM nf_core.tenants t LIMIT 1;

INSERT INTO nf_core.customers (tenant_id, full_name, phone_number, email, total_spent, order_count, last_order_date, segment, ai_health_score, web3_wallet_balance)
SELECT 
    t.id, 
    'Phạm Thị D', '0934567890', 'ptd@example.com', 8000000, 8, NOW() - INTERVAL '12 days', 'REGULAR', 80, 800.0
FROM nf_core.tenants t LIMIT 1;

INSERT INTO nf_core.customers (tenant_id, full_name, phone_number, email, total_spent, order_count, last_order_date, segment, ai_health_score, web3_wallet_balance)
SELECT 
    t.id, 
    'Hoàng Văn E', '0945678901', 'hve@example.com', 120000, 1, NOW() - INTERVAL '200 days', 'CHURNING', 15, 12.0
FROM nf_core.tenants t LIMIT 1;
