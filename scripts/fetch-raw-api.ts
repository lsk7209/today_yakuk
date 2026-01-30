import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const FOOD_SAFETY_API_KEY = process.env.FOOD_SAFETY_API_KEY!;
const REPORT_NO = "200400170061632";
const SERVICE_ID = "C003";

async function run() {
    const url = `http://openapi.foodsafetykorea.go.kr/api/${FOOD_SAFETY_API_KEY}/${SERVICE_ID}/json/1/1/PRDLST_REPORT_NO=${REPORT_NO}`;
    const response = await fetch(url);
    const data = await response.json();
    const row = data[SERVICE_ID]?.row?.[0];

    console.log('--- API RAW DATA ---');
    console.log(JSON.stringify(row, null, 2));
}
run();
