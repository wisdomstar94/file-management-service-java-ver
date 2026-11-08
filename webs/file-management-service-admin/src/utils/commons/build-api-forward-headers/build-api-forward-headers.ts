import { buildApiForwardHeaders as buildHeaders } from "@fms/web-utils/requests/build-api-forward-headers";
import { webEnv } from "@/consts/web-env";

export function buildApiForwardHeaders(incoming: Headers, accessToken?: string): Headers {
  return buildHeaders(incoming, { trustedProxyHops: webEnv.trustedProxyHops, accessToken });
}
