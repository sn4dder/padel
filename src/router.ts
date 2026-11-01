import { createRouter, createWebHistory } from 'vue-router'
import { tournaments } from './store'
import Home from './views/Home.vue'
import Setup from './views/Setup.vue'
import Tournament from './views/Tournament.vue'

const findTournament = (id: string | string[]) =>
  tournaments.value.find(tournament => tournament.id === id)

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: Home },
    { path: '/ny', component: Setup },
    {
      path: '/turnering/:id',
      component: Tournament,
      beforeEnter: to => Boolean(findTournament(to.params.id)) || '/',
      props: route => ({ tournament: findTournament(route.params.id) }),
    },
  ],
  scrollBehavior: () => ({ top: 0 }),
})
