<script setup lang="ts">
import CursorGlow from "./components/CursorGlow.vue";
import ThreeBackground from "./components/ThreeBackground.vue";
import Card from "./components/Card.vue";
import Button from "./components/Button.vue";
import FloatingLogos from "./components/FloatingLogos.vue";

import { onBeforeUnmount, onMounted, ref, type CSSProperties, type Directive } from "vue";

// Dark red/black palette, applied on the root element below.
const palette: Record<string, string> = {
  background: "#0a0404",
  foreground: "#f5f5f5",
  card: "#140a0a",
  "card-foreground": "#f5f5f5",
  primary: "#dc2626",
  "primary-foreground": "#fafafa",
  secondary: "#241616",
  "secondary-foreground": "#f5f5f5",
  muted: "#241616",
  "muted-foreground": "#b8a9a9",
  accent: "#2a1515",
  "accent-foreground": "#f5f5f5",
  destructive: "#ef4444",
  "destructive-foreground": "#fafafa",
  border: "#ffffff1f",
  input: "#ffffff26",
  ring: "#dc2626",
};

const theme = {
  "color-scheme": "dark",
  ...Object.fromEntries(
    Object.entries(palette).flatMap(([name, value]) => [
      [`--${name}`, value],
      [`--color-${name}`, value],
    ]),
  ),
} as CSSProperties;

// ---- Scroll animation -------------------------------------------------------
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const finishReveal = (el: HTMLElement) => {
  el.classList.remove("reveal", "is-revealed");
  el.style.removeProperty("--reveal-delay");
};

const revealObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const el = entry.target as HTMLElement;
      revealObserver.unobserve(el);
      el.classList.add("is-revealed");
      el.addEventListener("transitionend", function onEnd(e) {
        if (e.target !== el || e.propertyName !== "opacity") return;
        el.removeEventListener("transitionend", onEnd);
        finishReveal(el);
      });
    }
  },
  { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
);

const vReveal: Directive<HTMLElement, number | undefined> = {
  mounted(el, binding) {
    if (reduceMotion) return;
    el.classList.add("reveal");
    el.style.setProperty("--reveal-delay", `${binding.value ?? 0}ms`);
    revealObserver.observe(el);
  },
  unmounted(el) {
    revealObserver.unobserve(el);
  },
};

// Thin red bar at the top that fills as you scroll down the page.
const progress = ref<HTMLElement | null>(null);
let onScroll: (() => void) | null = null;

onMounted(() => {
  let ticking = false;
  const update = () => {
    ticking = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    if (progress.value) progress.value.style.transform = `scaleX(${p})`;
  };
  onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  update();
});

onBeforeUnmount(() => {
  if (onScroll) window.removeEventListener("scroll", onScroll);
  revealObserver.disconnect();
});

const arrowPath = "M7 17L17 7M17 7H7M17 7v10";

const skills = [
  { icon: "⚡", name: "Vue 3 / Nuxt", level: "Advanced" },
  { icon: "⚛️", name: "React / Next.js", level: "Advanced" },
  { icon: "📘", name: "TypeScript", level: "Advanced" },
  { icon: "🎨", name: "Tailwind CSS", level: "Advanced" },
  { icon: "🗄️", name: "Node / Express", level: "Intermediate" },
  { icon: "🐘", name: "PostgreSQL / Neon", level: "Intermediate" },
  { icon: "🎬", name: "Three.js / WebGL", level: "Intermediate" },
  { icon: "📦", name: "Vite / Rollup", level: "Advanced" },
  { icon: "🧪", name: "Vitest / Testing", level: "Intermediate" },
];

const projects = [
  {
    year: "2024",
    title: "Admin Dashboard",
    description:
      "Role-based admin console with real-time analytics, user CRUD, and audit logging. Vue 3 + Neon Postgres.",
    tags: ["Vue 3", "TypeScript", "Neon", "Tailwind"],
    link: "#",
  },
  {
    year: "2024",
    title: "E-commerce Storefront",
    description:
      "SSR storefront with cart, checkout, and Stripe integration. 100/100 Lighthouse on product pages.",
    tags: ["Next.js", "Stripe", "React", "Postgres"],
    link: "#",
  },
  {
    year: "2023",
    title: "Realtime Chat Platform",
    description:
      "WebSocket-based messaging app with rooms, typing indicators, and message persistence.",
    tags: ["Socket.io", "Express", "React", "Redis"],
    link: "#",
  },
  {
    year: "2023",
    title: "WebGL Portfolio",
    description:
      "Three.js driven personal site with particle systems and GPU-accelerated transitions.",
    tags: ["Three.js", "GLSL", "Vite"],
    link: "#",
  },
];

const contactLinks = [
  {
    label: "Fiverr",
    text: "Hire on Fiverr",
    href: "https://fiverr.com/", // TODO: your profile URL
    external: true,
    iconPath: arrowPath,
  },
  {
    label: "Upwork",
    text: "Hire on Upwork",
    href: "https://www.upwork.com/", // TODO: your profile URL
    external: true,
    iconPath: arrowPath,
  },
  {
    label: "Email",
    text: "Send email",
    href: "/send-email",
    external: true,
    iconPath:
      "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  },
  {
    label: "GitHub",
    text: "My GitHub",
    href: "https://github.com/Jade-Leonard25",
    external: true,
    iconPath:
      "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
  },
];
</script>

<template>
  <div :style="theme" class="relative min-h-screen bg-background text-foreground overflow-x-hidden">
    <div ref="progress" class="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-primary" style="transform: scaleX(0)"
      aria-hidden="true" />

    <CursorGlow />
    <ThreeBackground />
    <FloatingLogos />
    <!-- Subtle grid overlay -->
    <div class="fixed inset-0 pointer-events-none z-[1]" style="
        background-image:
          linear-gradient(rgba(220, 38, 38, 0.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(220, 38, 38, 0.035) 1px, transparent 1px);
        background-size: 80px 80px;
      " />

    <!-- NAV -->
    <nav class="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-background/70 border-b border-border">
      <div class="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <a href="#" class="text-lg font-bold tracking-tight">
          jade<span class="text-primary">.</span>
        </a>
        <div class="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#about" class="hover:text-foreground transition">About</a>
          <a href="#skills" class="hover:text-foreground transition">Skills</a>
          <a href="#work" class="hover:text-foreground transition">Work</a>
          <a href="#contact" class="hover:text-foreground transition">Contact</a>
        </div>
        <Button as="a" href="#contact" class="hidden md:inline-flex">Hire me</Button>
      </div>
    </nav>

    <!-- HERO -->
    <section class="relative z-10 min-h-screen flex items-center px-6">
      <div class="max-w-7xl mx-auto w-full">
        <div class="max-w-4xl">
          <div v-reveal="0" class="flex items-center gap-3 mb-6">
            <div class="h-px w-12 bg-primary" />
            <span class="text-primary text-sm tracking-[0.2em] uppercase">
              Frontend Developer
            </span>
          </div>

          <h1 v-reveal="100" class="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[0.95] mb-6">
            Jade Leonard<br />
            <span class="text-primary">Miano Alvez</span>
          </h1>

          <p v-reveal="220" class="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
            Building <span class="text-foreground">performant</span>,
            <span class="text-foreground">accessible</span>, and
            <span class="text-foreground">beautiful</span> web experiences. Specialized in Vue,
            React, and the modern JavaScript ecosystem.
          </p>

          <div v-reveal="340" class="flex flex-wrap gap-4">
            <Button as="a" href="#work" size="lg" class="shadow-lg shadow-primary/20" :crack="true">
              View Work
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Button>
            <Button as="a" href="#contact" variant="outline" size="lg" :crack="true"
              class="border-border hover:border-primary/50 hover:bg-primary/5 hover:text-foreground">
              Get in touch
            </Button>
          </div>
        </div>
      </div>

      <div
        class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground text-xs">
        <span>Scroll</span>
        <div class="w-px h-8 bg-gradient-to-b from-primary to-transparent" />
      </div>
    </section>

    <!-- ABOUT -->
    <section id="about" class="relative z-10 py-32 px-6 border-t border-border">
      <div class="max-w-7xl mx-auto grid md:grid-cols-[auto_1fr] gap-12 md:gap-24">
        <div class="flex items-start gap-4">
          <span class="text-primary font-mono text-sm">01</span>
          <span class="text-muted-foreground text-sm uppercase tracking-widest">About</span>
        </div>

        <div class="space-y-10">
          <h2 v-reveal class="text-3xl md:text-5xl font-bold tracking-tight max-w-2xl">
            Turning ideas into <span class="text-primary">interfaces</span> people love to use.
          </h2>

          <div v-reveal="100" class="grid md:grid-cols-2 gap-8 text-muted-foreground leading-relaxed">
            <p>
              I'm a frontend developer based in the Philippines, focused on crafting polished,
              production-ready web applications. I care about the details most people miss — loading
              states, keyboard navigation, the exact 60fps curve of a transition. You can check my
              <a href="https://github.com/Jade-Leonard25" target="_blank" rel="noopener noreferrer"
                class="font-bold text-gray-200 hover:text-red-400 underline underline-offset-4 decoration-gray-500 hover:decoration-red-400 transition-colors duration-300">
                GitHub
              </a>
              to see some of my projects.
            </p>
            <p>
              When I'm not coding, I'm exploring design systems, contributing to open source, or
              taking on freelance projects through Fiverr and Upwork for clients worldwide.
            </p>
          </div>

          <div v-reveal="200" class="grid grid-cols-3 gap-4 pt-8 border-t border-border">
            <div>
              <div class="text-3xl md:text-4xl font-bold">3+</div>
              <div class="text-sm text-muted-foreground mt-1">Years experience</div>
            </div>
            <div>
              <div class="text-3xl md:text-4xl font-bold">40+</div>
              <div class="text-sm text-muted-foreground mt-1">Projects shipped</div>
            </div>
            <div>
              <div class="text-3xl md:text-4xl font-bold">100%</div>
              <div class="text-sm text-muted-foreground mt-1">Client satisfaction</div>
            </div>
          </div>
        </div>
        <div></div>
      </div>
    </section>

    <!-- SKILLS -->
    <section id="skills" class="relative z-10 py-32 px-6 border-t border-border">
      <div class="max-w-7xl mx-auto grid md:grid-cols-[auto_1fr] gap-12 md:gap-24">
        <div class="flex items-start gap-4">
          <span class="text-primary font-mono text-sm">02</span>
          <span class="text-muted-foreground text-sm uppercase tracking-widest">Skills</span>
        </div>

        <div>
          <h2 v-reveal class="text-3xl md:text-5xl font-bold tracking-tight mb-12">
            The tools I <span class="text-primary">live in</span>.
          </h2>

          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Card v-for="(skill, i) in skills" v-reveal="(i % 3) * 80" :key="skill.name" size="sm"
              class="gap-2 shadow-none transition-all hover:border-primary/40 hover:bg-primary/[0.03]">
              <template #header>
                <div class="text-2xl">{{ skill.icon }}</div>
                <div class="font-medium">{{ skill.name }}</div>
                <div class="text-sm text-muted-foreground">{{ skill.level }}</div>
              </template>
            </Card>
          </div>
        </div>
      </div>
    </section>

    <!-- WORK -->
    <section id="work" class="relative z-10 py-32 px-6 border-t border-border">
      <div class="max-w-7xl mx-auto grid md:grid-cols-[auto_1fr] gap-12 md:gap-24">
        <div class="flex items-start gap-4">
          <span class="text-primary font-mono text-sm">03</span>
          <span class="text-muted-foreground text-sm uppercase tracking-widest">Work</span>
        </div>

        <div>
          <h2 v-reveal class="text-3xl md:text-5xl font-bold tracking-tight mb-12">
            Selected <span class="text-primary">projects</span>.
          </h2>

          <div class="grid md:grid-cols-2 gap-4">
            <a v-for="(project, i) in projects" v-reveal="(i % 2) * 120" :key="project.title" :href="project.link"
              class="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Card
                class="h-full shadow-none transition-all group-hover:border-primary/40 group-hover:bg-primary/[0.02]"
                footer-class="flex-wrap gap-1.5">
                <template #header>
                  <div class="flex items-start justify-between">
                    <span class="text-xs text-primary font-mono">{{ project.year }}</span>
                    <svg
                      class="w-5 h-5 text-muted-foreground transition-all group-hover:text-primary group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="arrowPath" />
                    </svg>
                  </div>
                  <h3 class="text-xl font-bold transition group-hover:text-primary">
                    {{ project.title }}
                  </h3>
                </template>

                <p class="text-muted-foreground text-sm leading-relaxed">
                  {{ project.description }}
                </p>

                <template #footer>
                  <span v-for="tag in project.tags" :key="tag"
                    class="text-[11px] px-2 py-0.5 bg-muted rounded text-muted-foreground">
                    {{ tag }}
                  </span>
                </template>
              </Card>
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- CONTACT -->
    <section id="contact" class="relative z-10 py-32 px-6 border-t border-border">
      <div class="max-w-7xl mx-auto grid md:grid-cols-[auto_1fr] gap-12 md:gap-24">
        <div class="flex items-start gap-4">
          <span class="text-primary font-mono text-sm">04</span>
          <span class="text-muted-foreground text-sm uppercase tracking-widest">Contact</span>
        </div>

        <div>
          <h2 v-reveal class="text-3xl md:text-6xl font-bold tracking-tight mb-6 max-w-2xl">
            Let's build something <span class="text-primary">great</span> together.
          </h2>
          <p v-reveal="100" class="text-muted-foreground mb-12 max-w-lg leading-relaxed">
            Available for freelance work through Fiverr and Upwork. Send a message and I'll get back
            to you within 24 hours.
          </p>

          <component :is="link.external ? 'a' : 'button'" type="button" v-for="(link, i) in contactLinks"
            v-reveal="i * 100" :key="link.label" :href="link.external ? link.href : undefined"
            :target="link.external ? '_blank' : undefined" :rel="link.external ? 'noopener' : undefined"
            @click="link.external ? link.href : undefined"
            class="group block w-full text-left rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer">
            <Card size="sm"
              class="gap-1.5 shadow-none transition-all group-hover:border-primary/50 group-hover:bg-primary/5 h-full">
              <div class="text-xs text-muted-foreground uppercase tracking-widest">
                {{ link.label }}
              </div>
              <div class="font-medium flex items-center gap-2 transition group-hover:text-primary">
                {{ link.text }}
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="link.iconPath" />
                </svg>
              </div>
            </Card>
          </component>
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="relative z-10 border-t border-border py-8 px-6">
      <div
        class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div>© 2026 Jade Leonard Miano Alvez. All rights reserved.</div>
        <div class="flex items-center gap-2 font-mono text-xs">
          <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span>Available for work</span>
        </div>
      </div>
    </footer>
  </div>


</template>

<style>
html {
  scroll-behavior: smooth;
}

.reveal {
  opacity: 0;
  transform: translate3d(0, 28px, 0);
  transition:
    opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: var(--reveal-delay, 0ms);
  will-change: opacity, transform;
}

.reveal.is-revealed {
  opacity: 1;
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}
</style>
