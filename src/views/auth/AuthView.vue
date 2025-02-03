<script setup>
    /* const authRoutes = [
        { name: 'onboarding', text: 'Crear cuenta' },
        { name: 'login', text: 'Iniciar Sesión' },
    ] */
</script>

<template>
  <div class="mx-auto w-full max-w-sm mt-20">
    <RouterView />

<!--     <nav class="mt-10 flex flex-col items-center space-y-5 lg:flex-row lg:justify-between lg:space-y-0">
        <RouterLink
            v-for="authRoute in authRoutes"
            class="font-medium text-gray-800"
            :to="{name: authRoute.name}"
        >{{ authRoute.text }}</RouterLink>
    </nav> -->
  </div>
</template>