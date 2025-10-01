-- Seed sample agents
INSERT INTO agents (id, phone_number, country_code, first_name, last_name, email, license_number, status)
VALUES 
  ('11111111-1111-1111-1111-111111111111', '+212612345678', '+212', 'Ahmed', 'Bennani', 'ahmed.bennani@yadmanx.com', '100001', 'active'),
  ('22222222-2222-2222-2222-222222222222', '+212623456789', '+212', 'Fatima', 'El Amrani', 'fatima.elamrani@yadmanx.com', '100002', 'active'),
  ('33333333-3333-3333-3333-333333333333', '+33612345678', '+33', 'Jean', 'Dupont', 'jean.dupont@yadmanx.fr', '100003', 'active'),
  ('44444444-4444-4444-4444-444444444444', '+212634567890', '+212', 'Mohammed', 'Alaoui', 'mohammed.alaoui@yadmanx.com', '100004', 'active'),
  ('55555555-5555-5555-5555-555555555555', '+33623456789', '+33', 'Marie', 'Martin', 'marie.martin@yadmanx.fr', '100005', 'active')
ON CONFLICT (id) DO NOTHING;
