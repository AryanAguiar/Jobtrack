import { ResumeEvaluation } from "@/utils/types";
import { groq } from "./groq";
import crypto from "crypto";
import { groqRetry } from "@/utils/groqRetry";
import { prisma } from "./db";
import { calculateScore } from "./scorer";
import { apiLimiter } from "./rateLimiter";
import { ServiceError } from "@/utils/helpers";

const MODEL = "llama-3.1-8b-instant";
export async function evaluateResume(resumeText: string, jobText: string, userId: string): Promise<ResumeEvaluation> {

    const prompt = `
                You are evaluating a candidate's resume against a job description.

                INSTRUCTIONS:
                1. Extract ALL required skills from the job description as "requiredSkills".
                2. Extract ALL of the candidate's skills from the resume as "matchedSkills" — include EVERY skill the candidate has, even if it is not required by the job.
                3. NORMALIZE all skill names to lowercase (e.g., "Node.js" → "node.js", "Express.js" → "express").
                4. Treat synonyms and aliases as the SAME skill:
                   - "express" = "express.js" = "expressjs"
                   - "node" = "node.js" = "nodejs"
                   - "postgres" = "postgresql" = "pg"
                   - "mongo" = "mongodb"
                   - "js" = "javascript"
                   - "ts" = "typescript"
                5. For "requiredYears", extract the MINIMUM years of experience required. If the job says "3+ years", use 3. If no years mentioned, use 0.
                6. For "candidateYears", calculate total years from the candidate's work experience entries. If not clear, estimate from the resume context.
                7. For education fields, extract the HIGHEST level of education mentioned. Use ONLY these exact standardized values: "high school", "diploma", "bachelor degree", "master degree", "doctorate degree". (Map variations like B.Sc/B.A/BS to "bachelor degree", M.Sc/M.A/MS/MBA to "master degree", and PhD to "doctorate degree").
                8. The "summary" should be 2-3 sentences explaining the overall fit.
                9. "strengths" should list specific matching qualifications the candidate has.
                10. "gaps" should list ONLY specific missing requirements — do NOT list a gap if the candidate has the skill or an equivalent/synonym.
                11. Determine the PRIMARY job role category for both the job description and the candidate resume.

                IMPORTANT:
                The "requiredSkills" array must include EVERY technical skill, framework,
                language, database, tool, or technology mentioned in the job description.

                Examples:
                Languages: javascript, python, java
                Frameworks: react, angular, spring
                Databases: mysql, postgresql, mongodb
                DevOps: docker, kubernetes, aws, ci/cd
                Tools: git, jira

                Do NOT include soft skills like communication or teamwork.

                Use ONLY one of the following standardized categories:

                "software engineering"
                "data science"
                "sales"
                "marketing"
                "product management"
                "design"
                "finance"
                "operations"
                "customer support"
                "human resources"
                "other"

                Return them as:
                "jobRole"
                "candidateRole"
                
                Return ONLY valid JSON matching this exact structure:
                {
                  "requiredSkills": string[],
                  "matchedSkills": string[],
                  "requiredYears": number,
                  "candidateYears": number,
                  "requiredEducation": string,
                  "candidateEducation": string,
                  "summary": string,
                  "strengths": string[],
                  "gaps": string[],
                  "jobRole": string,
                  "candidateRole": string
                }

                RESUME:
                ${resumeText}

                JOB DESCRIPTION:
                ${jobText}
            `

    const promptHash = crypto.createHash("sha256").update(prompt).digest("hex");

    try {
        await apiLimiter.consume(userId);
    } catch (err: any) {
        throw new ServiceError("Too many requests. Please try again in 60 seconds.", 429);
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
        const scoringInput = {
            requiredSkills: parsed?.requiredSkills ?? [],
            matchedSkills: parsed?.matchedSkills ?? [],
            requiredYears: Number(parsed?.requiredYears ?? 0),
            candidateYears: Number(parsed?.candidateYears ?? 0),
            requiredEducation: parsed?.requiredEducation ?? "",
            candidateEducation: parsed?.candidateEducation ?? "",
            jobRole: parsed?.jobRole ?? "",
            candidateRole: parsed?.candidateRole ?? "",
        }

        const { finalScore, breakdown } = calculateScore(scoringInput)

        return {
            matchScore: finalScore,
            breakdown: breakdown,
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