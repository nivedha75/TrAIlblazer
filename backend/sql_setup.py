import sqlite3
import os

def setup_database():
    db_name = "main.db"
    
    if not os.path.exists(db_name):
        open(db_name, 'w').close()
    
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS UserTable (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            hashed_pw TEXT NOT NULL
        )
    ''')
    
    conn.commit()
    conn.close()
    print("db setup complete")

if __name__ == "__main__":
    setup_database()