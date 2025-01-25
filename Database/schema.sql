-- Create users table for authentication
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- Create bidding table for auction data
CREATE TABLE bidding (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    auction_id INTEGER NOT NULL,
    bid_amount DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes for better query performance
CREATE INDEX idx_bidding_user_id ON bidding(user_id);
CREATE INDEX idx_bidding_auction_id ON bidding(auction_id); 