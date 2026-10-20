<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";

const glow = ref<HTMLElement | null>(null);
const core = ref<HTMLElement | null>(null);
let cleanup: (() => void) | null = null;

onMounted(() => {
  const glowEl = glow.value;
  const coreEl = core.value;
  if (!glowEl || !coreEl) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const target = { x: window.innerWidth / 2, y: window.innerHeight / 3 };

  // Two followers: the wide glow lags behind, the small core keeps up.
  // Different lag gives the cursor effect some depth.
  const followers = [
    { el: glowEl, x: target.x, y: target.y, speed: 3 },
    { el: coreEl, x: target.x, y: target.y, speed: 9 },
  ];

  const place = (f: (typeof followers)[number]) => {
    f.el.style.transform = `translate3d(${f.x}px, ${f.y}px, 0) translate(-50%, -50%)`;
  };
  followers.forEach(place);

  const onPointerMove = (e: PointerEvent) => {
    target.x = e.clientX;
    target.y = e.clientY;
  };
  window.addEventListener("pointermove", onPointerMove, { passive: true });

  let frameId = 0;
  let last = performance.now();

  const tick = (now: number) => {
    frameId = requestAnimationFrame(tick);
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;

    for (const f of followers) {
      // frame-rate independent smoothing; snaps if the user prefers reduced motion
      const k = reduceMotion ? 1 : 1 - Math.exp(-dt * f.speed);
      f.x += (target.x - f.x) * k;
      f.y += (target.y - f.y) * k;
      place(f);
    }
  };
  frameId = requestAnimationFrame(tick);

  cleanup = () => {
    cancelAnimationFrame(frameId);
    window.removeEventListener("pointermove", onPointerMove);
  };
});

onBeforeUnmount(() => cleanup?.());
</script>

<template>
  <div
    class="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#050000]"
    aria-hidden="true"
  >
    <!-- ambient red light that drifts on its own -->
    <div class="blob blob-a" />
    <div class="blob blob-b" />

    <!-- cursor light: wide soft glow + small bright core -->
    <div
      ref="glow"
      class="absolute left-0 top-0 h-[720px] w-[720px] will-change-transform"
      style="
        background: radial-gradient(
          circle,
          rgba(220, 38, 38, 0.38) 0%,
          rgba(153, 27, 27, 0.16) 40%,
          transparent 70%
        );
      "
    />
    <div
      ref="core"
      class="absolute left-0 top-0 h-[220px] w-[220px] will-change-transform"
      style="background: radial-gradient(circle, rgba(248, 113, 113, 0.32) 0%, transparent 70%)"
    />

    <!-- vignette keeps the edges black so text stays readable -->
    <div
      class="absolute inset-0"
      style="
        background: radial-gradient(ellipse at center, transparent 35%, rgba(0, 0, 0, 0.78) 100%);
      "
    />
  </div>
</template>

<style scoped>
.blob {
  position: absolute;
  border-radius: 9999px;
  will-change: transform;
}
.blob-a {
  width: 60vmax;
  height: 60vmax;
  left: -18vmax;
  top: -24vmax;
  background: radial-gradient(circle, rgba(127, 29, 29, 0.7) 0%, transparent 65%);
  animation: drift-a 22s ease-in-out infinite alternate;
}
.blob-b {
  width: 50vmax;
  height: 50vmax;
  right: -14vmax;
  bottom: -20vmax;
  background: radial-gradient(circle, rgba(220, 38, 38, 0.4) 0%, transparent 65%);
  animation: drift-b 28s ease-in-out infinite alternate;
}

@keyframes drift-a {
  to {
    transform: translate3d(14vmax, 10vmax, 0) scale(1.15);
  }
}
@keyframes drift-b {
  to {
    transform: translate3d(-16vmax, -9vmax, 0) scale(1.1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .blob {
    animation: none;
  }
}
</style>
