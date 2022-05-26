<script setup lang="ts">
import { inject, Ref } from "vue";
let isShowMask = inject("isShowMask") as Ref<boolean>;
</script>
<template>
  <div
    v-if="isShowMask"
    class="fixed top-0 left-0 z-50 flex items-center justify-center w-screen h-screen"
  >
    <div class="absolute w-full h-[200vh] bg-gray-600 opacity-70"></div>
    <svg
      class="w-20 h-20 mr-3 -ml-1 text-white animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  </div>
</template>
