/**
 * Auto Enrich Supplements Script
 * 
 * Fetches supplements with missing nutrition_facts and enriches them using:
 * 1. Food Safety Korea API for raw data
 * 2. Gemini AI for structured analysis
 * 
 * Improvements:
 * - Retry logic for failed enrichments
 * - Centralized AI analysis and additive detection
 * - Better error tracking
 */

import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateAIAnalysis, createMixedSummary } from "./lib/gemini-nutrition-analyzer";
import { detectAdditives } from "./lib/additive-keywords";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const FOOD_SAFETY_API_KEY = process.env.FOOD_SAFETY_API_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Retry interval: 6 hours in milliseconds
const RETRY_INTERVAL_MS = 6 * 60 * 60 * 1000;

async function autoEnrichSupplements() {
    const limit = parseInt(process.argv[2] || "100", 10);
    console.log(`🚀 Starting automated nutrition info enrichment (Limit: ${limit})...\n`);

    const retryThreshold = new Date(Date.now() - RETRY_INTERVAL_MS).toISOString();

    // Fetch supplements where:
    // 1. nutrition_facts is null (not yet processed)
    // 2. OR enrichment failed but enough time has passed for retry
    const { data: supplements, error } = await supabase
        .from("supplements")
        .select("id, name, product_report_no, enrichment_status, enrichment_tried_at")
        .or(`nutrition_facts.is.null,and(enrichment_status.eq.failed,enrichment_tried_at.lt.${retryThreshold})`)
        .limit(limit);

    if (error) {
        console.error("Error fetching supplements:", error);
        return;
    }

    if (!supplements || supplements.length === 0) {
        console.log("✅ No pending supplements found for enrichment.");
        return;
    }

    console.log(`📦 Found ${supplements.length} supplements to enrich.\n`);

    let successCount = 0;
    let failCount = 0;

    for (const item of supplements) {
        console.log(`Processing: ${item.name} (Rule: ${item.product_report_no}, ID: ${item.id})...`);

        const SERVICE_ID = "C003";
        const url = `http://openapi.foodsafetykorea.go.kr/api/${FOOD_SAFETY_API_KEY}/${SERVICE_ID}/json/1/1/PRDLST_REPORT_NO=${item.product_report_no}`;

        try {
            const response = await fetch(url);
            const apiData = await response.json();
            const rawItem = apiData[SERVICE_ID]?.row?.[0];

            if (!rawItem) {
                console.warn(`⚠️ Could not find raw data for ${item.name}`);
                // Mark as failed with timestamp for retry later
                await supabase.from("supplements").update({
                    enrichment_status: "api_not_found",
                    enrichment_tried_at: new Date().toISOString()
                }).eq("id", item.id);
                failCount++;
                continue;
            }

            const rawMaterials = rawItem.RAWMTRL_NM || "";
            const nutritionStr = rawItem.NUT_MTR || rawItem.STDR_STND || "";

            // Use centralized AI analysis
            const aiAnalysis = await generateAIAnalysis(genAI, item.name, rawMaterials, nutritionStr);

            // Use centralized additive detection
            const additives = detectAdditives(rawMaterials);

            // Store structured data
            const mixedSummary = createMixedSummary(aiAnalysis);

            const enrichmentStatus = aiAnalysis.status === 'failed' ? 'failed' : 'success';

            const { error: updateError } = await supabase
                .from("supplements")
                .update({
                    nutrition_facts: aiAnalysis.nutrition_facts || [],
                    ai_summary: mixedSummary,
                    additives: additives,
                    enrichment_status: enrichmentStatus,
                    enrichment_tried_at: new Date().toISOString()
                })
                .eq("id", item.id);

            if (updateError) {
                console.error(`❌ Failed to update ${item.name}:`, updateError.message);
                failCount++;
            } else {
                console.log(`✅ Enriched: ${item.name} (${aiAnalysis.nutrition_facts.length} nutrients found)`);
                if (aiAnalysis.nutrition_facts.length > 0) {
                    console.log(JSON.stringify(aiAnalysis.nutrition_facts, null, 2));
                }
                successCount++;
            }

            // Rate limit for Gemini API
            await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (err) {
            console.error(`Error processing ${item.name}:`, err);
            // Mark as failed for retry
            await supabase.from("supplements").update({
                enrichment_status: "failed",
                enrichment_tried_at: new Date().toISOString()
            }).eq("id", item.id);
            failCount++;
        }
    }

    console.log(`\n✨ Enrichment batch completed!`);
    console.log(`   Success: ${successCount}`);
    console.log(`   Failed: ${failCount}`);
}

autoEnrichSupplements().catch(console.error);
