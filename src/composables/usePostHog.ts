// src/composables/usePostHog.ts
import posthog from 'posthog-js';
import { useUserStore } from '@/stores/user';

export function usePostHog() {
  posthog.init('phc_CZiJHZrPDvm0N9BBuyVUvpbdGl9XuQ3xuGoGf3VcoHu', {
    api_host: 'https://us.i.posthog.com',
    capture_pageview: false,
    capture_pageleave: false,
  });

    function identifyUser() {
    const userStore = useUserStore();
    const user = userStore.user;

    if (user) {
        
      posthog.identify(user._id, {
        id: user._id,
        username: user.username, 
        email: user.email,
        identifier: `${user.username} (${user.email})`,
        role: user.role
      });
    }
  }

  return {
    posthog,
    identifyUser,
  };
}
