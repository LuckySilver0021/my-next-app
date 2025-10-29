import { files } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";

import { NextResponse, NextRequest } from "next/server";
import { db } from "@/db";
import { eq , and} from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";


export async function POST(request: NextRequest) {
    try{
        const {isAuthenticated}=await auth();
        if(!isAuthenticated){
            return new NextResponse("Unauthorized",{status:401});
        }
        const body=await request.json();
        const {name,parentId=null,userId}=body;

        if(!name || typeof name!=="string" || name.trim().length===0){
            return new NextResponse("Invalid folder name",{status:400});
        }
        if (parentId) {
    const [parent] = await db
        .select()
        .from(files)
        .where(
            and(
                eq(files.id, parentId),
                eq(files.userId, userId),
                eq(files.isFolder, true)
            )
        );
        if (!parent) {
            return new NextResponse("Parent folder not found", { status: 404 });
        }
}
        const folderData={
            id:uuidv4(),
            name:name.trim(),
            path:`/folders/${userId}/${uuidv4()}`,
            size:0,
            type:"folder",
            fileurl:"",
            thumbnailUrl:null,
            userId:userId,
            parentId:parentId,
            isFolder:true,
            isStarred:false,
            isTrash:false,
        }
        const [newFolder]=await db.insert(files).values(folderData).returning();
        return NextResponse.json({message:"Folder created successfully",newFolder});
    }
    catch(error){
        console.error("Folder creation error:",error);
        return new NextResponse("Internal Server Error",{status:500});
    }
}