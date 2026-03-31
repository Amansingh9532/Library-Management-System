-- PostgreSQL Schema for Library Management System

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  date_of_birth DATE NOT NULL,
  father_name VARCHAR(255) NOT NULL,
  gender VARCHAR(20) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
  address TEXT NOT NULL,
  course VARCHAR(100) NOT NULL,
  mobile_number VARCHAR(15) UNIQUE NOT NULL,
  date_of_joining DATE NOT NULL,
  id_card_path VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Books table
CREATE TABLE IF NOT EXISTS books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  isbn VARCHAR(20),
  category VARCHAR(100),
  quantity INT DEFAULT 1,
  issue_fee DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Book Issues table
CREATE TABLE IF NOT EXISTS book_issues (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  book_id INT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  return_date DATE,
  fee_charged DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'Issued' CHECK (status IN ('Issued', 'Returned')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fees table
CREATE TABLE IF NOT EXISTS fees (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  fee_type VARCHAR(20) NOT NULL CHECK (fee_type IN ('Book Issue', 'Membership', 'Late Fee', 'Other')),
  description TEXT,
  status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Paid', 'Cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  paid_at TIMESTAMP
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value VARCHAR(255) NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Default system settings
INSERT INTO settings (setting_key, setting_value) 
VALUES ('membership_fee', '500.00')
ON CONFLICT (setting_key) DO NOTHING;
