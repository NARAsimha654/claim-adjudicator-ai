import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load env vars from .env file
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET", "claim-documents")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("[DATABASE] Warning: SUPABASE_URL or SUPABASE_KEY not found in environment.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None

def get_supabase() -> Client:
    return supabase
