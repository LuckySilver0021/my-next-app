import { db } from "@/db";
import { files } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import {eq,and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest,props:{params:Promise<{fileId:string}>}) {
    try {
        const { userId } = await auth();
                if (!userId) {
                    return new NextResponse("Unauthorized", { status: 401 });
                }
        const { fileId } = await props.params;
        if(!fileId){
            return new NextResponse("File ID is required", { status: 400 });
        }

        const [starredFile] = await db.select().from(files).where(and(eq(files.id,fileId),eq(files.userId,userId)));
        if(!starredFile){
            return new NextResponse("File not found", { status: 404 });
        }

                // Toggle based on the current DB value we just read
                const updatedFile = await db.update(files)
                    .set({ isStarred: !starredFile.isStarred })
                    .where(and(eq(files.id, fileId), eq(files.userId, userId)))
                    .returning();

                const firstStarred = updatedFile[0];

                return NextResponse.json({ firstStarred });

    }catch(error){
        console.error("Fetching files error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}