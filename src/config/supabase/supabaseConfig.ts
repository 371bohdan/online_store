import { createClient } from '@supabase/supabase-js';
import { ENV } from '../dotenv/env';

const supabaseUrl = ENV.SUPABASE_URL;
const supabaseKey = ENV.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
export default supabase