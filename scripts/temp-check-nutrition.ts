
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function findEmptyNutrition() {
    const { data, error } = await supabase
        .from('supplements')
        .select('id, name, product_report_no, nutrition_facts')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('Sample supplements:');
    data?.forEach(item => {
        console.log(`- ${item.name} (${item.product_report_no}): ${JSON.stringify(item.nutrition_facts)}`);
    });
}

findEmptyNutrition().catch(console.error);
