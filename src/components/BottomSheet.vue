<script setup lang="ts">
import { ref } from 'vue'

const open = defineModel<boolean>({ required: true })

defineProps<{ title?: string; subtitle?: string }>()

const root = ref<HTMLElement>()
const panel = ref<HTMLElement>()
const backdrop = ref<HTMLElement>()
const grabber = ref<HTMLElement>()

let isDragging = false
let startY = 0
let lastY = 0
let offset = 0
let isMovingDown = false

const setDragging = (value: boolean) => {
  isDragging = value
  root.value.classList.toggle('bottom-sheet--dragging', value)
}

const setOffset = (value: number) => {
  offset = value
  panel.value.style.transform = value ? `translateY(${value}px)` : ''
  backdrop.value.style.opacity = value ? `${1 - value / panel.value.offsetHeight}` : ''
}

const onDragStart = (event: PointerEvent) => {
  setDragging(true)
  startY = event.clientY
  lastY = event.clientY
  isMovingDown = false
  grabber.value.setPointerCapture(event.pointerId)
}

const onDrag = (event: PointerEvent) => {
  if (!isDragging) return
  if (Math.abs(event.clientY - lastY) > 2) {
    isMovingDown = event.clientY > lastY
    lastY = event.clientY
  }
  setOffset(Math.max(0, event.clientY - startY))
}

const onDragEnd = () => {
  setDragging(false)
  const shouldClose = isMovingDown && offset > 60
  setOffset(shouldClose ? panel.value.offsetHeight : 0)
  open.value = !shouldClose
}
</script>

<template>
  <Teleport to="body">
    <Transition name="bottom-sheet" :duration="350">
      <div v-if="open" ref="root" class="bottom-sheet">
        <div ref="backdrop" class="bottom-sheet__backdrop" @click="open = false" />
        <div ref="panel" class="bottom-sheet__panel">
          <div
            ref="grabber"
            class="bottom-sheet__grabber"
            @pointerdown="onDragStart"
            @pointermove="onDrag"
            @pointerup="onDragEnd"
            @pointercancel="onDragEnd"
          >
            <div class="bottom-sheet__handle" />
            <div v-if="title" class="bottom-sheet__header">
              <h2 class="bottom-sheet__title">{{ title }}</h2>
              <p v-if="subtitle" class="bottom-sheet__subtitle">{{ subtitle }}</p>
            </div>
          </div>
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss">
.bottom-sheet {
  position: fixed;
  inset: 0;
  z-index: 10;
  display: flex;
  align-items: flex-end;
  justify-content: center;

  &__backdrop {
    position: absolute;
    inset: 0;
    background: rgb(28 35 51 / 34%);
    transition: opacity 0.3s;
  }

  &__panel {
    position: relative;
    width: 100%;
    max-width: 560px;
    max-height: 88dvh;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 0 20px calc(24px + env(safe-area-inset-bottom));
    border-radius: 32px 32px 0 0;
    background: var(--color-surface);
    box-shadow: 0 -10px 40px rgb(28 35 51 / 12%);
    transition: transform 0.3s var(--ease-out);
  }

  &--dragging &__backdrop,
  &--dragging &__panel {
    transition: none;
  }

  &--dragging &__panel {
    will-change: transform;
  }

  &__grabber {
    position: sticky;
    top: 0;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    margin: 0 -20px;
    padding: 12px 20px 18px;
    background: var(--color-surface);
    cursor: grab;
    touch-action: none;
    user-select: none;
  }

  &__handle {
    width: 44px;
    height: 5px;
    border-radius: var(--radius-pill);
    background: #dde3ec;
  }

  &__header {
    text-align: center;
  }

  &__title {
    font-size: 21px;
    font-weight: 900;
  }

  &__subtitle {
    margin-top: 4px;
    color: var(--color-muted);
    font-size: 15px;
  }
}

.bottom-sheet-enter-active,
.bottom-sheet-leave-active {
  .bottom-sheet__backdrop {
    transition: opacity 0.3s;
  }

  .bottom-sheet__panel {
    transition: transform 0.35s var(--ease-out);
  }
}

.bottom-sheet-enter-from,
.bottom-sheet-leave-to {
  .bottom-sheet__backdrop {
    opacity: 0;
  }

  .bottom-sheet__panel {
    transform: translateY(100%);
  }
}
</style>
