import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { files } from "@/db/schema";

export async function POST(request: NextRequest) {
    try {
        const { isAuthenticated } = await auth();
        if (!isAuthenticated) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        const body = await request.json();
        const { imagekit, userId } = body;
        if (!imagekit || !imagekit.url) {
            return new NextResponse("Imvalid imagekit data", { status: 400 });
        }
        const fileData = {
            name: imagekit.name || "untitled",
            path: imagekit.filePath || `/droply/${userId}/${imagekit.name}`,
            size: imagekit.size || 0,
            type: imagekit.fileType || "unknown",
            fileurl: imagekit.url,
            userId: userId,
            thumbnailUrl: imagekit.thumbnailUrl || null,
            parentId: null,
            isFolder: false,
            isStarred: false,
            isTrash: false,
        }
        const [newFile] = await db.insert(files).values(fileData).returning();
        return NextResponse.json({ message: "File uploaded successfully", newFile });
    } catch (error) {
        console.error("File upload error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}