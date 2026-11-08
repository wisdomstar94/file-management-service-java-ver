import { isCommonError } from "@fms/error-provider/errors/is-common-error";
import type { CommonError } from "@fms/error-provider/types/common-error";
import { unstable_rethrow } from "next/navigation";
import { DEFAULT_ERROR_MESSAGE } from "@/consts/default-error-message";
import { createOtherCommonError } from "@/utils/commons/create-other-common-error";

/**
 * 모든 서버 액션은 이 함수로 감싸 선언한다. 던져진 에러를 `CommonError` 로 바꿔 return 하므로,
 * 사용하는 쪽은 `isCommonError` 로 결과를 구분한다.
 */
export function serverActionWrapper<TArgs extends unknown[], TResult>(
  action: (...args: TArgs) => Promise<TResult>,
): (...args: TArgs) => Promise<TResult | CommonError> {
  return async (...args) => {
    try {
      return await action(...args);
    } catch (error) {
      // redirect() · notFound() 는 에러로 전달되므로 그대로 다시 던져야 이동한다.
      unstable_rethrow(error);
      if (isCommonError(error)) {
        return error;
      }
      const commonError = createOtherCommonError({ message: DEFAULT_ERROR_MESSAGE });
      console.error(`[${commonError.errorCode}] serverActionWrapper`, error);
      return commonError;
    }
  };
}
