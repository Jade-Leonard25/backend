<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  WebGLRenderer,
} from 'three'

const props = withDefaults(defineProps<{ color?: string | number }>(), {
  color: 0xdc2626,
})

const canvas = ref<HTMLCanvasElement | null>(null)
let cleanup: (() => void) | null = null

onMounted(() => {
  const el = canvas.value
  if (!el) return

  let renderer: WebGLRenderer
  try {
    renderer = new WebGLRenderer({
      canvas: el,
      alpha: true,
      antialias: true,
      powerPreference: 'low-power',
    })
  } catch {
    return // WebGL unavailable: the page still works without the background
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const isSmall = window.innerWidth < 768
  const color = new Color(props.color)

  const scene = new Scene()
  const camera = new PerspectiveCamera(75, 1, 0.1, 100)
  camera.position.z = 5

  // --- Particle field (fewer points on small screens) ---
  const count = isSmall ? 700 : 1800
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < positions.length; i++) positions[i] = (Math.random() - 0.5) * 15

  const pGeo = new BufferGeometry()
  pGeo.setAttribute('position', new BufferAttribute(positions, 3))
  const pMat = new PointsMaterial({
    color,
    size: 0.018,
    transparent: true,
    opacity: 0.55,
    blending: AdditiveBlending,
    depthWrite: false,
  })
  const particles = new Points(pGeo, pMat)
  scene.add(particles)

  // --- Wireframe icosahedron ---
  const wGeo = new IcosahedronGeometry(1.6, 1)
  const wMat = new MeshBasicMaterial({
    color,
    wireframe: true,
    transparent: true,
    opacity: 0.22,
  })
  const wireframe = new Mesh(wGeo, wMat)
  scene.add(wireframe)

  const render = () => renderer.render(scene, camera)

  // --- Sizing: driven by the canvas itself, not window events ---
  const resize = () => {
    const w = el.clientWidth || window.innerWidth
    const h = el.clientHeight || window.innerHeight
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(w, h, false) // false: leave CSS sizing to Tailwind
    camera.aspect = w / h
    camera.updateProjectionMatrix()

    // On wide screens, move the shape right so it isn't behind the headline
    const wide = camera.aspect > 1.2
    wireframe.position.x = wide ? 2.6 : 0
    wireframe.scale.setScalar(wide ? 1 : 0.75)

    if (reduceMotion) render() // static frame, no loop
  }
  const ro = new ResizeObserver(resize)
  ro.observe(el)

  // --- Input ---
  const pointer = { x: 0, y: 0 }
  let scrollTarget = 0
  let scrollCurrent = 0

  const onPointerMove = (e: PointerEvent) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1
  }
  const onScroll = () => {
    scrollTarget = window.scrollY
  }
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  window.addEventListener('scroll', onScroll, { passive: true })

  // --- Animation (time-based, so speed is the same at 60Hz and 144Hz) ---
  let frameId = 0
  let last = performance.now()

  const animate = (now: number) => {
    frameId = requestAnimationFrame(animate)
    const dt = Math.min((now - last) / 1000, 0.1) // clamp after tab switches
    last = now

    particles.rotation.y += 0.024 * dt
    particles.rotation.x += 0.009 * dt
    wireframe.rotation.x += 0.108 * dt
    wireframe.rotation.y += 0.168 * dt

    const follow = 1 - Math.exp(-dt * 2.5)
    scrollCurrent += (scrollTarget - scrollCurrent) * (1 - Math.exp(-dt * 4))
    const scrollOffset = Math.min(scrollCurrent * 0.0006, 2)

    camera.position.x += (pointer.x * 0.4 - camera.position.x) * follow
    camera.position.y += (pointer.y * 0.4 - scrollOffset - camera.position.y) * follow
    camera.lookAt(0, 0, 0)

    render()
  }
  if (!reduceMotion) frameId = requestAnimationFrame(animate)

  cleanup = () => {
    cancelAnimationFrame(frameId)
    ro.disconnect()
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('scroll', onScroll)
    pGeo.dispose()
    pMat.dispose()
    wGeo.dispose()
    wMat.dispose()
    renderer.dispose()
    renderer.forceContextLoss()
  }
})

onBeforeUnmount(() => cleanup?.())
</script>

<template>
  <canvas
    ref="canvas"
    class="pointer-events-none fixed inset-0 z-0 h-full w-full"
    aria-hidden="true"
  />
</template>