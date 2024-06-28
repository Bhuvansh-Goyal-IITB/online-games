import AuthPopup from "@/components/AuthPopup";
import ChessMenu from "@/components/ChessMenu";
import { ProfileWidget } from "@/components/ProfileWidget";
import { currentUser } from "@/lib";

export const runtime = "edge";

export default async function Page() {
  const user = await currentUser();

  return (
    <div className="flex justify-center items-center w-full h-full bg-background">
      <div className="absolute right-0 top-0">
        <ProfileWidget />
      </div>
      {user == undefined && <AuthPopup />}
      <div>
        <ChessMenu id={user?.id ?? undefined} />
      </div>
    </div>
  );
}
