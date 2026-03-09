import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse/lib/pdf-parse.js';
import mammoth from 'mammoth';

interface ParsedResult {
    text: string;
    keywords: string[];
    skills: string[];
    experience: string[];
    education: string[];
    isResume: boolean;
}

async function extractText(buffer: Buffer, fileName: string): Promise<string> {
    const ext = path.extname(fileName).toLowerCase();

    if (ext === '.pdf') {
        const pdfData = await pdf(buffer);
        return pdfData.text;
    } else if (ext === '.docx' || ext === '.doc') {
        const result = await mammoth.extractRawText({ buffer: buffer });
        return result.value;
    } else {
        throw new Error(`Unsupported file type: ${ext}`);
    }
}

export async function parsePdf(buffer: Buffer, fileName: string): Promise<ParsedResult> {
    const text = await extractText(buffer, fileName);

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

    const months = '(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\\.?';

    const dateRange = new RegExp(
        `(?:${months}\\s+)?(?:19|20)\\d{2}\\s*(?:[-–—]|to)\\s*(?:(?:${months}\\s+)?(?:19|20)\\d{2}|present|current|now|ongoing)`,
        'i'
    );

    const lines = text.split(/\n/);
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && trimmed.length < 300 && dateRange.test(trimmed)) {
            const cleaned = trimmed
                .replace(/[❖•◆◇►▸▹▪▫★☆✦✧■□▶●○→✓✔‣⁃∙]/g, '')
                .replace(/\s{2,}/g, ' ')
                .trim();
            if (cleaned && !experience.includes(cleaned)) {
                experience.push(cleaned);
            }
        }
    }

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

    const resumeSectionKeywords = [
        "experience", "employment", "work history", "career",
        "education", "academic", "degree", "university", "college",
        "skills", "technologies", "proficiencies",
        "projects", "portfolio",
        "summary", "objective", "profile", "about me",
        "certifications", "achievements", "awards"
    ];

    let sectionMatchCount = 0;
    for (const keyword of resumeSectionKeywords) {
        if (lowerText.includes(keyword)) {
            sectionMatchCount++;
        }
    }

    const isResume = sectionMatchCount >= 2;

    return {
        text,
        keywords,
        skills,
        experience,
        education,
        isResume
    };
}
