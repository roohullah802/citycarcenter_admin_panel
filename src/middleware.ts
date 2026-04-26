import { clerkMiddleware, createRouteMatcher, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    const authObject = await auth()
    if (!authObject.userId) {
      return authObject.redirectToSignIn({ returnBackUrl: req.url })
    }

    const client = await clerkClient()
    const user = await client.users.getUser(authObject.userId)

    // Role check for admin
    if (user.publicMetadata?.role !== 'admin') {
      return NextResponse.redirect(new URL('/access-denied', req.url))
    }
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
