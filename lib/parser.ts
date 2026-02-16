import fs from 'fs';
// Import from lib directly to avoid the known bug in pdf-parse's index.js
// that tries to read a test PDF file at import time
import pdf from 'pdf-parse/lib/pdf-parse.js';

interface ParsedResult {
    text: string;
    keywords: string[];
    skills: string[];
    experience: string[];
    education: string[];
}

export async function parsePdf(filePath: string): Promise<ParsedResult> {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdf(dataBuffer);
    const text = pdfData.text;

    const lowerText = text.toLowerCase();
    const keywords: string[] = [];
    const skills: string[] = [];
    const experience: string[] = [];
    const education: string[] = [];

    const skillList = ['react', 'next.js', 'node.js', 'typescript', 'javascript', 'html', 'css', 'tailwind', 'prisma', 'mongodb', 'express', 'python', 'java', 'c++', 'c', 'sql', 'git', 'github', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'redux', 'context api', 'jest', 'cypress', 'testing', 'debugging', 'problem solving', 'teamwork', 'communication', 'leadership', 'management', 'project management', 'agile', 'scrum', 'waterfall', 'devops', 'ci/cd', 'jenkins', 'gitlab', 'github actions'];

    skillList.forEach(skill => {
        if (lowerText.includes(skill)) {
            skills.push(skill);
        }
    });

    // --- Experience extraction ---
    const months = '(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\\.?';

    // Matches: "November 2024 – Current", "Feb 2020 - March 2022", "2019 - 2021"
    const dateRange = new RegExp(
        `(?:${months}\\s+)?(?:19|20)\\d{2}\\s*(?:[-–—]|to)\\s*(?:(?:${months}\\s+)?(?:19|20)\\d{2}|present|current|now|ongoing)`,
        'i'
    );

    // Extract full lines containing a date range (job entries)
    const lines = text.split(/\n/);
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && trimmed.length < 300 && dateRange.test(trimmed)) {
            // Clean special symbols from the entry
            const cleaned = trimmed
                .replace(/[❖•◆◇►▸▹▪▫★☆✦✧■□▶●○→✓✔‣⁃∙]/g, '')
                .replace(/\s{2,}/g, ' ')
                .trim();
            if (cleaned && !experience.includes(cleaned)) {
                experience.push(cleaned);
            }
        }
    }

    // Also capture duration mentions like "5+ years of experience"
    const durationMatches = text.match(/\d+(\.\d+)?\+?\s*(years?|yrs?)\s*(?:of\s+)?(?:experience|exp)?/gi);
    if (durationMatches) {
        durationMatches.forEach(match => {
            const cleaned = match.trim();
            if (!experience.includes(cleaned)) {
                experience.push(cleaned);
            }
        });
    }

    const eduKeywords = ["bsc", "msc", "bachelor", "master", "phd", "diploma", "hsc", "ssc"];
    eduKeywords.forEach(edu => {
        if (lowerText.includes(edu)) education.push(edu);
    });

    keywords.push(...skills);

    return {
        text,
        keywords,
        skills,
        experience,
        education
    };
}
