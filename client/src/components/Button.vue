<script lang="ts">
import { cva } from 'class-variance-authority'

export type ButtonVariant =
  | 'default'
  | 'destructive'
  | 'outline'
  | 'secondary'
  | 'ghost'
  | 'link'

export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon'

export const buttonVariants = cva(
  [
    'relative overflow-visible isolate',
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium',
    'transition-all duration-200',
    'ring-offset-background',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:scale-[0.97] active:duration-75',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  ].join(' '),
  {
    variants: {
      variant: {
        default:
          'border border-transparent bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:border-white/90 active:shadow-none',
        destructive:
          'border border-transparent bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:border-white/90 active:shadow-none',
        outline:
          'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground hover:border-white/90 active:shadow-none',
        secondary:
          'border border-transparent bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:border-white/90 active:shadow-none',
        ghost:
          'border border-transparent hover:bg-accent hover:text-accent-foreground hover:border-white/90 active:bg-accent/80',
        link:
          'text-primary underline-offset-4 hover:underline active:scale-100',
      } satisfies Record<ButtonVariant, string>,
      size: {
        default: 'h-9 px-4 py-2',
        sm:      'h-8 rounded-md px-3 text-xs',
        lg:      'h-10 rounded-md px-8',
        icon:    'h-9 w-9',
      } satisfies Record<ButtonSize, string>,
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)
</script>

<script setup lang="ts">
import { computed, ref } from 'vue'

defineOptions({ inheritAttrs: false })

interface Props {
  variant?: ButtonVariant
  size?: ButtonSize
  type?: 'button' | 'submit' | 'reset'
  as?: 'button' | 'a'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'button',
  as: 'button',
  variant: undefined,
  size: undefined,
})

const classes = computed(() =>
  buttonVariants({ variant: props.variant, size: props.size }),
)

// ---- Shatter/Crack Border Effect ----
const rootEl = ref<HTMLElement | null>(null)
let isAnimating = false

function triggerCrack() {
  if (!rootEl.value || isAnimating) return
  isAnimating = true

  const btn = rootEl.value
  const rect = btn.getBoundingClientRect()
  
  const canvas = document.createElement('canvas')
  const margin = 40
  const w = rect.width
  const h = rect.height
  
  canvas.width = w + margin * 2
  canvas.height = h + margin * 2
  canvas.style.cssText = `position:absolute; top:-${margin}px; left:-${margin}px; pointer-events:none; z-index:50;`
  btn.appendChild(canvas)

  const ctx = canvas.getContext('2d')
  // 👇 THE FIX: If ctx is null, we return. But TS needs us to capture it.
  if (!ctx) return
  const context = ctx // 👈 Now `context` is strictly typed and TS won't complain inside the closure

  const particles: { 
    x: number; y: number; 
    vx: number; vy: number; 
    length: number; angle: number; vAngle: number; 
    alpha: number 
  }[] = []

  const count = 80
  
  for (let i = 0; i < count; i++) {
    let px, py, vx, vy
    const side = Math.floor(Math.random() * 4)
    const speed = 2 + Math.random() * 4
    const jitter = (Math.random() - 0.5) * 2

    if (side === 0) { // Top
      px = margin + Math.random() * w
      py = margin
      vx = jitter
      vy = -speed
    } else if (side === 1) { // Right
      px = margin + w
      py = margin + Math.random() * h
      vx = speed
      vy = jitter
    } else if (side === 2) { // Bottom
      px = margin + Math.random() * w
      py = margin + h
      vx = jitter
      vy = speed
    } else { // Left
      px = margin
      py = margin + Math.random() * h
      vx = -speed
      vy = jitter
    }

    particles.push({
      x: px,
      y: py,
      vx: vx,
      vy: vy,
      length: 4 + Math.random() * 8,
      angle: Math.random() * Math.PI * 2,
      vAngle: (Math.random() - 0.5) * 0.4,
      alpha: 1
    })
  }

  function animate() {
    // 👇 Use `context` here instead of `ctx`
    context.clearRect(0, 0, canvas.width, canvas.height)
    
    let alive = false

    particles.forEach(p => {
      if (p.alpha <= 0) return
      alive = true

      p.x += p.vx
      p.y += p.vy
      p.vx *= 0.92
      p.vy *= 0.92
      p.angle += p.vAngle
      p.alpha -= 0.03

      context.save()
      context.translate(p.x, p.y)
      context.rotate(p.angle)
      
      context.beginPath()
      context.moveTo(-p.length / 2, 0)
      context.lineTo(p.length / 2, 0)
      context.strokeStyle = `rgba(255, 255, 255, ${p.alpha})`
      context.lineWidth = 1.5
      context.stroke()
      
      context.restore()
    })

    if (alive) {
      requestAnimationFrame(animate)
    } else {
      canvas.remove()
      isAnimating = false
    }
  }
  
  animate()
}
</script>

<template>
  <component
    ref="rootEl"
    :is="as"
    :type="as === 'button' ? type : undefined"
    :class="classes"
    v-bind="$attrs"
    @mouseenter="triggerCrack"
  >
    <slot />
  </component>
</template>