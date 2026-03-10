import { prisma } from "@/lib/db";
import { supaBase } from "@/lib/supabase";


export async function deleteExpiredResumes() {
    const expiredResumes = await prisma.resume.findMany({
        where: {
            expiresAt: {
                lt: new Date(),
            },
        },
    });

    for (const resume of expiredResumes) {
        try {
            await supaBase.storage.from('JobtrackResumes').remove([resume.fileName]);

            await prisma.resume.delete({
                where: {
                    id: resume.id,
                },
            });
        } catch (err) {
            console.error("Failed to delete resume: ", resume.id, err)
        }

    }
}

