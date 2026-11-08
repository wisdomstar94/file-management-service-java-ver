"use client";

import { ADMIN_LOGIN_API } from "@fms/api-schemas/schemas/admin-auth-api-schemas";
import { API_ERROR_CODE } from "@fms/consts/errors/api-error-code";
import { isCommonError } from "@fms/error-provider/errors/is-common-error";
import { BrandMark } from "@fms/web-ui/components/brand-mark";
import { Button } from "@fms/web-ui/components/button";
import { TextInput } from "@fms/web-ui/components/text-input";
import { useRouter } from "next/navigation";
import { type SubmitEvent, useState } from "react";
import { FormField } from "@/components/commons/form-field";
import { DEFAULT_ERROR_MESSAGE } from "@/consts/default-error-message";
import { usePublicEnv } from "@/providers/public-env-provider";
import { createOtherCommonError } from "@/utils/commons/create-other-common-error";
import { readCommonErrorMessage } from "@/utils/commons/read-common-error-message";
import { fetchClientWrapper } from "@/wrappers/fetch-client-wrapper";

export function LoginForm(props: { nextPath: string }) {
  const router = useRouter();
  const { apiPublicUrl } = usePublicEnv();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setIsPending(true);
    setErrorMessage(null);
    // 토큰은 api 가 httpOnly 쿠키로 심고, 이후 관리자 웹 서버가 그 쿠키를 읽는다.
    const result = await fetchClientWrapper(
      ADMIN_LOGIN_API,
      { body: { loginId: String(form.get("loginId") ?? ""), password: String(form.get("password") ?? "") } },
      { baseUrl: apiPublicUrl, credentials: "include" },
    ).catch((error: unknown) =>
      isCommonError(error) ? error : createOtherCommonError({ message: DEFAULT_ERROR_MESSAGE }),
    );
    setIsPending(false);
    if (!isCommonError(result)) {
      router.replace(props.nextPath);
      router.refresh();
      return;
    }
    if (result.errorCode === API_ERROR_CODE.ACCESS_POLICY_DENIED) {
      setErrorMessage("접근 정책에 의해 차단되었습니다. 허용된 네트워크에서 다시 시도하세요.");
      return;
    }
    setErrorMessage(result.apiError ? readCommonErrorMessage(result) : "로그인하지 못했습니다.");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-100 max-w-full flex-col gap-4.5 rounded-2xl border border-line bg-white px-8 py-9"
    >
      <div className="flex items-center gap-2.5">
        <BrandMark size={34} />
        <span className="text-[16px] font-bold">파일 관리</span>
      </div>
      <div>
        <h1 className="m-0 text-[22px] font-bold">관리자 로그인</h1>
        <p className="mt-1.5 mb-0 text-[13.5px] text-muted">아이디와 비밀번호를 입력하세요.</p>
      </div>
      <FormField label="아이디">
        <TextInput name="loginId" autoComplete="username" required className="h-10.5!" />
      </FormField>
      <FormField label="비밀번호">
        <TextInput name="password" type="password" autoComplete="current-password" required className="h-10.5!" />
      </FormField>
      {errorMessage && (
        <p role="alert" className="m-0 text-[13px] text-danger">
          {errorMessage}
        </p>
      )}
      <Button type="submit" variant="primary" disabled={isPending} className="h-11! text-[14.5px]!">
        로그인
      </Button>
      <div className="flex gap-2 rounded-lg bg-field p-3 text-[12.5px] leading-normal text-muted">
        <i className="ti ti-shield-lock shrink-0 text-[16px] text-primary" aria-hidden />
        계정에 할당된 접근 정책 그룹의 규칙을 통과한 경우에만 로그인됩니다.
      </div>
    </form>
  );
}
