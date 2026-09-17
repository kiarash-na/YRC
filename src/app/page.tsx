import { Hero } from "@/components/hero";
import { Pillars } from "@/components/pillars";

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <Pillars />
    </main>
  );
}
