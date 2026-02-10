import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

type Params = {
    params: Promise<{ id: string }>;
}

export async function GET(_: Request, { params }: Params) {
    const { id } = await params;
    const job = await prisma.job.findUnique({
        where: { id },
    });

    if (!job) {
        return NextResponse.json(
            { error: "Job not found" },
            { status: 404 }
        );
    }

    return NextResponse.json(job, { status: 200 });
}

export async function DELETE(_: Request, { params }: Params) {
    const { id } = await params;
    const job = await prisma.job.delete({ where: { id } });

    if (!job) {
        return NextResponse.json(
            { error: "Job not found" },
            { status: 404 }
        );
    }

    return NextResponse.json(job, { status: 200 });
}

export async function PATCH(request: Request, { params }: Params) {
    const { id } = await params;
    const body = await request.json();

    const { title, company, location, status } = body;

    if (
        title === undefined &&
        company === undefined &&
        location === undefined &&
        status === undefined
    ) {
        return NextResponse.json({ error: "No fields provided for update" }, { status: 400 })
    }

    try {
        const job = await prisma.job.update({
            where: { id },
            data: {
                ...(title !== undefined && { title }),
                ...(company !== undefined && { company }),
                ...(location !== undefined && { location }),
                ...(status !== undefined && { status }),
            }
        });

        return NextResponse.json(job, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
}