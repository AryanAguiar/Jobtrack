import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

export async function POST(request: Request) {
    const user = await getAuthUser(request);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, company, location, status, description, notes } = body;
    if (!title || !company || !location || !status) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const job = await prisma.job.create({
        data: {
            title,
            company,
            location,
            status,
            description,
            notes,
            userId: user.id
        },
    });
    return NextResponse.json(job, { status: 201 });
}

export async function GET(request: Request) {
    const user = await getAuthUser(request);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);

    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
        prisma.job.findMany({
            where: {
                userId: user.id
            },
            skip,
            take: limit,
            orderBy: { createdAt: "desc" }
        }),
        prisma.job.count({
            where: {
                userId: user.id
            }
        })
    ]);
    return NextResponse.json({
        data: jobs,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        },
    }, { status: 200 });
}

