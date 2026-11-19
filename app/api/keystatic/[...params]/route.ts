import { makeRouteHandler } from '@keystatic/next/route-handler';
import config from '../../../../keystatic.config';

/*
 * Created on the first request rather than at import time: in GitHub mode Keystatic checks for the
 * GitHub App secrets when the handler is made, and doing that during `next build` would fail the
 * whole deploy if the secrets aren't set yet. This way the site always builds, and the admin shows
 * the error until the env vars are added (see README).
 */
let handler: ReturnType<typeof makeRouteHandler> | undefined;
const getHandler = () => (handler ??= makeRouteHandler({ config }));

export const dynamic = 'force-dynamic';

export function GET(request: Request) {
  return getHandler().GET(request);
}

export function POST(request: Request) {
  return getHandler().POST(request);
}
