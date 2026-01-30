import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    const { data, error } = await supabase
        .from('supplements')
        .select('name, nutrition_facts')
        .eq('id', '98ff0394-37d2-493d-b4ed-c83b3ff68587')
        .single();

    if (error) {
        console.error(error);
        return;
    }

    console.log('--- PRODUCT INFO ---');
    console.log('Name:', data.name);
    console.log('Parsed Nutrition Facts:', JSON.stringify(data.nutrition_facts, null, 2));
}

inspect();
