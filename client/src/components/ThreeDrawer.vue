<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import * as THREE from 'three'

const props = defineProps<{
  open: boolean
  title?: string
  description?: string
}>()

const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const drawerPanel = ref<HTMLElement | null>(null)
const canvasContainer = ref<HTMLElement | null>(null)
const transitionProgress = ref(0)

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let material: THREE.ShaderMaterial | null = null
let frameId = 0

// Focus trap
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.open) emit('update:open', false)
}

const initThree = () => {
  if (!canvasContainer.value || renderer) return

  const width = canvasContainer.value.clientWidth || window.innerWidth
  const height = canvasContainer.value.clientHeight || 400

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
  camera.position.z = 5

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  
  // Clear any old canvas elements
  canvasContainer.value.innerHTML = ''
  canvasContainer.value.appendChild(renderer.domElement)

  const geometry = new THREE.BufferGeometry()
  const count = 2000
  const positions = new Float32Array(count * 3)
  
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 10
    positions[i * 3 + 1] = (Math.random() - 0.5) * 3
    positions[i * 3 + 2] = (Math.random() - 0.5) * 2
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uColor: { value: new THREE.Color('#ef4444') }
    },
    vertexShader: `
      uniform float uTime;
      uniform float uProgress;
      varying float vElevation;
      void main() {
        vec3 pos = position;
        float wave1 = sin(pos.x * 2.0 + uTime * 1.5) * 0.2;
        float wave2 = cos(pos.y * 2.5 + uTime * 1.2) * 0.2;
        float elevation = (wave1 + wave2);
        pos.z += elevation + (uProgress * 1.5);
        vElevation = elevation;
        gl_PointSize = 4.0 + elevation * 5.0;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying float vElevation;
      void main() {
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;
        float alpha = smoothstep(0.0, 0.3, 1.0 - dist) * (0.6 + vElevation);
        gl_FragColor = vec4(uColor * (0.5 + vElevation), alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  })

  const particles = new THREE.Points(geometry, material)
  scene.add(particles)

  const clock = new THREE.Clock()
  const animate = () => {
    frameId = requestAnimationFrame(animate)
    const elapsedTime = clock.getElapsedTime()
    if (material) material.uniforms.uTime.value = elapsedTime
    if (material) material.uniforms.uProgress.value += (transitionProgress.value - material.uniforms.uProgress.value) * 0.05
    if (renderer && scene && camera) renderer.render(scene, camera)
  }
  animate()
}

const destroyThree = () => {
  cancelAnimationFrame(frameId)
  if (renderer) {
    renderer.dispose()
    renderer.forceContextLoss()
    renderer = null
  }
  if (canvasContainer.value) {
    canvasContainer.value.innerHTML = ''
  }
}

watch(() => props.open, async (isOpen) => {
  transitionProgress.value = isOpen ? 1 : 0
  if (isOpen) {
    await nextTick() // Wait for DOM to slide up
    drawerPanel.value?.focus()
    initThree() // Create WebGL context
  } else {
    // Small delay to let the slide-down animation finish before destroying
    setTimeout(destroyThree, 500) 
  }
})

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  destroyThree()
})
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <div
      v-if="open"
      class="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm transition-opacity duration-300"
      @click="emit('update:open', false)"
    />

    <!-- Drawer Panel -->
    <div
      ref="drawerPanel"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
      class="fixed inset-x-0 bottom-0 z-[101] flex flex-col rounded-t-[20px] border-t border-border bg-[#0a0404] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] outline-none transition-transform duration-500 ease-in-out min-h-[350px]"
      :class="{ 'translate-y-0 pointer-events-auto': open, 'translate-y-full pointer-events-none': !open }"
    >
      <!-- Three.js Canvas Background -->
      <div ref="canvasContainer" class="absolute inset-0 z-0 overflow-hidden rounded-t-[20px] pointer-events-none" />
      
      <!-- Content Wrapper -->
      <div class="relative z-10 flex flex-col p-6 h-full">
        <div class="mx-auto mb-6 h-1.5 w-12 rounded-full bg-white/20" />

        <header class="mb-4">
          <h2 v-if="title" class="text-xl font-semibold text-white">{{ title }}</h2>
          <p v-if="description" class="text-sm text-muted-foreground">{{ description }}</p>
        </header>

        <slot />

        <footer class="mt-6 flex flex-col gap-3">
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </Teleport>
</template>