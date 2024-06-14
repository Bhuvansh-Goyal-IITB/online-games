import GameSelector from "@/components/GameSelector";

const Page = () => {
  return (
    <main className="w-full h-full flex flex-col gap-24 justify-center items-center bg-muted">
      <div>
        <h1 className="text-8xl font-extrabold">
          Online <br /> Games
        </h1>
      </div>
      <div className="w-full h-[400px] flex justify-center">
        <GameSelector />
      </div>
    </main>
  );
};

export default Page;
