const ImageKit = require("imagekit");
import { auth } from "@clerk/nextjs/server";
import { getUploadAuthParams } from "@imagekit/next/server"
import { NextResponse } from "next/server";
const imagekit = new ImageKit({
    publicKey : process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
    privateKey : process.env.IMAGEKIT_PRIVATE_KEY || "",
    urlEndpoint : process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || ""
});
 
// 

export async function GET() {
    const {isAuthenticated}=await auth();
    if(!isAuthenticated){
        return new NextResponse("Unauthorized",{status:401});
    }
    const { token, expire, signature } = getUploadAuthParams({
        privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string, // Never expose this on client side
        publicKey: process.env.IMAGEKIT_PUBLIC_KEY as string,
        // expire: 30 * 60, // Optional, controls the expiry time of the token in seconds, maximum 1 hour in the future
        // token: "random-token", // Optional, a unique token for request
    })

    return NextResponse.json({ token, expire, signature, publicKey: process.env.IMAGEKIT_PUBLIC_KEY })
}

