import Image from "next/image";
import Videoclient from "./components/Videoclient1";
import Videoclient2 from "./components/Videoclient2";
import ClientButtons from "./components/ClientButtons";

export default function Home() {
  
  return (
    <div className=" items-center justify-items-center mt-30  sm:p-10 font-[family-name:var(--font-geist-sans)]">
      <main className="mx-40">
        <div className="my-10">
          <h1 className="text-2xl">Video chat app</h1>
          <p className="text-sm text-foreground/50">
            This is a video chat app built with Next.js, Tailwind CSS, and
            WebRTC.
          </p>
        </div>
        <div className="flex flex-col gap-4 items-center sm:flex-row">
          <div className="client1">
            <Videoclient />
          </div>
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center"></footer>
    </div>
  );
}
