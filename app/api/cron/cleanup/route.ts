import { deleteExpiredResumes } from "@/utils/dbCleaner";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    await deleteExpiredResumes();

    return Response.json({ success: true });
}
