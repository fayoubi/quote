-- Sample agents with Moroccan and French phone numbers
INSERT INTO agents (id, phone_number, country_code, first_name, last_name, email, license_number, status)
VALUES
  -- Moroccan agents
  ('a1111111-1111-1111-1111-111111111111', '612345678', '+212', 'Ahmed', 'Benali', 'ahmed.benali@yadmanx.ma', '123456', 'active'),
  ('a2222222-2222-2222-2222-222222222222', '698765432', '+212', 'Fatima', 'El Amrani', 'fatima.elamrani@yadmanx.ma', '234567', 'active'),
  ('a3333333-3333-3333-3333-333333333333', '655443322', '+212', 'Youssef', 'Tazi', 'youssef.tazi@yadmanx.ma', '345678', 'active'),

  -- French agents
  ('a4444444-4444-4444-4444-444444444444', '612345678', '+33', 'Jean', 'Dupont', 'jean.dupont@yadmanx.fr', '456789', 'active'),
  ('a5555555-5555-5555-5555-555555555555', '698765432', '+33', 'Marie', 'Martin', 'marie.martin@yadmanx.fr', '567890', 'active')
ON CONFLICT (id) DO NOTHING;

-- Note: In production, agents would register through the API
-- These are pre-seeded for testing purposes only