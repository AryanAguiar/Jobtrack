import { ScoreBreakdown, ScoreInput } from "@/utils/types";

const WEIGHTS = {
    skills: 0.5,
    experience: 0.3,
    education: 0.2,
}

function normalizedEducation(input: string) {
    const lower = input.toLowerCase().trim();
    if (lower.includes("bsc") || lower.includes("bachelor")) return "bachelor degree";
    if (lower.includes("msc") || lower.includes("master")) return "master degree";
    if (lower.includes("phd") || lower.includes("doctorate")) return "doctorate degree";
    if (lower.includes("diploma")) return "diploma";
    if (lower.includes("hsc")) return "high school";
    if (lower.includes("ssc")) return "secondary school";

    return lower;
}

export function calculateScore(input: ScoreInput): ScoreBreakdown {
    const { requiredSkills, matchedSkills, requiredYears, candidateYears, requiredEducation, candidateEducation } = input;
    let skillScore = 0;
    if (requiredSkills.length > 0) {
        const matches = requiredSkills.filter(skill =>
            matchedSkills.some(m => m.toLowerCase().includes(skill.toLowerCase()))
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
        const reqNorm = normalizedEducation(requiredEducation);
        const candNorm = normalizedEducation(candidateEducation);

        if (reqNorm === candNorm) {
            educationScore = 100;
        }
        else if (candNorm.includes(reqNorm) || reqNorm.includes(candNorm)) {
            educationScore = 85;
        }
        else if (candNorm === "doctorate degree" || candNorm === "master degree") {
            // Over-qualified is still good
            educationScore = 100;
        }
        else if (candNorm === "high school") {
            educationScore = 50;
        }
        else {
            educationScore = 10;
        }
    } else {
        educationScore = 100; // No requirement
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