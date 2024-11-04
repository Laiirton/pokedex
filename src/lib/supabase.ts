import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xpieenqywbtxowylnkkr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwaWVlbnF5d2J0eG93eWxua2tyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc1Nzg0NDYsImV4cCI6MjA0MzE1NDQ0Nn0.S6WcaLWio9J0GVQRjAM3-crrnH5tBxM1ke7vBicy4lA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);