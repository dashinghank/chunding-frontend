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
const downlinesOrders: any = ref({});
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
    var downlines: any = [
      {
        urlsuffix: "",
        nickname: "",
      },
    ];
    downlinesRef.forEach((doc) => {
      console.log("user data:", doc.id, doc.data());
      downlines.push({
        urlsuffix: doc.data().urlsuffix,
        nickname: doc.data().nickname,
      });
    });
    console.log("downlines", downlines);

    for (let i = 0; i < downlines.length; i++) {
      const downlineOrdersQuery = await query(
        collection(db, "orders"),
        where("kolSuffix", "==", downlines[i].urlsuffix)
      );

      const ordersRef = await getDocs(downlineOrdersQuery);
      console.log(ordersRef.empty);
      if (!ordersRef.empty) {
        var orders: any = {};
        ordersRef.forEach((doc) => {
          console.log("user data:", doc.id, doc.data());
          orders[doc.id] = doc.data() as IOrder;
          console.log("現在訂單:", orders);
        });

        downlinesOrders.value[downlines[i].nickname] = orders;
      }
    }
    console.log("downlinesOrders:", downlinesOrders.value);
  }
});
</script>

<template>
  <div class="flex justify-center w-full h-screen">
    <div
      class="w-full max-w-[350px] sm:max-w-[750px] lg:max-w-[900px] 2xl:max-w-[1300px] mt-[10%]"
    >
      <div
        class="p-8"
        v-for="(downline, key, index) in downlinesOrders"
        :key="downline.id"
      >
        <div>KOL:{{ key }}</div>
        <div
          class="w-11/12 mx-auto my-4 overflow-hidden border-2 rounded-md"
          v-for="order in downline"
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
  </div>
</template>

<style></style>
