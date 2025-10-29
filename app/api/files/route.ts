import { db } from "@/db";
import { files } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import {eq,and ,isNull} from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest) {
    try {
        const { isAuthenticated, userId } = await auth();
        if (!isAuthenticated) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        const searchParams=request.nextUrl.searchParams;
        const qUserId=searchParams.get("userId");
        const parentId=searchParams.get("parentId");

        if(!qUserId || qUserId!==userId){
            return new NextResponse("Bad Request: Missing userId", { status: 400 });
        }
        let UserFiles;
        if(parentId){
            UserFiles = await db.select().from(files).where(and(eq(files.userId, userId),eq(files.parentId,parentId)));
        }else{
            UserFiles = await db.select().from(files).where(and(eq(files.userId, userId),isNull(files.parentId)));
        }

        return NextResponse.json({ files: UserFiles });
    }catch (error) {
        console.error("Fetching files error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}