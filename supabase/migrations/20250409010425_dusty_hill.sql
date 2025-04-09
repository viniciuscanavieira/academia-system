/*
  # Initial Schema for Gym Management System

  1. New Tables
    - users
      - Custom fields for user profiles
    - memberships
      - Membership plans and status
    - payments
      - Payment records
    - attendance
      - Gym attendance records
    - personal_trainer_requests
      - Personal trainer booking requests
    
  2. Security
    - Enable RLS on all tables
    - Add policies for admin and member access
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'member');
CREATE TYPE membership_status AS ENUM ('active', 'expired', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed');
CREATE TYPE trainer_request_status AS ENUM ('pending', 'approved', 'rejected');

-- Create users table with profile fields
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  role user_role DEFAULT 'member',
  full_name text,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create memberships table
CREATE TABLE IF NOT EXISTS memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  status membership_status DEFAULT 'active',
  start_date date DEFAULT CURRENT_DATE,
  end_date date,
  plan_name text NOT NULL,
  price decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  membership_id uuid REFERENCES memberships(id),
  amount decimal(10,2) NOT NULL,
  status payment_status DEFAULT 'pending',
  payment_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  check_in timestamptz DEFAULT now(),
  check_out timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create personal trainer requests table
CREATE TABLE IF NOT EXISTS personal_trainer_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  trainer_id uuid REFERENCES users(id),
  status trainer_request_status DEFAULT 'pending',
  requested_date date NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_trainer_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view own profile"
  ON users
  FOR SELECT
  USING (auth.uid() = id OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- Create policies for memberships table
CREATE POLICY "Users can view own memberships"
  ON memberships
  FOR SELECT
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- Create policies for payments table
CREATE POLICY "Users can view own payments"
  ON payments
  FOR SELECT
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- Create policies for attendance table
CREATE POLICY "Users can view own attendance"
  ON attendance
  FOR SELECT
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Users can create own attendance"
  ON attendance
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Create policies for personal trainer requests table
CREATE POLICY "Users can view own trainer requests"
  ON personal_trainer_requests
  FOR SELECT
  USING (user_id = auth.uid() OR trainer_id = auth.uid() OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Users can create own trainer requests"
  ON personal_trainer_requests
  FOR INSERT
  WITH CHECK (user_id = auth.uid());