import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Unified Generation API Endpoint
  app.post("/api/generate-wordpress-theme", async (req, res) => {
    const { designDescription, designType, engine = 'DeepSeek' } = req.body;
    
    try {
      let files: any[] = [];
      const prompt = `
        You are an expert WordPress Theme Developer. 
        Convert the following design concept into a functional WordPress Theme structure based on the Stitch design system.
        
        Design Concept: ${designDescription}
        Component Focus: ${designType}
        Aesthetic: Modern, clean, professional, marketplace-ready.

        Generate the code for the following essential WordPress files:
        1. style.css (Theme header and basic styles)
        2. index.php (Main loop)
        3. functions.php (Enqueuing styles and theme support)
        4. header.php (Document head and navigation)
        5. footer.php (Footer and wp_footer)
        6. templates/content-${designType.toLowerCase()}.php (The specific section based on the design)

        Ensure the code is clean, follows WordPress coding standards, and is commented.
        Return the result as a JSON object with a key named "files" which contains an array of objects with 'path' and 'content' properties.
        Format: {"files": [{"path": "style.css", "content": "..." }, ...]}
      `;

      if (engine === 'DeepSeek') {
        const apiKey = process.env.DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY;
        if (!apiKey) throw new Error("DeepSeek API key is missing. Add DEEPSEEK_API_KEY to Secrets.");

        const client = new OpenAI({
          apiKey: apiKey,
          baseURL: "https://api.deepseek.com"
        });

        const response = await client.chat.completions.create({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: "You are a specialized WordPress theme generator. You only output valid JSON objects containing theme files." },
            { role: "user", content: prompt }
          ],
          response_format: { type: 'json_object' }
        });

        const data = JSON.parse(response.choices[0].message.content || '{}');
        files = data.files || (Array.isArray(data) ? data : Object.values(data).find(v => Array.isArray(v)) || []);
      } else {
        // Fallback to Gemini
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("GEMINI_API_KEY is missing. AI Studio usually provides this automatically.");
        
        const genAI = new GoogleGenAI(apiKey);
        const model = genAI.getGenerativeModel({ 
          model: "gemini-1.5-flash",
          generationConfig: { responseMimeType: "application/json" }
        });
        
        const result = await model.generateContent(prompt);
        const data = JSON.parse(result.response.text() || '{}');
        files = data.files || (Array.isArray(data) ? data : Object.values(data).find(v => Array.isArray(v)) || []);
      }

      res.json({ files });
    } catch (error: any) {
      console.error(`${engine} API Failure:`, error);
      
      const status = error.status === 402 ? 402 : 500;
      const message = error.status === 402 
        ? `${engine} API: Insufficient Balance. Please check your account.` 
        : (error.message || `Failed to generate theme with ${engine}`);

      res.status(status).json({ error: message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
