const { GoogleGenerativeAI } = require('@google/generative-ai');

async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { goal } = req.body;

    if (!goal) {
        return res.status(400).json({ error: 'Goal is required' });
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            You are a team of expert AI consultants helping a user create a powerful Instagram presence.
            The user's core idea is: "${goal}"

            Please generate a complete Instagram identity kit based on the following roles and instructions.

            ---
            **PROMPT 1: Brand Strategist - Username Generation**
            You are a world-class brand strategist.
            Generate 3 strong Instagram usernames based on the best naming patterns (brandable, evocative, descriptive, compound, etc.).
            Rules:
            - Each name must feel unique, available, easy to pronounce, and memorable.
            - It should hint at the page's topic or the desired feeling.
            - Provide a 1-line explanation for each name.
            - Format: { "name": "example", "reason": "Why it's good." }

            ---
            **PROMPT 2: Viral Copywriter - Bio Creation**
            You are a viral Instagram growth copywriter.
            Write a short, powerful 3-line bio that hooks the target audience, states the transformation/benefit, and ends with a CTA.
            - Keep it clear, specific, and human.
            - Suggest a one-liner caption to pin, highlighting the bio.
            - Format: { "bio": "Line 1\nLine 2\nLine 3", "pinned_caption": "Your one-liner here." }

            ---
            **PROMPT 3: Growth Strategist - Category & Audience Analysis**
            You are an Instagram growth strategist.
            1. Pick the best Instagram profile category (e.g., "Coach", "Community", "Personal Blog").
            2. Analyze the ideal audience: demographics, desires, pains, and emotional triggers.
            - Format: { "category": "Chosen Category", "audience_analysis": { "who_they_are": "...", "what_they_want": "...", "what_they_struggle_with": "...", "emotional_hooks": "..." } }

            ---
            **PROMPT 4: Content Strategist - Hashtag Strategy**
            You are an expert Instagram content strategist.
            Give 3 strategic, niche-specific hashtags that will attract the ideal audience.
            - Avoid hyper-generic tags. Focus on small to mid-sized, relevant tags.
            - Format: ["#hashtag1", "#hashtag2", "#hashtag3"]

            ---
            **FINAL INSTRUCTIONS:**
            Your response must be a single, valid JSON object with the keys "usernames", "profile", "strategy", and "hashtags".
            - "usernames": Array of objects.
            - "profile": Object.
            - "strategy": Object.
            - "hashtags": Array of strings.
            Do not add any extra text, comments, or markdown formatting. Just the raw JSON.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = await response.text();
        
        // Clean the response to ensure it's valid JSON
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            const jsonResponse = JSON.parse(cleanedText);
            res.status(200).json(jsonResponse);
        } catch (parseError) {
            console.error('Error parsing JSON response:', parseError);
            console.error('Raw AI response:', cleanedText);
            res.status(500).json({ error: 'Failed to parse AI response.', details: cleanedText });
        }

    } catch (error) {
        console.error('Error generating content:', error);
        res.status(500).json({ error: 'Failed to generate content from AI' });
    }
}

module.exports = handler;