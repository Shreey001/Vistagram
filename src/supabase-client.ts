import { createClient } from "@supabase/supabase-js"

// Use environment variables with proper Vite prefixing
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://fssnxsiaunyitldcptbe.supabase.co"
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzc254c2lhdW55aXRsZGNwdGJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1MTA4OTIsImV4cCI6MjA1NzA4Njg5Mn0.cT-7yvBuciZMa-MKo2FjzAan4o3AZDq8lsy_HXnArxc"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
