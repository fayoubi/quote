-- Create database schema for multi-product insurance pricing service

-- Product configuration table
CREATE TABLE products (
    product_type VARCHAR(50) PRIMARY KEY,
    display_name VARCHAR(100) NOT NULL,
    configuration JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Multi-product rate tables
CREATE TABLE rate_tables (
    id SERIAL PRIMARY KEY,
    product_type VARCHAR(50) REFERENCES products(product_type),
    risk_class VARCHAR(50) NOT NULL,
    gender VARCHAR(10) NOT NULL,
    age_min INTEGER NOT NULL,
    age_max INTEGER NOT NULL,
    term_length INTEGER,
    rate_per_thousand DECIMAL(10,4) NOT NULL,
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_type, risk_class, gender, age_min, age_max, term_length, effective_date)
);

-- Universal quote storage
CREATE TABLE quotes (
    quote_id VARCHAR(50) PRIMARY KEY,
    product_type VARCHAR(50) NOT NULL,
    applicant_data JSONB NOT NULL,
    pricing_result JSONB NOT NULL,
    eligibility_flags JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    INDEX idx_quotes_expires_at (expires_at),
    INDEX idx_quotes_product_type (product_type),
    INDEX idx_quotes_created_at (created_at)
);

-- Insert default products
INSERT INTO products (product_type, display_name, configuration, is_active) VALUES
(
    'term_life',
    'Term Life Insurance',
    '{
        "terms": [10, 20],
        "min_coverage": 250000,
        "max_coverage": 1500000,
        "age_min": 18,
        "age_max": 75,
        "risk_classes": [
            "SuperPreferredPlus",
            "SuperPreferred",
            "PreferredPlus",
            "Preferred",
            "StandardPlus",
            "Standard",
            "Substandard",
            "Uninsurable"
        ]
    }',
    true
),
(
    'whole_life',
    'Whole Life Insurance',
    '{
        "min_coverage": 100000,
        "max_coverage": 2000000,
        "age_min": 18,
        "age_max": 80,
        "payment_modes": ["annual", "semi-annual", "quarterly", "monthly"]
    }',
    false
),
(
    'annuity',
    'Annuity Products',
    '{
        "min_premium": 50000,
        "max_premium": 5000000,
        "age_min": 50,
        "age_max": 85,
        "annuity_types": ["immediate", "deferred"]
    }',
    false
);

-- Insert sample rate tables for term life
INSERT INTO rate_tables (product_type, risk_class, gender, age_min, age_max, term_length, rate_per_thousand) VALUES
-- Super Preferred Plus rates
('term_life', 'SuperPreferredPlus', 'Male', 18, 30, 10, 0.60),
('term_life', 'SuperPreferredPlus', 'Male', 31, 40, 10, 0.80),
('term_life', 'SuperPreferredPlus', 'Male', 41, 50, 10, 1.20),
('term_life', 'SuperPreferredPlus', 'Male', 51, 60, 10, 2.40),
('term_life', 'SuperPreferredPlus', 'Male', 61, 75, 10, 4.80),

('term_life', 'SuperPreferredPlus', 'Male', 18, 30, 20, 0.72),
('term_life', 'SuperPreferredPlus', 'Male', 31, 40, 20, 0.96),
('term_life', 'SuperPreferredPlus', 'Male', 41, 50, 20, 1.44),
('term_life', 'SuperPreferredPlus', 'Male', 51, 60, 20, 2.88),
('term_life', 'SuperPreferredPlus', 'Male', 61, 75, 20, 5.76),

-- Female rates (typically 12.5% lower)
('term_life', 'SuperPreferredPlus', 'Female', 18, 30, 10, 0.525),
('term_life', 'SuperPreferredPlus', 'Female', 31, 40, 10, 0.70),
('term_life', 'SuperPreferredPlus', 'Female', 41, 50, 10, 1.05),
('term_life', 'SuperPreferredPlus', 'Female', 51, 60, 10, 2.10),
('term_life', 'SuperPreferredPlus', 'Female', 61, 75, 10, 4.20),

('term_life', 'SuperPreferredPlus', 'Female', 18, 30, 20, 0.63),
('term_life', 'SuperPreferredPlus', 'Female', 31, 40, 20, 0.84),
('term_life', 'SuperPreferredPlus', 'Female', 41, 50, 20, 1.26),
('term_life', 'SuperPreferredPlus', 'Female', 51, 60, 20, 2.52),
('term_life', 'SuperPreferredPlus', 'Female', 61, 75, 20, 5.04),

-- Standard rates (higher)
('term_life', 'Standard', 'Male', 18, 30, 10, 1.50),
('term_life', 'Standard', 'Male', 31, 40, 10, 2.00),
('term_life', 'Standard', 'Male', 41, 50, 10, 3.00),
('term_life', 'Standard', 'Male', 51, 60, 10, 6.00),
('term_life', 'Standard', 'Male', 61, 75, 10, 12.00),

('term_life', 'Standard', 'Male', 18, 30, 20, 1.80),
('term_life', 'Standard', 'Male', 31, 40, 20, 2.40),
('term_life', 'Standard', 'Male', 41, 50, 20, 3.60),
('term_life', 'Standard', 'Male', 51, 60, 20, 7.20),
('term_life', 'Standard', 'Male', 61, 75, 20, 14.40),

('term_life', 'Standard', 'Female', 18, 30, 10, 1.31),
('term_life', 'Standard', 'Female', 31, 40, 10, 1.75),
('term_life', 'Standard', 'Female', 41, 50, 10, 2.625),
('term_life', 'Standard', 'Female', 51, 60, 10, 5.25),
('term_life', 'Standard', 'Female', 61, 75, 10, 10.50),

('term_life', 'Standard', 'Female', 18, 30, 20, 1.575),
('term_life', 'Standard', 'Female', 31, 40, 20, 2.10),
('term_life', 'Standard', 'Female', 41, 50, 20, 3.15),
('term_life', 'Standard', 'Female', 51, 60, 20, 6.30),
('term_life', 'Standard', 'Female', 61, 75, 20, 12.60);

-- Create indexes for performance
CREATE INDEX idx_rate_tables_product_lookup ON rate_tables(product_type, risk_class, gender, age_min, age_max, term_length);
CREATE INDEX idx_rate_tables_effective_date ON rate_tables(effective_date);

-- Create updated_at trigger for products
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();