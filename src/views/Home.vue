<script setup lang="ts">
import { onMounted, ref } from "@vue/runtime-core";
import { useStore } from "vuex";
import {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
var db = getFirestore();

const store = useStore();
interface IProduct {
  default: number;
  handle: string;
  price: string;
  sku: string;
  vid: string;
}

interface IProducts {
  [key: string]: IProduct;
}

interface IProductDefault {
  [key: string]: number;
}

const products = ref<IProducts>({});

onMounted(async () => {
  console.log("Hello", store.state.uid);
});
</script>

<template>
  <div>Home</div>
</template>

<style></style>
