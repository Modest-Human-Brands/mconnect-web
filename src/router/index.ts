import { createRouter, createWebHistory } from 'vue-router'

import { useCrmStore } from '@/stores/crm'
import { CLIENT_STEPS } from '@/stores/clientWizard'
import { EMAIL_STEPS, useEmailWizardStore } from '@/stores/emailWizard'
import { MEETING_STEPS } from '@/stores/meetingWizard'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: () => (useCrmStore().onboarded ? '/clients' : '/onboarding') },
    { path: '/onboarding', component: () => import('@/views/OnboardingView.vue') },
    { path: '/clients', component: () => import('@/views/ClientsView.vue') },
    { path: '/inbox/:id?', component: () => import('@/views/InboxView.vue') },

    {
      path: EMAIL_STEPS[0].path,
      name: 'email-template',
      component: () => import('@/views/email/TemplateStep.vue'),
    },
    {
      path: EMAIL_STEPS[1].path,
      name: 'email-details',
      component: () => import('@/views/email/DetailsStep.vue'),
    },
    {
      path: EMAIL_STEPS[2].path,
      name: 'email-review',
      component: () => import('@/views/email/ReviewStep.vue'),
    },

    { path: MEETING_STEPS[0].path, component: () => import('@/views/meeting/TypeStep.vue') },
    { path: MEETING_STEPS[1].path, component: () => import('@/views/meeting/DetailsStep.vue') },
    { path: MEETING_STEPS[2].path, component: () => import('@/views/meeting/ReviewStep.vue') },

    { path: CLIENT_STEPS[0].path, component: () => import('@/views/client/SourceStep.vue') },
    { path: CLIENT_STEPS[1].path, component: () => import('@/views/client/DetailsStep.vue') },
    { path: CLIENT_STEPS[2].path, component: () => import('@/views/client/ReviewStep.vue') },

    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach((to) => {
  if (to.name === 'email-details' || to.name === 'email-review') {
    if (!useEmailWizardStore().templateId) return EMAIL_STEPS[0].path
  }
  return true
})

export default router