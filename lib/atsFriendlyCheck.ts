import crypto from "crypto";
import { groq } from "./groq";
import { groqRetry } from "@/utils/groqRetry";
import { rateLimiterAts } from "./rateLimiter";
import { ServiceError } from "@/utils/helpers";
import { prisma } from "./db";

const MODEL = "llama-3.1-8b-instant";

export interface AtsCheckResult {
    score: number;
    breakdown: {
        structure: number;
        content: number;
    };
    summary: string;
    improvements: string[];
}

export async function checkAtsFriendliness(resumeText: string, userId: string): Promise<AtsCheckResult> {
    const prompt = `
        You are an expert ATS (Applicant Tracking System) optimization assistant.
        Evaluate the following resume text for ATS friendliness and return a JSON object with your findings.

        INSTRUCTIONS:
        1. "score": Overall ATS friendliness score out of 100.
        2. "breakdown": An object with "structure" (score out of 50) and "content" (score out of 50).
            - Structure: Presence of standard sections (Experience, Education, Skills), contact info length/presence, clear headings.
            - Content: Use of action verbs, keywords, quantifiable metrics, and lack of formatting artifacts (like weird characters).
        3. "summary": A 2-3 sentence summary of how well the resume is optimized for ATS.
        4. "improvements": An array of specific, actionable strings on how to improve the resume for ATS parsers.

        Return ONLY valid JSON matching this exact structure:
        {
          "score": number,
          "breakdown": {
            "structure": number,
            "content": number
          },
          "summary": string,
          "improvements": string[]
        }

        RESUME:
        ${resumeText}
    `;

    const promptHash = crypto.createHash("sha256").update(prompt).digest("hex");

    try {
        await rateLimiterAts.consume(userId);
    } catch (err: any) {
        throw new ServiceError("Too many ATS check requests. Please try again later.", 429);
    }

    try {
        const completion = await groqRetry(() => groq.chat.completions.create({
            model: MODEL,
            temperature: 0.2,
            response_format: {
                type: "json_object"
            },
            messages: [
                {
                    role: "system",
                    content: "You are a professional ATS resume evaluator. Return STRICT JSON only."
                },
                {
                    role: "user",
                    content: prompt,
                }
            ]
        }), 2, 100);

        if (completion.choices[0]?.message?.content === "") {
            throw new Error("Empty response from AI model");
        }

        const raw = completion.choices[0]?.message?.content || "{}";
        let parsed: any;
        try {
            parsed = JSON.parse(raw);
        } catch (e) {
            console.error("Failed to parse JSON response:", raw);
            throw new Error("Invalid JSON response from AI model");
        }

        return {
            score: Number(parsed?.score ?? 0),
            breakdown: {
                structure: Number(parsed?.breakdown?.structure ?? 0),
                content: Number(parsed?.breakdown?.content ?? 0),
            },
            summary: parsed?.summary ?? "",
            improvements: Array.isArray(parsed?.improvements) ? parsed.improvements : [],
        };

    } catch (error) {
        console.error("Failed to check ATS friendliness:", error);
        
        try {
            await prisma.groqFailures.create({
                data: {
                    reason: (error as Error)?.message || "Unknown error in ATS check",
                    promptHash,
                    modelUsed: MODEL,
                }
            });
        } catch (dbErr) {
            console.error("Failed to log Groq failure to DB:", dbErr);
        }

        throw new Error("Failed to evaluate ATS friendliness");
    }
}