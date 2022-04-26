<script setup lang="ts">
import Navbar from "@/components/Navbar.vue";
import { useStore } from "vuex";
import { doc, onSnapshot, getFirestore } from "firebase/firestore";

const store = useStore();
const db = getFirestore();
// const unsub = onSnapshot(doc(db, "systems", "PDSZNaADdX1d7zqc4eUB"), (doc) => {
//   console.log("Current data: ", doc.data());
// });
</script>

<template>
  <Navbar class="absolute top-0 w-full" v-if="store.state.userInfo.uid != ''" />
  <router-view />
</template>

<style></style>
