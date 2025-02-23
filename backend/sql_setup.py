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
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    import sys
    restart_flag = '--restart' in sys.argv
    if restart_flag: print('restarting all db schemas')
    setup_database(restart=restart_flag)