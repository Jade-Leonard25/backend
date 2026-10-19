<script setup lang="ts">
withDefaults(defineProps<{ size?: number }>(), { size: 40 })
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Jade Leonard Miano Alvez logo"
    role="img"
  >
    <!-- rounded square border -->
    <rect x="1" y="1" width="38" height="38" rx="10" stroke="currentColor" stroke-width="2" />
    <!-- the J -->
    <path
      d="M27 10v15c0 3-2 5-5.5 5-3 0-5.5-1.5-6.5-4"
      stroke="currentColor"
      stroke-width="3"
      stroke-linecap="round"
      fill="none"
    />
    <!-- accent dot -->
    <circle cx="31" cy="9" r="3" fill="#dc2626" />
  </svg>
</template>