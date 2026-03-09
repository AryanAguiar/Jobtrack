import { ScoreBreakdown, ScoreInput } from "@/utils/types";

const WEIGHTS = {
    skills: 0.5,
    experience: 0.3,
    education: 0.2,
}

// Skill alias groups
const SKILL_ALIASES: Record<string, string[]> = {
    "javascript": ["js", "javascript", "ecmascript"],
    "typescript": ["ts", "typescript"],
    "node.js": ["node", "nodejs", "node.js"],
    "express": ["express", "expressjs", "express.js"],
    "react": ["react", "reactjs", "react.js"],
    "mongodb": ["mongodb", "mongo"],
    "postgresql": ["postgresql", "postgres", "pg"],
    "mysql": ["mysql"],
    "docker": ["docker", "containerization"],
    "aws": ["aws", "amazon web services"],
    "git": ["git", "github", "version control"],
    "ci/cd": ["ci/cd", "cicd", "ci cd", "continuous integration", "continuous deployment"],
    "devops": ["devops", "dev ops"],
    "python": ["python"],
    "java": ["java"],
    "spring boot": ["spring boot", "springboot", "spring"],
    "sql": ["sql", "structured query language"],
    "agile": ["agile", "scrum", "kanban"],
    "redis": ["redis"],
    "kafka": ["kafka"],
    "rabbitmq": ["rabbitmq", "rabbit mq", "message queue"],
    "kubernetes": ["kubernetes", "k8s"],
    "c#": ["c#", "csharp", "c sharp"],
    "c++": ["c++", "cpp"],
    "c": ["c language", "c programming"],
};

// Education hierarchy
const EDUCATION_LEVELS: Record<string, number> = {
    "secondary school": 1,
    "high school": 2,
    "diploma": 3,
    "bachelor degree": 4,
    "master degree": 5,
    "doctorate degree": 6,
};

function normalizeSkill(skill: string): string {
    return skill.toLowerCase().trim().replace(/[.\-_]/g, "");
}

function skillsMatch(required: string, candidate: string): boolean {
    const reqNorm = normalizeSkill(required);
    const candNorm = normalizeSkill(candidate);

    // Prevent empty string matches
    if (!reqNorm || !candNorm) return false;

    // Direct match
    if (reqNorm === candNorm) return true;

    // Substring match  
    if (reqNorm.includes(candNorm) || candNorm.includes(reqNorm)) return true;

    // Alias group match
    for (const [, aliases] of Object.entries(SKILL_ALIASES)) {
        const normalizedAliases = aliases.map(normalizeSkill);
        const reqInGroup = normalizedAliases.some(a => a === reqNorm || reqNorm.includes(a) || a.includes(reqNorm));
        const candInGroup = normalizedAliases.some(a => a === candNorm || candNorm.includes(a) || a.includes(candNorm));
        if (reqInGroup && candInGroup) return true;
    }

    return false;
}

function normalizeEducation(input: string): string {
    const lower = input.toLowerCase().trim();
    if (/bachelor|b\.\s*sc|bsc|\bb\.?s\.?\b|\bb\.?a\.?\b|b\.\s*tech|btech|b\.\s*e\./i.test(lower)) return "bachelor degree";
    if (/master|m\.\s*sc|msc|\bm\.?s\.?\b|\bm\.?a\.?\b|mba|m\.\s*tech|mtech|m\.\s*e\./i.test(lower)) return "master degree";
    if (/doctorate|ph\.\s*d|phd/i.test(lower)) return "doctorate degree";
    if (lower.includes("diploma")) return "diploma";
    if (/high school|12th|hsc/i.test(lower)) return "high school";
    if (/secondary school|10th|ssc/i.test(lower)) return "secondary school";

    return lower;
}

export function calculateScore(input: ScoreInput): ScoreBreakdown {
    const { requiredSkills, matchedSkills, requiredYears, candidateYears, requiredEducation, candidateEducation } = input;

    let skillScore = 0;
    if (requiredSkills.length > 0) {
        const matches = requiredSkills.filter(skill =>
            matchedSkills.some(m => skillsMatch(skill, m))
        ).length;
        skillScore = (matches / requiredSkills.length) * 100;
    }

    let experienceScore = 0;
    if (requiredYears > 0) {
        experienceScore = Math.min(100, (candidateYears / requiredYears) * 100);
    } else if (candidateYears > 0) {
        experienceScore = 100;
    }

    let educationScore = 0;
    if (requiredEducation) {
        const reqNorm = normalizeEducation(requiredEducation);
        const candNorm = normalizeEducation(candidateEducation);

        const reqLevel = EDUCATION_LEVELS[reqNorm] ?? 0;
        const candLevel = EDUCATION_LEVELS[candNorm] ?? 0;

        if (reqLevel === 0 || candLevel === 0) {

            if (reqNorm === candNorm && reqNorm !== "") {
                educationScore = 100;
            } else if (candNorm && reqNorm && (candNorm.includes(reqNorm) || reqNorm.includes(candNorm))) {
                educationScore = 85;
            } else if (candNorm === "" && reqNorm !== "") {
                educationScore = 0;
            } else {
                educationScore = 50;
            }
        } else if (candLevel >= reqLevel) {
            educationScore = 100;
        } else if (candLevel === reqLevel - 1) {
            educationScore = 70;
        } else {
            educationScore = 40;
        }
    } else if (!requiredEducation) {
        educationScore = candidateEducation ? 100 : 0;
    }

    const finalScore = (skillScore * WEIGHTS.skills) + (experienceScore * WEIGHTS.experience) + (educationScore * WEIGHTS.education);
    return {
        breakdown: {
            skills: skillScore,
            experience: experienceScore,
            education: educationScore,
        },
        finalScore: Math.round(finalScore),
    };
}