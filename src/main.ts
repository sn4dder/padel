import '@fontsource-variable/nunito'
import './styles/main.scss'
import './theme'
import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'

createApp(App).use(router).mount('#app')
