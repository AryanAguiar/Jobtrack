import { ResumeEvaluation } from "@/utils/types";
import { groq } from "./groq";
import crypto from "crypto";
import { groqRetry } from "@/utils/groqRetry";
import { prisma } from "./db";

const MODEL = "llama-3.1-8b-instant";
export async function evaluateResume(resumeText: string, jobText: string): Promise<ResumeEvaluation> {

    const prompt = `
                Evaluate this resume against the job description.

                Return ONLY valid JSON:

                {
                "matchScore": integer (0-100),
                "summary": string,
                "strengths": string[],
                "gaps": string[]
                }

                RESUME:
                ${resumeText}

                JOB DESCRIPTION:
                ${jobText}
            `

    const promptHash = crypto.createHash("sha256").update(prompt).digest("hex");
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
        let score = Number(parsed?.matchScore ?? 0);
        score = Math.max(0, Math.min(100, score));

        return {
            matchScore: score,
            summary: parsed?.summary ?? "",
            strengths: Array.isArray(parsed?.strengths) ? parsed.strengths : [],
            gaps: Array.isArray(parsed?.gaps) ? parsed.gaps : [],
            modelUsed: MODEL,
            promptHash,
        };
    }
    catch (error) {
        console.error("Failed to evaluate resume:", error);

        try {
            await prisma.groqFailures.create({
                data: {
                    reason: (error as Error)?.message || "Unknown error",
                    promptHash,
                    modelUsed: MODEL,
                }
            });
        } catch (dbErr) {
            console.error("Failed to log Groq failure to DB:", dbErr);
        }

        throw new Error("Failed to evaluate resume");
    }
}