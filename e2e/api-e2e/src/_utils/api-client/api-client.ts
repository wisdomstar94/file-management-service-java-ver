import request from "supertest";
import { API_BASE_URL } from "./_consts/api-base-url";

/** 테스트 러너 → api 요청. `ip` 를 주면 X-Forwarded-For 로 요청 IP 를 바꾼다(api 의 trust proxy 가 러너를 신뢰해야 함). */
export function api(props: { token?: string; ip?: string; headers?: Record<string, string> } = {}) {
  const agent = request(API_BASE_URL);
  const decorate = (test: request.Test) => {
    if (props.token) {
      test.set("Authorization", `Bearer ${props.token}`);
    }
    if (props.ip) {
      test.set("X-Forwarded-For", props.ip);
    }
    for (const [name, value] of Object.entries(props.headers ?? {})) {
      test.set(name, value);
    }
    return test;
  };

  return {
    get: (url: string) => decorate(agent.get(url)),
    post: (url: string) => decorate(agent.post(url)),
    patch: (url: string) => decorate(agent.patch(url)),
    delete: (url: string) => decorate(agent.delete(url)),
  };
}
