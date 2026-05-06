<template>
  <div class="h-screen">
    <NavBar />
    <RouterView />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
// import NavBar from '@/components/NavBar.vue' - precisaria esta declarado, ma estamos usando o plugin de autoimport componentes
</script>
