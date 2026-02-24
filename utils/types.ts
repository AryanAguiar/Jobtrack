export interface JwtPayload {
    id: string;
}

export interface ResumeEvaluation {
    matchScore: number;
    summary: string;
    breakdown: {
        skills: number
        experience: number
        education: number
    };
    strengths: string[];
    gaps: string[];
    modelUsed: string;
    promptHash: string;
}
export interface ScoreInput {
    requiredSkills: string[]
    matchedSkills: string[]
    requiredYears: number
    candidateYears: number
    requiredEducation: string
    candidateEducation: string
}

export interface ScoreBreakdown {
    finalScore: number
    breakdown: {
        skills: number
        experience: number
        education: number
    }
}
