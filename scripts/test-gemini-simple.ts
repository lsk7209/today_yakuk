
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config({ path: ".env.local" });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function testGemini() {
    if (!GEMINI_API_KEY) {
        console.error("❌ GEMINI_API_KEY is missing in .env.local");
        return;
    }

    console.log(`🔑 Using API Key: ${GEMINI_API_KEY.substring(0, 5)}...`);

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    // List available models first
    try {
        console.log("📋 Fetching available models...");
        const modelList = await genAI.getGenerativeModel({ model: "gemini-pro" }).apiKey; // Hack to access manager if needed? No, use GoogleGenerativeAI instance?
        // Actually, the SDK doesn't expose listModels directly on the main class easily in some versions.
        // Let's use a raw fetch for listing models to be sure.
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`);
        const data = await response.json();

        if (data.models) {
            console.log(`✅ Available Models (${data.models.length}):`);
            data.models.forEach((m: any) => console.log(`   - ${m.name}`));
        } else {
            console.error("❌ Failed to list models:", JSON.stringify(data));
        }
    } catch (e: any) {
        console.error("❌ Error listing models:", e.message);
    }

    // Test multiple models to find which one works
    const models = ["gemini-2.5-flash-lite", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-pro"];

    for (const modelName of models) {
        console.log(`\n🤖 Testing model: ${modelName}...`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello, are you working?");
            const response = result.response.text();
            console.log(`✅ Success! Response: ${response.trim().substring(0, 50)}...`);
            console.log(`🎯 WORKING MODEL FOUND: ${modelName}`);
            return; // Exit after first success
        } catch (error: any) {
            console.error(`❌ Failed: ${error.message.split('\n')[0]}`);
        }
    }

    console.error("\n💀 All models failed. Please check your API Key permissions or quota.");
}

testGemini();
