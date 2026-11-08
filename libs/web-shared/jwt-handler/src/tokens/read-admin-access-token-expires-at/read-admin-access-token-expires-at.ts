import { ADMIN_ACCESS_TOKEN_AUDIENCE } from "@fms/consts/jwt/jwt-audiences";
import { verifyJwt } from "../verify-jwt/index.js";

/** 유효하면 만료 시각을, 아니면 `null` 을 반환합니다. 관리자 웹 서버가 만료 전에 미리 갱신할지 판단할 때 씁니다. */
export async function readAdminAccessTokenExpiresAt(props: { token: string; secret: string }): Promise<Date | null> {
  const payload = await verifyJwt({ token: props.token, audience: ADMIN_ACCESS_TOKEN_AUDIENCE, secret: props.secret });
  return typeof payload?.exp === "number" ? new Date(payload.exp * 1000) : null;
}
