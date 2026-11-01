import { useColorMode } from '@vueuse/core'

export const { store: theme } = useColorMode({
  attribute: 'data-theme',
  storageKey: 'padel-theme',
  onChanged: (mode, defaultHandler) => {
    defaultHandler(mode)
    const background = getComputedStyle(document.documentElement).getPropertyValue('--color-bg')
    document.querySelector('meta[name="theme-color"]').setAttribute('content', background.trim())
  },
})
