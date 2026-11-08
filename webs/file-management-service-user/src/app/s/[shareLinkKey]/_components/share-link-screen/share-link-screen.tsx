"use client";

import {
  PUBLIC_SHARE_LINK_DETAIL_API,
  PUBLIC_SHARE_LINK_DOWNLOAD_API,
} from "@fms/api-schemas/schemas/public-share-link-api-schemas";
import { useEffect, useState } from "react";
import { usePublicEnv } from "@/providers/public-env-provider";
import { useCallApiWrapper } from "@/wrappers/use-call-api-wrapper";
import { ShareBlockedNotice } from "../share-blocked-notice";
import { ShareNotFoundNotice } from "../share-not-found-notice";
import { ShareDocumentView } from "./_components/share-document-view";
import { SharePasswordForm } from "./_components/share-password-form";
import { DOWNLOAD_ERROR_VISIBLE_MS } from "./_consts/download-error-visible-ms";
import type { ShareDetailState } from "./_types/share-detail-state";
import { buildClientApiUrl } from "./_utils/build-client-api-url";
import { toShareDetailState } from "./_utils/to-share-detail-state";

/**
 * 비밀번호 → 자료 순서로 확인한다. 잠금 해제 토큰은 api 의 httpOnly 쿠키에 있어 브라우저가 api 를 직접 호출한다.
 * 다운로드 실패 사유는 api 가 붙인 `timestamp` 로부터 5초 안일 때만 보여준다.
 */
export function ShareLinkScreen(props: {
  shareLinkKey: string;
  isPasswordRequired: boolean;
  downloadError?: string;
  downloadErrorTimestamp?: string;
}) {
  const { shareLinkKey, isPasswordRequired } = props;
  const { apiPublicUrl } = usePublicEnv();
  const detailApi = useCallApiWrapper(PUBLIC_SHARE_LINK_DETAIL_API, { via: "client", refreshOnSuccess: false });
  const [state, setState] = useState<ShareDetailState>({ kind: "LOADING" });
  const [downloadError, setDownloadError] = useState<string>();

  async function loadDetail() {
    setState(toShareDetailState(await detailApi.fetchApi({ params: { shareLinkKey } }), isPasswordRequired));
  }

  // 서버 렌더링과 시각이 달라 화면이 어긋나지 않도록 브라우저에서 한 번만 판단한다.
  // biome-ignore lint/correctness/useExhaustiveDependencies: 링크마다 한 번만 불러온다.
  useEffect(() => {
    const elapsedMs = Date.now() - Number(props.downloadErrorTimestamp);
    if (props.downloadError && elapsedMs >= 0 && elapsedMs <= DOWNLOAD_ERROR_VISIBLE_MS) {
      setDownloadError(props.downloadError);
    }
    loadDetail();
  }, [shareLinkKey]);

  if (state.kind === "LOADING") {
    return null;
  }
  if (state.kind === "PASSWORD_REQUIRED") {
    return <SharePasswordForm shareLinkKey={shareLinkKey} onUnlocked={loadDetail} />;
  }
  if (state.kind === "BLOCKED") {
    return <ShareBlockedNotice details={state.details} />;
  }
  if (state.kind === "NOT_FOUND") {
    return <ShareNotFoundNotice />;
  }
  return (
    <ShareDocumentView
      detail={state.detail}
      downloadError={downloadError}
      downloadHref={(versionId) =>
        buildClientApiUrl(
          PUBLIC_SHARE_LINK_DOWNLOAD_API,
          { params: { shareLinkKey, versionId } },
          { baseUrl: apiPublicUrl },
        )
      }
      onDownload={loadDetail}
    />
  );
}
