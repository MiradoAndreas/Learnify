import { auth } from "@/lib/auth";
import { LoginView } from "@/modules/auth/ui/view/login-view";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const Page = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!!session) {
    redirect("/");
  }
  return <LoginView />;
};

export default Page;
