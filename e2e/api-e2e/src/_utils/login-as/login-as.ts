import { api } from "../api-client";

export async function loginAs(props: { loginId: string; password: string; ip?: string }) {
  const res = await api({ ip: props.ip }).post("/api/admin/auth/login").send(props);
  return res;
}
