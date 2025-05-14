CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100)
);

CREATE TABLE devices (
    id SERIAL PRIMARY KEY,  
    token TEXT NOT NULL,
    type VARCHAR(50) 
);

CREATE TABLE user_devices (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    device_id INT REFERENCES devices(id)
);

CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    firebase_project_id TEXT,
    firebase_private_key TEXT,
    firebase_client_email TEXT
);