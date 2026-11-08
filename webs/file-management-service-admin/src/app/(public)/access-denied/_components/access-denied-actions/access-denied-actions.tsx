"use client";

import { Button } from "@fms/web-ui/components/button";
import { useRouter } from "next/navigation";
import { usePublicEnv } from "@/providers/public-env-provider";
import { requestAdminLogout } from "@/utils/domains/admin-auth/request-admin-logout";

export function AccessDeniedActions() {
  const router = useRouter();
  const { apiPublicUrl } = usePublicEnv();

  async function logout() {
    await requestAdminLogout(apiPublicUrl);
    router.replace("/login");
  }

  return (
    <div className="mt-1.5 flex gap-2">
      <Button onClick={logout} className="h-10!">
        로그아웃
      </Button>
      <Button variant="primary" className="h-10!" onClick={() => window.location.assign("/")}>
        다시 시도
      </Button>
    </div>
  );
}
