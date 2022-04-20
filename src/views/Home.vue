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
interface IProductsDefault {
  [key: string]: number;
}
const productsDefault = ref<IProductsDefault>({});
const products = ref<IProducts>({});

onMounted(async () => {
  console.log("Hello", store.state.uid);
  await getProducts();
  console.log("productsDefault:", productsDefault.value);

  const queryUser = query(
    collection(db, "members"),
    where("urlsuffix", "==", store.state.uid)
  );

  //帳號重複
  const userRef = await getDocs(queryUser);
  if (userRef.empty) {
    return;
  }
  userRef.forEach((doc) => {
    console.log("user data:", doc.id, doc.data());
    store.state.exceptionalProducts = doc.data().exceptionalProducts;
  });
});
async function getProducts() {
  var productsRef = await getDocs(collection(getFirestore(), "products"));

  productsRef.forEach((doc) => {
    console.log("user data:", doc.id, doc.data());
    products.value[doc.id] = doc.data() as IProduct;
    productsDefault.value[doc.id] = doc.data().default;
  });
}
</script>

<template>
  <div>Home</div>
</template>

<style></style>
