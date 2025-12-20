import { auth } from "@/lib/auth";
import { RegisterView } from "@/modules/auth/ui/view/register-view";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const Page = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!!session) {
    redirect("/");
  }

  return (
    <div>
      <RegisterView />
    </div>
  );
};

export default Page;
