import { Button } from "@repo/ui/components/ui/button";
import Link from "next/link";

const Page = () => {
  return (
    <main className="w-full h-full flex flex-col gap-4 justify-center items-center bg-background">
      <Button asChild>
        <Link href="/chess">Play Chess</Link>
      </Button>

      <div className="text-sm text-muted-foreground">
        More games coming soon...
      </div>
    </main>
  );
};

export default Page;
