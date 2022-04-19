<script setup lang="ts">
import Navbar from "@/components/Navbar.vue";
import { useStore } from "vuex";

const store = useStore();
</script>

<template>
  <Navbar class="absolute top-0 w-full" v-if="store.state.uid != ''" />

  <router-view />
</template>

<style></style>
