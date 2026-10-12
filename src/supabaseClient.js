import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ciwkdaupgkccmtlppifx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpd2tkYXVwZ2tjY210bHBwaWZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxNDM1MDAsImV4cCI6MjA5NzcxOTUwMH0.7lBQkBshTidWAmN1LnvYE3L_GCR0_v7y-J--_3W1bXM';

export const supabase = createClient(supabaseUrl, supabaseKey);
