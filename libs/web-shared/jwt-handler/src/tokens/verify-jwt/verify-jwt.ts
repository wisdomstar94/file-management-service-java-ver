import { type JWTPayload, jwtVerify } from "jose";

/** 서명 · 만료 · 용도(`audience`)를 검증합니다. 하나라도 맞지 않으면 `null` 입니다. */
export async function verifyJwt<TPayload extends JWTPayload>(props: {
  token: string;
  audience: string;
  secret: string;
}): Promise<(TPayload & { sub: string }) | null> {
  const { token, audience, secret } = props;
  try {
    const { payload } = await jwtVerify<TPayload>(token, new TextEncoder().encode(secret), {
      audience,
      algorithms: ["HS256"],
    });
    if (typeof payload.sub !== "string") {
      return null;
    }
    return payload as TPayload & { sub: string };
  } catch {
    return null;
  }
}
