import psycopg2
from psycopg2 import Error
from typing import Optional, List, Dict
import os

class DatabaseAccess:
    def __init__(self):
        # Database connection parameters
        self.db_params = {
            'host': 'localhost',
            'database': 'auction_db',
            'user': os.getenv('USER'),  # This will use your Mac username
            'password': ''  # MacOS PostgreSQL typically doesn't need password for local connections
        }
        self.connection = None
        self.cursor = None

    def connect(self) -> None:
        """Establish database connection"""
        try:
            self.connection = psycopg2.connect(**self.db_params)
            self.cursor = self.connection.cursor()
        except Error as e:
            print(f"Error connecting to PostgreSQL: {e}")
            raise

    def disconnect(self) -> None:
        """Close database connection"""
        if self.cursor:
            self.cursor.close()
        if self.connection:
            self.connection.close()

    def __enter__(self):
        """Context manager entry"""
        self.connect()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit"""
        self.disconnect()

    # User-related methods
    def create_user(self, email: str, password: str) -> Optional[int]:
        """Create a new user and return their ID"""
        try:
            self.cursor.execute(
                "INSERT INTO users (email, password) VALUES (%s, %s) RETURNING id",
                (email, password)
            )
            user_id = self.cursor.fetchone()[0]
            self.connection.commit()
            return user_id
        except Error as e:
            self.connection.rollback()
            print(f"Error creating user: {e}")
            return None

    def get_user(self, user_id: int) -> Optional[Dict]:
        """Retrieve user by ID"""
        try:
            self.cursor.execute(
                "SELECT id, email FROM users WHERE id = %s",
                (user_id,)
            )
            result = self.cursor.fetchone()
            if result:
                return {"id": result[0], "email": result[1]}
            return None
        except Error as e:
            print(f"Error retrieving user: {e}")
            return None

    # Bidding-related methods
    def place_bid(self, user_id: int, auction_id: int, bid_amount: float) -> Optional[int]:
        """Place a new bid and return the bid ID"""
        try:
            self.cursor.execute(
                "INSERT INTO bidding (user_id, auction_id, bid_amount) VALUES (%s, %s, %s) RETURNING id",
                (user_id, auction_id, bid_amount)
            )
            bid_id = self.cursor.fetchone()[0]
            self.connection.commit()
            return bid_id
        except Error as e:
            self.connection.rollback()
            print(f"Error placing bid: {e}")
            return None

    def get_user_bids(self, user_id: int) -> List[Dict]:
        """Retrieve all bids for a specific user"""
        try:
            self.cursor.execute(
                "SELECT id, auction_id, bid_amount FROM bidding WHERE user_id = %s ORDER BY bid_amount DESC",
                (user_id,)
            )
            results = self.cursor.fetchall()
            return [
                {
                    "bid_id": row[0],
                    "auction_id": row[1],
                    "bid_amount": float(row[2])
                }
                for row in results
            ]
        except Error as e:
            print(f"Error retrieving user bids: {e}")
            return []

    def get_auction_bids(self, auction_id: int) -> List[Dict]:
        """Retrieve all bids for a specific auction"""
        try:
            self.cursor.execute(
                """
                SELECT b.id, b.user_id, u.email, b.bid_amount 
                FROM bidding b
                JOIN users u ON b.user_id = u.id
                WHERE b.auction_id = %s 
                ORDER BY b.bid_amount DESC
                """,
                (auction_id,)
            )
            results = self.cursor.fetchall()
            return [
                {
                    "bid_id": row[0],
                    "user_id": row[1],
                    "user_email": row[2],
                    "bid_amount": float(row[3])
                }
                for row in results
            ]
        except Error as e:
            print(f"Error retrieving auction bids: {e}")
            return []

# Usage example:
if __name__ == "__main__":
    # Example usage of the DatabaseAccess class
    with DatabaseAccess() as db:
        # Create a new user
        user_id = db.create_user("test@example.com", "hashed_password")
        
        if user_id:
            # Place a bid
            bid_id = db.place_bid(user_id, auction_id=1, bid_amount=100.50)
            
            # Get user's bids
            user_bids = db.get_user_bids(user_id)
            print(f"User bids: {user_bids}")
            
            # Get auction bids
            auction_bids = db.get_auction_bids(auction_id=1)
            print(f"Auction bids: {auction_bids}")
