import { LoginForm } from "./_components/login-form";

export default async function LoginPage(props: PageProps<"/login">) {
  const { next } = await props.searchParams;
  const nextPath = typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/";
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <LoginForm nextPath={nextPath} />
    </div>
  );
}
