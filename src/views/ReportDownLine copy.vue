<script setup lang="ts">
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  updateDoc,
  doc,
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

const orders = ref<IOrders>({});
const downlinesOrders: any = ref();
// const downlines = ref();
onMounted(async () => {
  console.log("report in");

  console.log("myId", store.state.uid);
  const downlinesQuery = await query(
    collection(db, "members"),
    where("parent", "==", store.state.uid)
  );

  const downlinesRef = await getDocs(downlinesQuery);
  console.log("downlinesRef.empty:", downlinesRef.empty);

  if (!downlinesRef.empty) {
    console.log("找到下線了");
    var downlines: any = [];
    downlinesRef.forEach((doc) => {
      console.log("user data:", doc.id, doc.data());
      downlines.push(doc.data().urlsuffix);
    });
    console.log("downlinesasdadada", downlines);
  }
});
</script>

<template>
  <div class="w-full h-screen flex justify-center">
    <div
      class="w-full max-w-[350px] sm:max-w-[750px] lg:max-w-[900px] 2xl:max-w-[1300px] mt-[10%]"
    >
      <div
        class="w-11/12 mx-auto rounded-md border-2 overflow-hidden my-4"
        v-for="order in orders"
        :key="order.id"
      >
        <div class="w-full flex justify-between px-8 py-4 bg-gray-50">
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
