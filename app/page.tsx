import ExperienceLayer from "@/components/chrome/ExperienceLayer";
import Hero from "@/components/sections/Hero";
import Projects from "@/components/sections/Projects";
import Skills from "@/components/sections/Skills";
import Timeline from "@/components/sections/Timeline";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <>
      <ExperienceLayer />

      <a
        href="#deck"
        className="glass sr-only rounded-full px-5 py-2.5 font-mono text-xs text-accent focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100]"
      >
        Skip to content
      </a>

      <main>
        <Hero />
        <Projects />
        <Skills />
        <Timeline />
        <Contact />
        <Footer />
      </main>
    </>
  );
}
