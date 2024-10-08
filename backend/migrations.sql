CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    transaction_history JSONB,
    credit_limit NUMERIC,
    emotional_data JSONB
);