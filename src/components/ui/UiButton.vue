<script setup lang="ts">
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'pill' | 'accent'

withDefaults(
  defineProps<{
    variant?: ButtonVariant
    type?: 'button' | 'submit'
    disabled?: boolean
    size?: 'md' | 'sm'
  }>(),
  { variant: 'primary', type: 'button', disabled: false, size: 'md' },
)
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="inline-flex items-center justify-center gap-2 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:shadow-focus-ring"
    :class="[
      variant === 'pill' ? 'rounded-full px-3 py-1' : 'rounded-md',
      variant === 'pill' ? '' : size === 'sm' ? 'h-8 px-3' : 'h-9 px-4',
      disabled
        ? 'border border-line bg-overlay text-muted opacity-60'
        : variant === 'primary'
          ? 'bg-white text-canvas hover:bg-body'
          : variant === 'accent'
            ? 'bg-primary text-white hover:bg-primary-600'
            : variant === 'secondary'
              ? 'border border-line bg-transparent text-white hover:bg-raised'
              : variant === 'pill'
                ? 'border border-line bg-raised text-white hover:bg-overlay'
                : 'text-muted hover:text-white',
    ]"
  >
    <slot />
  </button>
</template>