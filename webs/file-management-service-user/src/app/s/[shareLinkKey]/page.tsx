import { SharePageFrame } from "@/components/domains/share-links/share-page-frame";
import { ShareBlockedNotice } from "./_components/share-blocked-notice";
import { ShareLinkScreen } from "./_components/share-link-screen";
import { ShareNotFoundNotice } from "./_components/share-not-found-notice";
import { readGateState } from "./_utils/read-gate-state";
import { readQueryValue } from "./_utils/read-query-value";

export default async function SharePage(props: PageProps<"/s/[shareLinkKey]">) {
  const { shareLinkKey } = await props.params;
  const searchParams = await props.searchParams;
  const gate = await readGateState(shareLinkKey);

  return (
    <SharePageFrame>
      {gate.kind === "BLOCKED" && <ShareBlockedNotice details={gate.details} />}
      {gate.kind === "NOT_FOUND" && <ShareNotFoundNotice />}
      {gate.kind === "PASSED" && (
        <ShareLinkScreen
          shareLinkKey={shareLinkKey}
          isPasswordRequired={gate.isPasswordRequired}
          downloadError={readQueryValue(searchParams.downloadError)}
          downloadErrorTimestamp={readQueryValue(searchParams.timestamp)}
        />
      )}
    </SharePageFrame>
  );
}
