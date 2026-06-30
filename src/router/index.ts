import { createRouter, createWebHashHistory } from 'vue-router';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'ProjectList',
      component: () => import('@/views/ProjectList.vue'),
    },
    {
      path: '/editor/:id',
      name: 'Editor',
      component: () => import('@/App.vue'),
    },
    {
      path: '/docs',
      name: 'Docs',
      component: () => import('@/views/DocsView.vue'),
    },
  ],
});

export default router;
