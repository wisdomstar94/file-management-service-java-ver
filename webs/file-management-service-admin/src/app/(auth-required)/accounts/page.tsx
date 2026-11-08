import {
  ADMIN_ACCOUNT_ASSIGNABLE_GROUPS_API,
  ADMIN_ACCOUNT_LIST_API,
} from "@fms/api-schemas/schemas/admin-account-api-schemas";
import { readPageParam } from "@/utils/commons/read-page-param";
import { requirePagePermission } from "@/utils/domains/permission/require-page-permission";
import { fetchServerWrapper } from "@/wrappers/fetch-server-wrapper";
import { AccountsScreen } from "./_components/accounts-screen";

export default async function AccountsPage(props: PageProps<"/accounts">) {
  await requirePagePermission("account.access");
  const page = readPageParam((await props.searchParams).page);
  const [accounts, options] = await Promise.all([
    fetchServerWrapper(ADMIN_ACCOUNT_LIST_API, { query: { page, size: 20 } }),
    fetchServerWrapper(ADMIN_ACCOUNT_ASSIGNABLE_GROUPS_API, {}),
  ]);
  return <AccountsScreen accounts={accounts.data} options={options.data} />;
}
