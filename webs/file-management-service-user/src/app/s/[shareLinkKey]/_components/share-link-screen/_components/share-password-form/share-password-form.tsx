"use client";

import { PUBLIC_SHARE_LINK_UNLOCK_API } from "@fms/api-schemas/schemas/public-share-link-api-schemas";
import { isCommonError } from "@fms/error-provider/errors/is-common-error";
import { Button } from "@fms/web-ui/components/button";
import { TextInput } from "@fms/web-ui/components/text-input";
import { type SubmitEvent, useState } from "react";
import { useCallApiWrapper } from "@/wrappers/use-call-api-wrapper";
import { readCommonErrorMessage } from "./_utils/read-common-error-message";

/** 비밀번호가 맞으면 api 가 잠금 해제 쿠키를 심고, `onUnlocked` 로 자료 정보를 다시 불러온다. */
export function SharePasswordForm(props: { shareLinkKey: string; onUnlocked: () => void }) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const unlockApi = useCallApiWrapper(PUBLIC_SHARE_LINK_UNLOCK_API, { via: "client", refreshOnSuccess: false });

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    const result = await unlockApi.fetchApi({
      params: { shareLinkKey: props.shareLinkKey },
      body: { password: String(new FormData(event.currentTarget).get("password") ?? "") },
    });
    if (!isCommonError(result)) {
      props.onUnlocked();
      return;
    }
    setErrorMessage(readCommonErrorMessage(result));
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-105 max-w-full flex-col gap-4 rounded-2xl border border-line bg-white px-8 py-9"
    >
      <div className="flex size-12 items-center justify-center rounded-xl bg-primary-soft text-[24px] text-primary">
        <i className="ti ti-lock" aria-hidden />
      </div>
      <div>
        <h1 className="m-0 text-[20px] font-bold">비밀번호가 필요합니다</h1>
        <p className="mt-1.5 mb-0 text-[13.5px] text-muted">공유받은 비밀번호를 입력하면 자료를 확인할 수 있습니다.</p>
      </div>
      <TextInput
        type="password"
        name="password"
        aria-label="비밀번호"
        placeholder="비밀번호"
        required
        autoFocus
        className="h-11! px-3.5!"
      />
      {errorMessage && (
        <p role="alert" className="m-0 text-[13px] text-danger">
          {errorMessage}
        </p>
      )}
      <Button type="submit" variant="primary" disabled={unlockApi.isLoading} className="h-11! text-[14.5px]!">
        확인
      </Button>
    </form>
  );
}
