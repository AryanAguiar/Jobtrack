import crypto from "crypto";

export function hashText(input: string) {
    return crypto.createHash("sha256").update(input).digest("hex");
}

export function normalizeText(input: string) {
    return input.toLowerCase().replace(/\s+/g, " ").trim();
}

export class ServiceError extends Error {
    status: number;
    constructor(message: string, status: number) {
        super(message);
        this.name = "ServiceError";
        this.status = status;
    }
}

export function normalizeSkills(skills: string[]) {
    return skills.map(skill => skill.toLowerCase().trim());
}