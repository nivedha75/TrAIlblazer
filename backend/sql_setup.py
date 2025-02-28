import sqlite3

def setup_database(restart=False):
    conn = sqlite3.connect("main.db")
    cursor = conn.cursor()
    
    if restart:
        cursor.execute("DROP TABLE IF EXISTS UserTable")
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS UserTable (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            hashed_pw TEXT NOT NULL,
            verified INTEGER DEFAULT 0,
            verification_token TEXT NOT NULL
        )
    ''')

    cursor.execute("INSERT INTO UserTable (user_id, username, email, hashed_pw, verified, verification_token) VALUES (?, ?, ?, ?, ?, ?)", (10, "relaxer", "relaxer@gmail.com", "07480fb9e85b9396af06f006cf1c95024af2531c65fb505cfbd0add1e2f31573", 1, "11d152fe-4da4-44a5-9e5e-cbdafa58094a"))
    cursor.execute("INSERT INTO UserTable (user_id, username, email, hashed_pw, verified, verification_token) VALUES (?, ?, ?, ?, ?, ?)", (11, "adventurer", "adventurer@gmail.com", "07480fb9e85b9396af06f006cf1c95024af2531c65fb505cfbd0add1e2f31573", 1, "afe75bd3-1d17-41c1-9393-f8c78890ee0f"))
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    import sys
    restart_flag = '--restart' in sys.argv
    if restart_flag: print('restarting all db schemas')
    setup_database(restart=restart_flag)