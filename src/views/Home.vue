<script setup lang="ts">
import { useStore } from "vuex";
const store = useStore();
</script>
<template>
  <div class="flex justify-center items-center w-full h-screen">
    <div>
      <div>這是你的推廣網址:</div>
      <div>
        https://chyuinding.myshopify.com/?kolsuffix={{ store.state.uid }}
      </div>
    </div>
  </div>
</template>

<style></style>
