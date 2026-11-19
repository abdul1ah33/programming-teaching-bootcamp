import { NextResponse, type NextRequest } from 'next/server';
import { isAuthorized } from '@/lib/basic-auth';

/**
 * Optional site-wide password (HTTP Basic Auth).
 * Active only when the SITE_PASSWORD env var is set. Any username is accepted.
 */
export function proxy(request: NextRequest) {
  const password = process.env.SITE_PASSWORD;
  if (!password) return NextResponse.next();

  if (isAuthorized(request.headers.get('authorization'), password)) {
    return NextResponse.next();
  }

  return new NextResponse('Password required.', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Learning Journey", charset="UTF-8"' },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg).*)'],
};
