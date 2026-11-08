import type { Response } from "supertest";
import { readSetCookie } from "../read-set-cookie";

/** 로그인 응답은 토큰을 본문 대신 쿠키로 내려준다. */
export function readLoginTokens(res: Response): { accessToken: string; refreshToken: string } {
  return {
    accessToken: readSetCookie(res, "fms_admin_at") ?? "",
    refreshToken: readSetCookie(res, "fms_admin_rt") ?? "",
  };
}
