import Navbar from "@/components/Navbar";
import ChatPanel from "@/components/chat/ChatPanel";

export const metadata = { title: "Chat with IVAN" };

export default function ChatPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="relative mx-auto flex max-w-3xl flex-col items-center px-4 pb-10 pt-10">
        <div className="pointer-events-none absolute top-10 h-72 w-72 rounded-full bg-accent/15 blur-[120px]" />
        <p className="relative text-[11px] font-bold uppercase tracking-[.3em] text-accent-text">Talk to the team</p>
        <h1 className="display-font relative mt-3 text-6xl leading-[.85] md:text-8xl">SAY HI<span className="text-hot">.</span></h1>
        <ChatPanel active large className="relative mt-8 h-[calc(100dvh-17rem)] min-h-[460px] w-full" />
      </section>
    </main>
  );
}
