import ProfilePage from "@/components/ProfilePage";
import { currentUser } from "@/lib";
import { redirect } from "next/navigation";

const Page = async () => {
  const user = await currentUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="w-full h-full flex items-center justify-center px-4">
      <ProfilePage
        id={user.id!}
        email={user.email!}
        name={user.name ?? null}
        image={user.image ?? null}
      />
    </div>
  );
};

export default Page;
