import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  matcher: [
    // Match all paths except API routes, static files, etc.
    '/((?!api|_next|_vercel|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\..*).*)',
  ],
}
