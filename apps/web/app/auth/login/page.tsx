import { LoginForm } from "@repo/ui/components/login-form";

export const runtime = "edge";

const Page = () => {
  return (
    <div className="flex w-full h-full items-center justify-center">
      <LoginForm />
    </div>
  );
};

export default Page;
