-- Migration: Omni-Channel Chat schema
CREATE TABLE IF NOT EXISTS nf_core.chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES nf_core.tenants(id),
    work_item_id UUID REFERENCES nf_core.work_items(id),
    customer_id VARCHAR(255),
    operator_id UUID REFERENCES nf_core.users(id),
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN', -- OPEN, RESOLVED
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS nf_core.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES nf_core.chat_conversations(id) ON DELETE CASCADE,
    sender_type VARCHAR(50) NOT NULL, -- CUSTOMER, OPERATOR, AI
    sender_id VARCHAR(255), -- Có thể là ID khách, ID user, hoặc 'AI'
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_tenant ON nf_core.chat_conversations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_work_item ON nf_core.chat_conversations(work_item_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON nf_core.chat_messages(conversation_id);
