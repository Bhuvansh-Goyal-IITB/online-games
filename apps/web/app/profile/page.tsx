import { currentUser, profileUpdate } from "@/lib";
import { ProfileForm } from "@ui/components/profile-form";
import { redirect } from "next/navigation";

export const runtime = "edge";

const Page = async () => {
  const user = await currentUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="w-full h-full flex items-center justify-center px-4">
      <ProfileForm
        defaultValues={{
          id: user.id!,
          displayName: user.name ?? null,
          email: user.email!,
          image: user.image ?? null,
        }}
        onSubmitAction={profileUpdate}
      />
    </div>
  );
};

export default Page;
