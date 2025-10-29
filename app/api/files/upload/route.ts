import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { files } from "@/db/schema";

import {and,eq} from "drizzle-orm";
import ImageKit from "imagekit";
import { v4 as uuidv4 } from "uuid";
export const runtime = "nodejs";


const imagekit = new ImageKit({
    publicKey : process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
    privateKey : process.env.IMAGEKIT_PRIVATE_KEY || "",
    urlEndpoint : process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || ""
});


export async function POST(request: NextRequest) {
    try {
        console.log("🟢 /api/files/upload route hit");
        // Quick environment validation to catch misconfiguration early
        if (!process.env.IMAGEKIT_PRIVATE_KEY || !process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || !process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY) {
            console.error('ImageKit environment variables are missing');
            return NextResponse.json({ message: 'Image service not configured on the server' }, { status: 500 });
        }
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const file = formData.get("file");
        if (!file || !(file instanceof Blob)) {
            return NextResponse.json(
                { message: "No valid file provided" },
                { status: 400 }
            );
        }

        const formUserId = formData.get("userId") as string | null;
        const parentId = (formData.get("parentId") as string) || null;

        if (formUserId !== userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

                // Only validate parent folder if parentId is provided
                if (parentId) {
                    const [parentFolder] = await db.select().from(files).where(
                        and(
                            eq(files.id, parentId),
                            eq(files.userId, userId),
                            eq(files.isFolder, true)
                        )
                    );
                    
                    if (!parentFolder) {
                        return NextResponse.json(
                            { message: "Parent folder not found" },
                            { status: 400 }
                        );
                    }
                }

        const contentType = (file as any).type || "";
        if (!contentType.startsWith("image/") && contentType !== "application/pdf") {
            return NextResponse.json(
                { message: "Only images and PDFs are allowed" },
                { status: 400 }
            );
        }

        // Convert the file to buffer
        const buffer = await (file as Blob).arrayBuffer();
        const fileBuffer = Buffer.from(buffer);

        // Create the folder path
        const folderPath = parentId
            ? `/droply/${userId}/folders/${parentId}`
            : `/droply/${userId}`;

        // Generate unique filename and size safely
        const originalFileName = (file as any).name || `upload-${uuidv4()}`;
        const fileExtension = originalFileName.split('.').pop() || "";
        const uniqueFileName = `${uuidv4()}.${fileExtension}`;
        const fileSize = Number((file as any).size) || 0;


                const uploadRes = await imagekit.upload({
                    file: fileBuffer,
                    fileName: uniqueFileName,
                    folder: folderPath,
                    useUniqueFileName: false,
                });

                if (!uploadRes || !uploadRes.url) {
                    throw new Error('ImageKit upload failed');
                }

                const fileData = {
                    name: originalFileName,
                    path: uploadRes.filePath,
                    size: fileSize,
                    type: contentType,
                    fileurl: uploadRes.url,
                    thumbnailUrl: uploadRes.thumbnailUrl || null,
                    userId: userId,
                    parentId: parentId,
                    isFolder: false,
                    isStarred: false,
                    isTrash: false,
                };

                const [newFile]=await db.insert(files).values(fileData).returning();
                return NextResponse.json({ message: "File uploaded successfully" , newFile });
                
    } catch (err: any) {
        console.error("File upload error:", err);

        // Check for specific error types
        if (err.message?.includes('ImageKit')) {
            return NextResponse.json({
                message: "Failed to upload to image service. Please try again.",
                error: process.env.NODE_ENV === 'development' ? err.stack : undefined
            }, { status: 500 });
        }

        if (err.message?.includes('database')) {
            return NextResponse.json({
                message: "Failed to save file information. Please try again.",
                error: process.env.NODE_ENV === 'development' ? err.stack : undefined
            }, { status: 500 });
        }

        // Generic error
        return NextResponse.json({
            message: "An unexpected error occurred while uploading the file.",
            error: process.env.NODE_ENV === 'development' ? err.stack : undefined
        }, { status: 500 });
    }
}