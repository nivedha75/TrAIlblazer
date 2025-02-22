from flask import Flask, request, jsonify, session
import sqlite3
import hashlib
import re
import smtplib
import uuid
from email.message import EmailMessage

app = Flask(__name__)
app.secret_key = 'secret_key'

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
EMAIL_SENDER = "noreply.trailblazer@gmail.com"
EMAIL_PASSWORD = "Test@1234"

PORT = 5003


def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def is_valid_email(email):
    return re.match(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$", email)

def is_strong_password(password):
    return len(password) >= 8 and any(c.isdigit() for c in password) and any(c.isupper() for c in password)

def send_verification_email(email, token):
    msg = EmailMessage()
    msg.set_content(f"Click the link to verify your email: http://localhost:{PORT}/verify?token={token}")
    msg["Subject"] = "Verify Your Email"
    msg["From"] = EMAIL_SENDER
    msg["To"] = email
    
    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls()
        server.login(EMAIL_SENDER, EMAIL_PASSWORD)
        server.send_message(msg)

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    if not username or not email or not password:
        return jsonify({'error': 'All fields are required'}), 400
    
    if not is_valid_email(email):
        return jsonify({'error': 'Invalid email format'}), 400
    
    if not is_strong_password(password):
        return jsonify({'error': 'Password must be at least 8 characters long, contain a digit and an uppercase letter'}), 400
    
    hashed_pw = hash_password(password)
    verification_token = str(uuid.uuid4())
    
    conn = sqlite3.connect("main.db")
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM UserTable WHERE email = ?", (email,))
    if cursor.fetchone():
        conn.close()
        return jsonify({'error': 'Email already registered'}), 400
    
    cursor.execute("INSERT INTO UserTable (username, email, hashed_pw, verified, verification_token) VALUES (?, ?, ?, ?, ?)", (username, email, hashed_pw, 0, verification_token))
    conn.commit()
    conn.close()
    
    send_verification_email(email, verification_token)
    
    return jsonify({'message': 'Registration successful. Please check your email to verify your account.'}), 201

@app.route('/verify', methods=['GET'])
def verify():
    token = request.args.get('token')
    
    if not token:
        return jsonify({'error': 'Invalid token'}), 400
    
    conn = sqlite3.connect("main.db")
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM UserTable WHERE verification_token = ?", (token,))
    user = cursor.fetchone()
    
    if not user:
        conn.close()
        return jsonify({'error': 'Invalid or expired token'}), 400
    
    cursor.execute("UPDATE UserTable SET verified = 1, verification_token = NULL WHERE verification_token = ?", (token,))
    conn.commit()
    conn.close()

    session["user"] = user[0]
    
    return jsonify({'message': 'Email verified successfully. You can now log in.'}), 200

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
    
    conn = sqlite3.connect("main.db")
    cursor = conn.cursor()
    
    cursor.execute("SELECT hashed_pw, verified FROM UserTable WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()
    
    if not user or user[0] != hash_password(password):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    if user[1] == 0:
        return jsonify({'error': 'Please verify your email before logging in'}), 403
    
    return jsonify({'message': 'Login successful'}), 200

@app.route('/logout', methods=['POST'])
def logout():
    session.pop('user', None)
    return jsonify({'message': 'Logged out'})

@app.route('/is_authenticated', methods=['GET'])
def is_authenticated():
    return jsonify({'authenticated': 'user' in session})

if __name__ == '__main__':
    app.run(debug=True, port=PORT)
