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
interface IDownlinesComissions {
  [key: string]: number;
}

const orders = ref<IOrders>({});
const downlinesOrders: any = ref({});

const downlinesComissions = ref<IDownlinesComissions>({});
interface IProductDefault {
  [key: string]: number;
}
interface IProduct {
  default: number;
  handle: string;
  price: string;
  sku: string;
  vid: string;
}
// const downlines = ref();
onMounted(async () => {
  console.log("report in");
  // console.log("myId", store.state.uid);
  const downlinesQuery = await query(
    collection(db, "members"),
    where("parent", "==", store.state.uid)
  );

  const downlinesRef = await getDocs(downlinesQuery);

  if (!downlinesRef.empty) {
    console.log("找到下線了");
    var downlines: any = [];
    downlinesRef.forEach((doc) => {
      downlines.push({
        urlsuffix: doc.data().urlsuffix,
        nickname: doc.data().nickname,
      });
    });
    console.log("downlines", downlines);

    for (let i = 0; i < downlines.length; i++) {
      await getDownlinesProducts(downlines[i].urlsuffix);
      console.log("downlinesProducts", store.state.downlinesProducts);

      const downlineOrdersQuery = query(
        collection(db, "orders"),
        where("kolSuffix", "==", downlines[i].urlsuffix)
      );

      const ordersRef = await getDocs(downlineOrdersQuery);
      console.log(ordersRef.empty);
      if (!ordersRef.empty) {
        var orders: any = {};
        ordersRef.forEach((doc) => {
          orders[doc.id] = doc.data() as IOrder;
          console.log("現在訂單:", orders);
        });

        downlinesOrders.value[downlines[i].urlsuffix] = orders;
      }
    }
    // downlinesComissions.value +=
    //     store.state.products[key].price *
    //     value.quantity *
    //     store.state.products[key].default;

    console.log("downlinesOrders:", downlinesOrders.value);

    // store.state.downlinesProducts[downlines[i].urlsuffix];
    // Object.values(orders.value).forEach((order) => {
    //   Object.entries(order.items).forEach(([key, value]) => {
    //     myCommision.value +=
    //       store.state.products[key].price *
    //       value.quantity *
    //       store.state.products[key].default;
    //   });
    // });

    Object.entries(downlinesOrders.value).forEach(([key, value]) => {
      console.log("key", key);
      console.log("value", value);
      var tempDownlinesComissions = 0;
      Object.entries(value).forEach(([vKey, vValue]) => {
        // console.log("vKey", vKey);
        // console.log("vValue", vValue.items);

        Object.entries(vValue.items).forEach(async ([iKey, iValue]) => {
          // console.log("iKey", iKey);
          // console.log("iValue", iValue);

          tempDownlinesComissions +=
            store.state.downlinesProducts[key][iKey].price *
            iValue.quantity *
            store.state.downlinesProducts[key][iKey].default;
          downlinesComissions.value[key] = tempDownlinesComissions;
          console.log(
            "這次的單價",
            store.state.downlinesProducts[key][iKey].price
          );
          console.log("這次的數量", iValue.quantity);
          console.log(
            "這次的%數",
            store.state.downlinesProducts[key][iKey].default
          );
          console.log("這次的總收入", downlinesComissions.value);
        });
      });
    });
  }
});

async function getDownlinesProducts(urlsuffix: string) {
  console.log("getDownlinesProducts:", urlsuffix);
  var productsRef = await getDocs(collection(getFirestore(), "products"));
  var tProducts = {};
  productsRef.forEach((doc) => {
    // console.log("user data:", doc.id, doc.data());
    tProducts[doc.id] = doc.data() as IProduct;
  });
  let setDownlinesProducts = {
    ...store.state.downlinesProducts,
    [urlsuffix]: tProducts,
  };
  store.state.downlinesProducts;
  store.commit("setDownlinesProducts", setDownlinesProducts);

  console.log("這是下陷商品", store.state.downlinesProducts);
  const queryUser = query(
    collection(db, "members"),
    where("urlsuffix", "==", urlsuffix)
  );

  const userRef = await getDocs(queryUser);
  if (userRef.empty) {
    console.log("沒有找到使用者");
    return;
  }

  userRef.forEach((doc) => {
    console.log("測試:", doc.id, Object.keys(doc.data().exceptionalProducts));
    for (const [key, value] of Object.entries(
      doc.data().exceptionalProducts as IProductDefault
    )) {
      var data = {
        urlsuffix: urlsuffix,
        productId: key,
        productDefault: value,
      };
      store.commit("setExceptionalProducts", data);
    }
  });
}
</script>

<template>
  <div class="w-full h-screen flex justify-center">
    <div
      class="w-full max-w-[350px] sm:max-w-[750px] lg:max-w-[900px] 2xl:max-w-[1300px] mt-[10%]"
    >
      <div
        class="p-8"
        v-for="(downline, key, index) in downlinesOrders"
        :key="downline.id"
      >
        <div>KOL:{{ key }}:{{ downlinesComissions[key] }}</div>
        <div
          class="w-11/12 mx-auto rounded-md border-2 overflow-hidden my-4"
          v-for="order in downline"
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
  </div>
</template>

<style></style>
