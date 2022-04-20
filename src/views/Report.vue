<script setup lang="ts">
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { onMounted, ref } from "vue";
import { useStore } from "vuex";
const store = useStore();
const db = getFirestore();

interface IItem {
  quantity: number;
  sku: string;
  title: string;
}
interface IOrder {
  amount: number;
  createdAt: number;
  customer: string;
  email: string;
  items: IItem[];
  name: string;
  id: string;
  kolSuffix: string;
}

interface IOrders {
  [key: string]: IOrder;
}

interface IProduct {
  default: number;
  handle: string;
  price: string;
  sku: string;
  vid: string;
}

interface IProductDefault {
  [key: string]: number;
}

const orders = ref<IOrders>({});
const myCommision = ref(0);

onMounted(async () => {
<<<<<<< HEAD
  const myOrdersQuery = query(
=======
  const myOrdersQuery = await query(
>>>>>>> 94bd7a4a8b46ec68885a91f61fc38979b46236a1
    collection(db, "orders"),
    where("kolSuffix", "==", store.state.uid),
    where("fullyPaid", "==", true)
  );

  console.log("store.state.uid", store.state.uid);
  const ordersRef = await getDocs(myOrdersQuery);
  console.log(ordersRef.empty);
  if (!ordersRef.empty) {
    ordersRef.forEach((doc) => {
      orders.value[doc.id] = doc.data() as IOrder;
    });
  }
  await getProducts();

  Object.values(orders.value).forEach((order) => {
    Object.entries(order.items).forEach(([key, value]) => {
      myCommision.value +=
        store.state.products[key].price *
        value.quantity *
        store.state.products[key].default;
    });
  });
});
async function getProducts() {
  var productsRef = await getDocs(collection(getFirestore(), "products"));

  productsRef.forEach((doc) => {
    // console.log("user data:", doc.id, doc.data());
    store.state.products[doc.id] = doc.data() as IProduct;
  });

  const queryUser = query(
    collection(db, "members"),
    where("urlsuffix", "==", store.state.uid)
  );
  const userRef = await getDocs(queryUser);
  if (userRef.empty) {
    return;
  }
  userRef.forEach((doc) => {
    console.log("測試:", doc.id, Object.keys(doc.data().exceptionalProducts));
    for (const [key, value] of Object.entries(
      doc.data().exceptionalProducts as IProductDefault
    )) {
      console.log("======================");
      console.log(`${key}: ${typeof value}`);
      console.log("======================");
      store.state.products[`${key}`].default = value;
    }
  });
}
</script>

<template>
  <div class="flex justify-center w-full h-screen">
    <div
      class="w-full max-w-[350px] sm:max-w-[750px] lg:max-w-[900px] 2xl:max-w-[1300px] mt-[10%]"
    >
      <div>Commision:{{ myCommision }}</div>
      <div
        class="w-11/12 mx-auto my-4 overflow-hidden border-2 rounded-md"
        v-for="order in orders"
        :key="order.id"
      >
        <div class="flex justify-between w-full px-8 py-4 bg-gray-50">
          <div>客戶 {{ order.customer }}</div>
          <div>訂單編號 {{ order.name }}</div>
        </div>
        <div class="w-7/12 grid grid-cols-[75%,25%] px-8 py-4 gap-8">
          <div>
            <div
              class="grid grid-cols-[80%,20%] py-2"
              v-for="(item, index) in order.items"
              :key="index"
            >
              <div>
                {{ item.title }}
              </div>
              <div>x{{ item.quantity }}</div>
            </div>
          </div>
          <div class="py-2">NT${{ order.amount }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style></style>
