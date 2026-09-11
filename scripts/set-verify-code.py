#!/usr/bin/env python3
"""يضع رمز تأكيد معروفًا لحساب (لاختبارات فقط) — الاستخدام:
   python3 scripts/set-verify-code.py <email> <code>
"""
import sys
import hashlib
import sqlite3
from datetime import datetime, timedelta

DB = '/home/z/my-project/db/custom.db'
SECRET = 'qudratak-dev-secret-change-in-production-2024'  # نفس fallback في lib/auth.ts و lib/verify.ts

def main():
    email, code = sys.argv[1], sys.argv[2]
    h = hashlib.sha256(f'{code}:{SECRET}'.encode()).hexdigest()
    expires = (datetime.utcnow() + timedelta(minutes=10)).strftime('%Y-%m-%d %H:%M:%S')
    conn = sqlite3.connect(DB)
    cur = conn.execute(
        'UPDATE User SET verificationCode=?, verificationExpires=?, verificationAttempts=0, emailVerified=0 WHERE email=?',
        (h, expires, email),
    )
    conn.commit()
    print(f"rows updated: {cur.rowcount}")
    conn.close()

if __name__ == '__main__':
    main()
