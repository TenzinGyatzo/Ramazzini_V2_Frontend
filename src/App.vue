<script setup lang="ts">
import { useRoute } from 'vue-router';
import MainLayout from './layouts/MainLayout.vue';
import SimpleLayout from './layouts/SimpleLayout.vue';
import SessionLockScreen from './components/SessionLockScreen.vue';
import { useSessionTimeout } from './composables/useSessionTimeout';

const route = useRoute();
const { isLocked, unlockSession, lockedAt, timeoutMinutes } = useSessionTimeout();
</script>

<template>
  <component :is="route.meta.hideSidebar ? SimpleLayout : MainLayout" />
  
  <!-- Pantalla de bloqueo de sesión -->
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <SessionLockScreen
      v-if="isLocked"
      :locked-at="lockedAt ?? undefined"
      :timeout-minutes="timeoutMinutes"
      @unlock="unlockSession"
    />
  </Transition>
</template>

<style>
body {
  font-family: 'kanit', sans-serif;
}
</style>
