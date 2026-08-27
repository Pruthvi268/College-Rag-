import sqlite3
import os

db_path = "collegerag.db" if os.path.exists("collegerag.db") else "backend/collegerag.db"

if not os.path.exists(db_path):
    print(f"Database file not found at {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
cur = conn.cursor()

print("=" * 60)
print(f"       COLLEGERAG DATABASE INSPECTOR ({db_path})")
print("=" * 60)

# 1. Users
print("\n[1] USERS TABLE:")
cur.execute("SELECT id, name, email, role, created_at FROM users")
for u in cur.fetchall():
    print(f"  ID: {u[0]} | Name: {u[1]} | Email: {u[2]} | Role: {u[3]}")

# 2. Documents
print("\n[2] DOCUMENTS TABLE:")
cur.execute("SELECT id, title, category, department, status, chunk_count FROM documents")
for d in cur.fetchall():
    print(f"  ID: {d[0]} | {d[1]} | Category: {d[2]} | Status: {d[4]} | Chunks: {d[5]}")

# 3. Document Chunks
print("\n[3] CHUNKS SAMPLE (First 2):")
cur.execute("SELECT id, document_id, chunk_index, page_number, token_count, substr(content, 1, 80) FROM document_chunks LIMIT 2")
for c in cur.fetchall():
    print(f"  Chunk #{c[2]+1} (Doc {c[1]}, Page {c[3]}, ~{c[4]} tokens): {c[5]}...")

# 4. Conversations & Messages
print("\n[4] CONVERSATIONS & RECENT MESSAGES:")
cur.execute("SELECT id, title FROM conversations")
convs = cur.fetchall()
for conv in convs:
    print(f"  Conversation #{conv[0]}: {conv[1]}")
    cur.execute("SELECT role, substr(content, 1, 70), confidence FROM messages WHERE conversation_id=? ORDER BY created_at DESC LIMIT 3", (conv[0],))
    for m in cur.fetchall():
        role = "User" if m[0] == "user" else "Assistant"
        conf = f" (Confidence: {int(m[2]*100)}%)" if m[2] else ""
        print(f"    - {role}: {m[1]}...{conf}")

# 5. Unanswered Questions
print("\n[5] UNANSWERED QUERIES (Knowledge Gaps):")
cur.execute("SELECT id, question, max_similarity FROM unanswered_queries")
for q in cur.fetchall():
    print(f"  ID: {q[0]} | Question: '{q[1]}' | Similarity: {int(q[2]*100)}%")

print("\n" + "=" * 60)
