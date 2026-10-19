<script lang="ts">
import { cva } from 'class-variance-authority'

export type CursorVariant = 'default' | 'ring' | 'dot'
export type CursorSize = 'sm' | 'default' | 'lg'

// Anything matching this selector switches the cursor to its "hover" look.
export const DEFAULT_INTERACTIVE =
  'a[href], button, summary, label, select, [role="button"], [role="link"], [data-cursor="hover"]'

// Elements where a text caret makes more sense than a ring.
const TEXT_SELECTOR =
  'input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]):not([type="range"]), textarea, [contenteditable=""], [contenteditable="true"]'

// The ring trails the pointer. The state comes from data-state / data-pressed
// on the root element (see the template), read here through group-data-[...].
export const cursorRingVariants = cva(
  [
    '-translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/70',
    'transition-all duration-200 ease-out motion-reduce:transition-none',
    'group-data-[state=hidden]:opacity-0',
    'group-data-[state=hover]:scale-[1.6] group-data-[state=hover]:bg-primary/10',
    'group-data-[state=text]:scale-0',
    'group-data-[pressed=true]:border-primary',
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'size-6',
        default: 'size-9',
        lg: 'size-12',
      } satisfies Record<CursorSize, string>,
    },
    defaultVariants: { size: 'default' },
  },
)

// The dot sits exactly on the pointer. Over text fields it becomes a caret.
export const cursorDotVariants = cva(
  [
    '-translate-x-1/2 -translate-y-1/2 rounded-full bg-primary',
    'transition-all duration-150 ease-out motion-reduce:transition-none',
    'group-data-[state=hidden]:opacity-0',
    'group-data-[state=hover]:scale-50',
    'group-data-[state=text]:h-6 group-data-[state=text]:w-0.5 group-data-[state=text]:rounded-sm',
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'size-1',
        default: 'size-1.5',
        lg: 'size-2',
      } satisfies Record<CursorSize, string>,
    },
    defaultVariants: { size: 'default' },
  },
)
</script>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

type CursorState = 'hidden' | 'idle' | 'hover' | 'text'

interface Props {
  variant?: CursorVariant
  size?: CursorSize
  /** Hide the system cursor so only this one shows. */
  hideNative?: boolean
  /** CSS selector for elements that trigger the hover look. */
  interactive?: string
  /** How quickly the ring catches up with the pointer. Higher = tighter. */
  ringSpeed?: number
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'default',
  hideNative: true,
  interactive: DEFAULT_INTERACTIVE,
  ringSpeed: 12,
})

const enabled = ref(false)
const visible = ref(false)
const mode = ref<CursorState>('idle')
const pressed = ref(false)

const state = computed<CursorState>(() => (visible.value ? mode.value : 'hidden'))

const ringEl = ref<HTMLElement | null>(null)
const dotEl = ref<HTMLElement | null>(null)
let cleanup: (() => void) | null = null

// An element can force a state with data-cursor="hover | text | hidden".
function stateFor(target: EventTarget | null): CursorState {
  if (!(target instanceof Element)) return 'idle'

  const override = target.closest<HTMLElement>('[data-cursor]')?.dataset.cursor
  if (override === 'hover' || override === 'text' || override === 'hidden') return override

  if (target.closest(TEXT_SELECTOR)) return 'text'
  if (target.closest(props.interactive)) return 'hover'
  return 'idle'
}

onMounted(() => {
  // Touch screens and other devices without a precise hovering pointer: do nothing.
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
  enabled.value = true

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const root = document.documentElement
  if (props.hideNative) root.classList.add('has-custom-cursor')

  const target = { x: 0, y: 0 }
  const ring = { x: 0, y: 0 }
  let placed = false
  let frameId = 0
  let last = performance.now()

  const onMove = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return
    target.x = e.clientX
    target.y = e.clientY
    if (!placed) {
      // first movement: start under the pointer instead of sliding in from the corner
      ring.x = target.x
      ring.y = target.y
      placed = true
    }
    visible.value = true
  }
  const onOver = (e: PointerEvent) => {
    mode.value = stateFor(e.target)
  }
  const onDown = () => {
    pressed.value = true
  }
  const onUp = () => {
    pressed.value = false
  }
  const onLeave = () => {
    visible.value = false
    pressed.value = false
  }

  const tick = (now: number) => {
    frameId = requestAnimationFrame(tick)
    const dt = Math.min((now - last) / 1000, 0.1)
    last = now

    // frame-rate independent smoothing; no trailing if reduced motion is on
    const k = reduceMotion ? 1 : 1 - Math.exp(-dt * props.ringSpeed)
    ring.x += (target.x - ring.x) * k
    ring.y += (target.y - ring.y) * k

    if (ringEl.value) ringEl.value.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0)`
    if (dotEl.value) dotEl.value.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`
  }
  frameId = requestAnimationFrame(tick)

  window.addEventListener('pointermove', onMove, { passive: true })
  document.addEventListener('pointerover', onOver, { passive: true })
  window.addEventListener('pointerdown', onDown, { passive: true })
  window.addEventListener('pointerup', onUp, { passive: true })
  window.addEventListener('pointercancel', onUp, { passive: true })
  window.addEventListener('blur', onUp)
  root.addEventListener('pointerleave', onLeave)

  cleanup = () => {
    cancelAnimationFrame(frameId)
    window.removeEventListener('pointermove', onMove)
    document.removeEventListener('pointerover', onOver)
    window.removeEventListener('pointerdown', onDown)
    window.removeEventListener('pointerup', onUp)
    window.removeEventListener('pointercancel', onUp)
    window.removeEventListener('blur', onUp)
    root.removeEventListener('pointerleave', onLeave)
    root.classList.remove('has-custom-cursor')
  }
})

onBeforeUnmount(() => cleanup?.())
</script>

<template>
  <div
    v-show="enabled"
    aria-hidden="true"
    :data-state="state"
    :data-pressed="pressed"
    class="group pointer-events-none fixed inset-0 z-[100] overflow-hidden"
  >
    <div v-if="variant !== 'dot'" ref="ringEl" class="absolute left-0 top-0 will-change-transform">
      <div :class="cursorRingVariants({ size })" />
    </div>
    <div v-if="variant !== 'ring'" ref="dotEl" class="absolute left-0 top-0 will-change-transform">
      <div :class="cursorDotVariants({ size })" />
    </div>
  </div>
</template>

<style>
/* `*` is needed because links and buttons set their own cursor. */
html.has-custom-cursor,
html.has-custom-cursor * {
  cursor: none !important;
}
</style>
