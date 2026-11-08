"use client";

import type { ApiSchema } from "@fms/api-schemas/types/api-schema";
import type { ApiRequest, ResBody } from "@fms/api-schemas/types/api-schema-utils";
import { isCommonError } from "@fms/error-provider/errors/is-common-error";
import type { CommonError } from "@fms/error-provider/types/common-error";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { usePublicEnv } from "@/providers/public-env-provider";
import { createOtherCommonError } from "@/utils/commons/create-other-common-error";
import { DEFAULT_ERROR_MESSAGE } from "../_consts/default-error-message";
import { callApiActionWrapper } from "../call-api-action-wrapper";
import { fetchClientWrapper } from "../fetch-client-wrapper";
import type { UseCallApiWrapperOptions } from "./_types/use-call-api-wrapper-options";

/** 클라이언트 컴포넌트에서 api schema 로 호출한다. `fetchApi` 는 throw 하지 않고 `CommonError` 를 돌려준다. */
export function useCallApiWrapper<S extends ApiSchema>(schema: S, options: UseCallApiWrapperOptions = {}) {
  const { via = "action", refreshOnSuccess = true } = options;
  const router = useRouter();
  const { apiPublicUrl } = usePublicEnv();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<ResBody<S> | null>(null);
  const [error, setError] = useState<CommonError | null>(null);

  async function fetchApi(request: ApiRequest<S>): Promise<ResBody<S> | CommonError> {
    setIsLoading(true);
    setError(null);
    const result = await (via === "client"
      ? fetchClientWrapper(schema, request, { baseUrl: apiPublicUrl, credentials: "include" })
      : callApiActionWrapper(schema, request)
    ).catch((caught: unknown) =>
      isCommonError(caught)
        ? caught
        : createOtherCommonError({ message: caught instanceof Error ? caught.message : DEFAULT_ERROR_MESSAGE }),
    );
    setIsLoading(false);

    if (isCommonError(result)) {
      setError(result);
      return result;
    }
    setData(result);
    if (refreshOnSuccess) {
      router.refresh();
    }
    return result;
  }

  return { fetchApi, isLoading, data, error };
}
