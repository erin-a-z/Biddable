# Tech
Using PostgreSQL

two databases, one for authentication and one for the main application

The main application stores bidding information in a table called `bidding`

# Schema

users
- id
- email
- password

bidding
- id
- user_id
- auction_id
- bid_amount


# To install psycopg2
pip install psycopg2

# To install postgres
First, install PostgreSQL if you haven't already:
For Ubuntu/Debian:
```
sudo apt update
sudo apt install postgresql postgresql-contrib
```
For MacOS (using Homebrew):
```
brew install postgresql@14
brew services start postgresql@14
```
For Windows:
```
Download and install from: https://www.postgresql.org/download/windows/
```

# To create a new database
```
sudo -u postgres psql
CREATE DATABASE auction_db;
```

