from flask import Flask, request, jsonify
import sqlite3
import hashlib
import re

app = Flask(__name__)

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def is_valid_email(email):
    return re.match(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$", email)

def is_strong_password(password):
    return len(password) >= 8 and any(c.isdigit() for c in password) and any(c.isupper() for c in password)

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
    
    conn = sqlite3.connect("main.db")
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM UserTable WHERE email = ?", (email,))
    if cursor.fetchone():
        conn.close()
        return jsonify({'error': 'Email already registered'}), 400
    
    cursor.execute("INSERT INTO UserTable (username, email, hashed_pw) VALUES (?, ?, ?)", (username, email, hashed_pw))
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Registration successful'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
    
    conn = sqlite3.connect("main.db")
    cursor = conn.cursor()
    
    cursor.execute("SELECT hashed_pw FROM UserTable WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()
    
    if not user or user[0] != hash_password(password):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    return jsonify({'message': 'Login successful'}), 200


if __name__ == '__main__':
    app.run(debug=True)
