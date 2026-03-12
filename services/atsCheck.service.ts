import { checkAtsFriendliness } from "@/lib/atsFriendlyCheck";
import { prisma } from "@/lib/db";
import { ServiceError } from "@/utils/helpers";

export async function atsChecker(userId: string, resumeId: string) {
    const resume = await prisma.resume.findFirst({
        where: {
            id: resumeId,
            userId
        },
        include: { parsedData: true }
    });

    if (!resume) {
        throw new ServiceError("Resume not found", 404);
    }

    if (!resume.parsedData || !resume.parsedData.rawText) {
        throw new ServiceError("Resume has no parsed text data.", 400);
    }

    const friendlyCheck = await checkAtsFriendliness(resume.parsedData.rawText, userId);

    await prisma.resume.update({
        where: { id: resumeId },
        data: {
            atsScore: friendlyCheck as any
        }
    });

    return friendlyCheck;
}