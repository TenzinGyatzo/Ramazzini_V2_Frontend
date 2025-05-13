// src/composables/usePostHog.ts
import posthog from 'posthog-js';

export function usePostHog() {
  posthog.init('phc_CZiJHZrPDvm0N9BBuyVUvpbdGl9XuQ3xuGoGf3VcoHu', {
    api_host: 'https://us.i.posthog.com',
    capture_pageview: false,
    capture_pageleave: false,
  });

  return {
    posthog
  };
}
