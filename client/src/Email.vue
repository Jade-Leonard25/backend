<script setup lang="ts">
import { onBeforeUnmount, reactive, ref, type Directive } from "vue";
import { z } from "zod";

import ThreeBackground from "./components/ThreeBackground.vue";
import CursorGlow from "./components/CursorGlow.vue";
import FloatingLogos from "./components/FloatingLogos.vue";
import ThreeDrawer from "./components/ThreeDrawer.vue";

const apiData = import.meta.env.VITE_API_URL;

const chatSchema = z.object({
  fullName: z.string().trim().min(5, "Name must be at least 5 characters").max(50),
  email: z.email("Enter a valid email address"),
  companyName: z.string().trim().min(1, "Company is required").max(100),
  subject: z.string().trim().min(1, "Subject is required").max(150),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(5000),
});

const isDrawerOpen = ref(false);
const isSubmitting = ref(false);
const submitMessage = ref("");

const form = reactive({
  fullName: "",
  email: "",
  companyName: "",
  subject: "",
  message: "",
});

const handleSendChat = async () => {
  submitMessage.value = "";

  const result = chatSchema.safeParse(form);

  if (!result.success) {
    submitMessage.value = result.error.issues[0]?.message ?? "Please check your input.";
    return;
  }

  if (!apiData) {
    submitMessage.value = "The API URL is not configured.";
    return;
  }

  isSubmitting.value = true;

  try {
    const response = await fetch(`${apiData}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(result.data),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.message ?? "Failed to send the message.");
    }

    submitMessage.value = "Message sent successfully!";

    Object.assign(form, {
      fullName: "",
      email: "",
      companyName: "",
      subject: "",
      message: "",
    });
  } catch (error) {
    submitMessage.value =
      error instanceof Error
        ? error.message
        : "Something went wrong. Please try again.";
  } finally {
    isSubmitting.value = false;
  }
};

// Scroll-reveal animation
let observer: IntersectionObserver | undefined;

const vReveal: Directive<HTMLElement, number | undefined> = {
  mounted(el, binding) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-revealed");
      return;
    }

    el.classList.add("reveal");
    el.style.setProperty("--reveal-delay", `${binding.value ?? 0}ms`);

    observer ??= new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          const target = entry.target as HTMLElement;
          target.classList.add("is-revealed");
          observer?.unobserve(target);
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(el);
  },

  unmounted(el) {
    observer?.unobserve(el);
  },
};

onBeforeUnmount(() => {
  observer?.disconnect();
  observer = undefined;
});
</script>

<template>
  <div class="relative min-h-screen overflow-x-hidden bg-background text-foreground">
    <CursorGlow />
    <ThreeBackground />
    <FloatingLogos />

    <main class="relative z-10 mx-auto max-w-3xl px-6 py-32">
      <p v-reveal="0" class="mb-3 text-sm font-semibold uppercase tracking-widest text-red-500">
        Contact
      </p>

      <h1 v-reveal="120" class="mb-4 text-4xl font-bold tracking-tight text-gray-400 md:text-6xl">
        Send Email
      </h1>

      <p v-reveal="240" class="max-w-xl text-muted-foreground">
        Have a project in mind? Let's build something great together.
      </p>

      <div v-reveal="360" class="mt-8">
        <button type="button" @click="isDrawerOpen = true"
          class="inline-flex rounded-lg bg-red-600 px-5 py-3 font-medium text-white transition hover:bg-red-700 active:scale-95">
          Contact me
        </button>
      </div>
    </main>

    <!-- THREE.JS CONTACT DRAWER -->
    <ThreeDrawer class="p-2" :open="isDrawerOpen" @update:open="isDrawerOpen = $event" title="Send a Message"
      description="Available for freelance work through Fiverr and Upwork. Send a message and I'll get back to you within 24 hours.Once i receieve your message, i can replay within 24 hours.">
      <form class="mt-2 flex flex-col gap-4" @submit.prevent="handleSendChat">
        <div>
          <label class="text-sm font-medium text-foreground">Name</label>
          <input v-model="form.fullName" type="text" required minlength="5" maxlength="50" autocomplete="name"
            class="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Your name" />
        </div>
          
        <div>
          <label class="text-sm font-medium text-foreground">Email</label>
          <input v-model="form.email" type="email" required autocomplete="email"
            class="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="you@example.com" />
        </div>

        <div>
          <label class="text-sm font-medium text-foreground">Company</label>
          <input v-model="form.companyName" type="text" required maxlength="100" autocomplete="organization"
            class="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Your company" />
        </div>

        <div>
          <label class="text-sm font-medium text-foreground">Subject</label>
          <input v-model="form.subject" type="text" required maxlength="150"
            class="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="What is this about?" />
        </div>

        <div>
          <label class="text-sm font-medium text-foreground">Message</label>
          <textarea v-model="form.message" rows="3" required minlength="10" maxlength="5000"
            class="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="How can I help you?"></textarea>
        </div>

        <p v-if="isSubmitting" role="status" class="text-center text-sm text-muted-foreground">
          The backend uses free-tier hosting, so the first request may take
          20–40 seconds while the server and database wake up. Thanks for your patience!
        </p>

        <p v-else-if="submitMessage" role="status" class="text-center text-sm text-muted-foreground">
          {{ submitMessage }}
        </p>
     
        <button type="submit" :disabled="isSubmitting"
          class="mt-2 w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50">
          {{ isSubmitting ? "Sending..." : "Send Message" }}
        </button>
      </form>

      <template #footer>
        <p class="mt-2 text-center text-xs text-muted-foreground">
          Or email me directly at
          <a href="https://mail.google.com/mail/?view=cm&to=developmentserver160@gmail.com" target="_blank"
            rel="noopener noreferrer" class="font-bold text-gray-200 hover:underline">
            developmentserver160@gmail.com
          </a>
        </p>
      </template>
    </ThreeDrawer>
  </div>
</template>

<style>
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
  .reveal {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>