/** 다운로드에 실패하면 api 가 `downloadError` · `timestamp` 쿼리를 붙여 이 화면으로 돌려보낸다. */
export const readQueryValue = (value: string | string[] | undefined) => (typeof value === "string" ? value : undefined);
