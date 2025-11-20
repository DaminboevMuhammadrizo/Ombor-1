import { createClient } from '@supabase/supabase-js'

// Sizning Supabase ma'lumotlaringiz
const supabaseUrl = 'https://oqjhajhggmwhlbpzbnfa.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xamhhamhnZ213aGxicHpibmZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NDM3NjcsImV4cCI6MjA3OTIxOTc2N30.6wbGxRvZTXt6y3J8J_iFnU-DXkAmOK0kIhZcOEFHT94'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Test uchun
console.log('Supabase client yaratildi')
