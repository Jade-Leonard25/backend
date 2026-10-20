<script lang="ts">
import { cva } from "class-variance-authority";

export const cardVariants = cva(
  "bg-card text-card-foreground flex flex-col rounded-xl border shadow-sm",
  {
    variants: {
      size: {
        default: "gap-6 py-6",
        sm: "gap-4 py-4",
      },
    },
    defaultVariants: { size: "default" },
  },
);
</script>

<script setup lang="ts">
import { computed } from "vue";
import { cn } from "../lib/utils";

interface Props {
  title?: string;
  description?: string;
  size?: "default" | "sm";
  headerClass?: string;
  contentClass?: string;
  footerClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: "default",
});

const classes = computed(() => cardVariants({ size: props.size }));

// show the header if any of these are present
const hasHeader = computed(
  () =>
    props.title ||
    props.description ||
    // slot presence is checked in template via $slots
    false,
);
</script>

<template>
  <div :class="cn(classes, $attrs.class)" v-bind="{ ...$attrs, class: undefined }">
    <!-- HEADER -->
    <div
      v-if="hasHeader || $slots.header || $slots.title || $slots.description || $slots.action"
      :class="
        cn(
          'grid auto-rows-min items-start gap-1.5 px-6',
          $slots.action && 'grid-cols-[1fr_auto]',
          headerClass,
        )
      "
    >
      <!-- full header override -->
      <slot name="header">
        <div class="space-y-1.5">
          <slot name="title">
            <h3 v-if="title" class="font-semibold leading-none">{{ title }}</h3>
          </slot>
          <slot name="description">
            <p v-if="description" class="text-muted-foreground text-sm">{{ description }}</p>
          </slot>
        </div>
        <div
          v-if="$slots.action"
          class="col-start-2 row-span-2 row-start-1 self-start justify-self-end"
        >
          <slot name="action" />
        </div>
      </slot>
    </div>

    <!-- BODY -->
    <div :class="cn('px-6', contentClass)">
      <slot name="content">
        <slot />
      </slot>
    </div>

    <!-- FOOTER -->
    <div v-if="$slots.footer" :class="cn('flex items-center px-6', footerClass)">
      <slot name="footer" />
    </div>
  </div>
</template>
