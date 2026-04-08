import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pvkstyhfcopjtchvgogy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2a3N0eWhmY29wanRjaHZnb2d5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NDY3OTMsImV4cCI6MjA5MTIyMjc5M30.GMQUufoH0Piuf_X_J0tT5vYZ6VGR21xrn-r8l-KLtO4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
