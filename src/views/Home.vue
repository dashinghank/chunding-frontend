<script setup lang="ts">
// import { onMounted } from "vue";
import { useStore } from "vuex";
const store = useStore();
</script>
<template>
  <div class="container flex mx-auto mt-20">
    <div>
      <div>這是你的推廣網址:</div>
      <div class="bg-gray-200">
        https://chyuinding.myshopify.com/?kolsuffix={{
          store.state.userInfo.urlsuffix
        }}
      </div>
      <div class="mt-5">
        <label>身分:</label>
        <div>{{ store.state.userInfo.role }}</div>
      </div>
    </div>
  </div>
</template>

<style></style>
