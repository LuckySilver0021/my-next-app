import { clerkMiddleware,createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute=createRouteMatcher([
  '/','/signin(.*)','/signup(.*)'
])

export default clerkMiddleware(async (auth, req) => {
  const {isAuthenticated}=await auth();
  const newUrl=new URL(req.url);
  if(isAuthenticated && isPublicRoute(req) && newUrl.pathname!=="/"){
    return Response.redirect(new URL('/dashbaord',req.url));
  }


  if(!isPublicRoute(req)){
    await auth.protect();
  }

})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}