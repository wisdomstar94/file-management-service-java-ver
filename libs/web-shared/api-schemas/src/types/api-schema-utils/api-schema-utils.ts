import type { ApiSchema } from "../api-schema/index.js";

export type ReqParams<S extends ApiSchema> = S["request"]["params"];

export type ReqQuery<S extends ApiSchema> = S["request"]["query"];

export type ReqHeader<S extends ApiSchema> = S["request"]["headers"];

export type ReqBody<S extends ApiSchema> = S["request"]["body"];

export type ResBody<S extends ApiSchema> = S["response"];

/** 값이 없거나 모든 필드가 선택이면 생략할 수 있다. */
type IsOmittable<T> = undefined extends T ? true : Partial<T> extends T ? true : false;

/** wrapper 가 받는 요청 인자. schema 에서 `undefined` 로 선언한 항목은 생략한다. */
export type ApiRequest<S extends ApiSchema> = {
  [K in keyof S["request"] as IsOmittable<S["request"][K]> extends true ? never : K]: S["request"][K];
} & {
  [K in keyof S["request"] as IsOmittable<S["request"][K]> extends true ? K : never]?: S["request"][K];
};
