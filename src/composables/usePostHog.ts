// src/composables/usePostHog.ts
import posthog from 'posthog-js';
import { useUserStore } from '@/stores/user';

export function usePostHog() {
  posthog.init(import.meta.env.VITE_POSTHOG_API_KEY, {
    api_host: import.meta.env.VITE_POSTHOG_API_HOST,
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
