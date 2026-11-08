export type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ApiQueryValue = string | number | boolean | null | undefined | readonly (string | number | boolean)[];

/**
 * api 하나를 호출하는 데 필요한 정보. `as const satisfies ApiSchema` 로 선언한다.
 *
 * `request` · `response` 의 값은 의미가 없고 타입만 쓴다. `typeOf<T>()` 로 채운다.
 */
export type ApiSchema = {
  /** 경로 변수는 `:name` 으로 적는다. baseUrl 은 호출하는 쪽이 붙인다. */
  readonly url: string;
  readonly method: ApiMethod;
  readonly request: {
    readonly params: Readonly<Record<string, string>> | undefined;
    readonly headers: Readonly<Record<string, string>> | undefined;
    readonly body: unknown;
    readonly query: Readonly<Record<string, ApiQueryValue>> | undefined;
  };
  /** 실제 응답 본문 타입. `{ data }` 봉투를 포함한다. 본문이 없는 204 는 `null` */
  readonly response: unknown;
  /** `stream` 이면 응답 본문을 해석하지 않고 `Response` 를 그대로 돌려준다. 기본 `json` */
  readonly responseType?: "json" | "stream";
  /** api 를 묶어 보기 위한 분류 */
  readonly tags: readonly string[];
};

/** schema 에 타입만 싣기 위한 헬퍼. 값은 항상 `undefined` 이다. */
export function typeOf<T>(): T {
  return undefined as T;
}
