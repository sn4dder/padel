<script setup lang="ts">
import { ref, watch } from 'vue'
import { createStandingsImage } from '../standingsImage'
import type { Tournament } from '../types'
import BottomSheet from './BottomSheet.vue'

const open = defineModel<boolean>({ required: true })

const props = defineProps<{ tournament: Tournament }>()

const file = ref<File>()
const imageUrl = ref('')

watch(open, async isOpen => {
  if (!isOpen) return
  file.value = await createStandingsImage(props.tournament)
  URL.revokeObjectURL(imageUrl.value)
  imageUrl.value = URL.createObjectURL(file.value)
})

const onShare = () => {
  const data = { files: [file.value], text: 'Se her er dagens scores 🎾' }
  if (navigator.canShare?.(data)) {
    return navigator.share(data).catch(err => {
      if (err.name !== 'AbortError') throw err
    })
  }
  const link = document.createElement('a')
  link.href = imageUrl.value
  link.download = file.value.name
  link.click()
}
</script>

<template>
  <BottomSheet v-model="open" title="Del tabell">
    <div class="share-sheet">
      <div class="share-sheet__preview">
        <img v-if="imageUrl" :src="imageUrl" alt="Tabell" class="share-sheet__image" />
      </div>
      <button class="button button--primary button--block" :disabled="!file" @click="onShare">
        Del
      </button>
    </div>
  </BottomSheet>
</template>

<style lang="scss">
.share-sheet {
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__preview {
    max-height: 56dvh;
    overflow-y: auto;
    border-radius: var(--radius-md);
    background: var(--color-bg);
  }

  &__image {
    display: block;
    width: 100%;
    animation: pop-in 0.35s var(--ease-bounce);
  }
}
</style>
