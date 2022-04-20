<script setup lang="ts">
import { onMounted } from "@vue/runtime-core";
import { useStore } from "vuex";

const store = useStore();

onMounted(async () => {
  console.log("Hello", store.state.uid);
});
</script>

<template>
  <div>Home</div>
</template>

<style></style>
