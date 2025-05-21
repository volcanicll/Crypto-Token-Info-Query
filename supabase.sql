-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create token queries table with analysis type support
CREATE TABLE IF NOT EXISTS token_queries (
    id BIGSERIAL PRIMARY KEY,
    query_id UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    contract_address TEXT NOT NULL,
    blockchain TEXT NOT NULL,
    analysis_type TEXT NOT NULL CHECK (analysis_type IN ('ai', 'basic')),
    queried_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create analysis results table for storing responses
CREATE TABLE IF NOT EXISTS analysis_results (
    id BIGSERIAL PRIMARY KEY,
    query_id UUID REFERENCES token_queries(query_id) NOT NULL,
    analysis_type TEXT NOT NULL CHECK (analysis_type IN ('ai', 'basic')),
    twitter_analysis JSONB,  -- For storing AI analysis results
    basic_metrics JSONB,     -- For storing basic token metrics
    error TEXT,             -- For storing any errors that occurred
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indices for better query performance
CREATE INDEX IF NOT EXISTS idx_token_queries_contract_address ON token_queries(contract_address);
CREATE INDEX IF NOT EXISTS idx_token_queries_blockchain ON token_queries(blockchain);
CREATE INDEX IF NOT EXISTS idx_token_queries_analysis_type ON token_queries(analysis_type);
CREATE INDEX IF NOT EXISTS idx_token_queries_queried_at ON token_queries(queried_at);
CREATE INDEX IF NOT EXISTS idx_analysis_results_query_id ON analysis_results(query_id);
CREATE INDEX IF NOT EXISTS idx_analysis_results_completed_at ON analysis_results(completed_at);

-- Create view for combined query and result data
CREATE OR REPLACE VIEW v_analysis_history AS
SELECT
    q.query_id,
    q.contract_address,
    q.blockchain,
    q.analysis_type,
    q.queried_at,
    r.twitter_analysis,
    r.basic_metrics,
    r.error,
    r.completed_at
FROM token_queries q
LEFT JOIN analysis_results r ON q.query_id = r.query_id
ORDER BY q.queried_at DESC;

-- Function to clean up old records (keeps last 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_records() RETURNS void AS $$
BEGIN
    -- Delete old analysis results
    DELETE FROM analysis_results
    WHERE created_at < NOW() - INTERVAL '30 days';

    -- Delete old queries that have no results
    DELETE FROM token_queries
    WHERE created_at < NOW() - INTERVAL '30 days'
    AND NOT EXISTS (
        SELECT 1 FROM analysis_results
        WHERE analysis_results.query_id = token_queries.query_id
    );
END;
$$ LANGUAGE plpgsql;

