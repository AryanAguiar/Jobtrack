export interface JwtPayload {
    id: string;
}

export interface ResumeEvaluation {
    matchScore: number;
    summary: string;
    strengths: string[];
    gaps: string[];
    modelUsed: string;
    promptHash: string;
}