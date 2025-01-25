from flask import Flask, render_template, request, redirect, url_for, flash
from Database.access import DatabaseAccess
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Required for flash messages

@app.route('/')
def index():
    with DatabaseAccess() as db:
        # Get all auction bids for display
        auction_bids = db.get_auction_bids(auction_id=1)
    return render_template('index.html', bids=auction_bids)

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        hashed_password = generate_password_hash(password)
        
        with DatabaseAccess() as db:
            user_id = db.create_user(email, hashed_password)
            if user_id:
                flash('Registration successful!')
                return redirect(url_for('index'))
            flash('Registration failed!')
    
    return render_template('register.html')

@app.route('/place_bid', methods=['POST'])
def place_bid():
    username = request.form['username']
    bid_amount = float(request.form['amount'])
    
    with DatabaseAccess() as db:
        user_id = db.get_user_id_by_email(username)
        if not user_id:
            flash('User not found!')
            return redirect(url_for('index'))
            
        bid_id = db.place_bid(user_id, auction_id=1, bid_amount=bid_amount)
        if bid_id:
            flash('Bid placed successfully!')
        else:
            flash('Failed to place bid!')
    
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True) 