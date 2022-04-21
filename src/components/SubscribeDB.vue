<script setup lang="ts">
import { onMounted } from "@vue/runtime-core";
import { useStore } from "vuex";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
const store = useStore();
interface IProduct {
  default: number;
  handle: string;
  price: string;
  sku: string;
  vid: string;
}
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
interface IProductDefault {
  [key: string]: number;
}
const db = getFirestore();

onMounted(async () => {
  console.log("subscribeDB in");

  await getProducts();
  await getMyOrders();
  await getDownlinesOrderNCommsion();
  console.log("Hello", store.state);
});
async function getDownlinesOrderNCommsion() {
  const downlinesQuery = query(
    collection(db, "members"),
    where("parent", "==", store.state.uid)
  );

  const downlinesRef = await getDocs(downlinesQuery);

  if (!downlinesRef.empty) {
    var downlines: any = [];
    downlinesRef.forEach((doc) => {
      downlines.push({
        urlsuffix: doc.data().urlsuffix,
        nickname: doc.data().nickname,
      });
    });

    for (let i = 0; i < downlines.length; i++) {
      await getDownlinesProducts(downlines[i].urlsuffix);

      const downlineOrdersQuery = query(
        collection(db, "orders"),
        where("kolSuffix", "==", downlines[i].urlsuffix)
      );

      const ordersRef = await getDocs(downlineOrdersQuery);

      if (!ordersRef.empty) {
        var orders: any = {};
        ordersRef.forEach((doc) => {
          orders[doc.id] = doc.data() as IOrder;
        });

        var tempDownlinesOrders: any = {};
        tempDownlinesOrders[downlines[i].urlsuffix] = orders;
        tempDownlinesOrders = {
          ...tempDownlinesOrders,
          ...store.state.downlinesOrders,
        };
        store.commit("setDownlinesOrders", tempDownlinesOrders);
      }
    }

    Object.entries(store.state.downlinesOrders).forEach(([key, value]) => {
      var tempDownlinesCommisions = 0;
      var temp: any = {};

      Object.entries(value as any).forEach(([, vValue]) => {
        Object.entries((vValue as any).items).forEach(
          async ([iKey, iValue]) => {
            tempDownlinesCommisions +=
              store.state.downlinesProducts[key][iKey].price *
              (iValue as any).quantity *
              store.state.downlinesProducts[key][iKey].default;
            temp[key] = tempDownlinesCommisions;
            temp = {
              ...temp,
              ...store.state.downlinesCommisions,
            };
          }
        );
      });
      store.commit("setDownlinesCommisions", temp);
    });
  }
}
async function getDownlinesProducts(urlsuffix: string) {
  var productsRef = await getDocs(collection(getFirestore(), "products"));
  var tProducts: any = {};
  productsRef.forEach((doc) => {
    tProducts[doc.id] = doc.data() as IProduct;
  });
  let setDownlinesProducts = {
    ...store.state.downlinesProducts,
    [urlsuffix]: tProducts,
  };
  store.state.downlinesProducts;
  store.commit("setDownlinesProducts", setDownlinesProducts);

  const queryUser = query(
    collection(db, "members"),
    where("urlsuffix", "==", urlsuffix)
  );

  const userRef = await getDocs(queryUser);

  if (userRef.empty) {
    return;
  }

  userRef.forEach((doc) => {
    console.log("error:", doc.data().exceptionalProducts);
    if (doc.data().exceptionalProducts != undefined) {
      Object.entries(doc.data().exceptionalProducts as IProductDefault).forEach(
        async ([key, value]) => {
          var data = {
            urlsuffix: urlsuffix,
            productId: key,
            productDefault: value,
          };
          console.log("error here", key, value);
          store.commit("setExceptionalProducts", data);
        }
      );
    }
  });
}

async function getMyOrders() {
  const myOrdersQuery = query(
    collection(db, "orders"),
    where("kolSuffix", "==", store.state.uid),
    where("fullyPaid", "==", true)
  );
  const ordersRef = await getDocs(myOrdersQuery);
  if (!ordersRef.empty) {
    ordersRef.forEach((doc) => {
      var temp: any = {};
      temp[doc.id] = doc.data() as IOrder;
      temp = {
        ...temp,
        ...store.state.myOrders,
      };
      store.commit("setMyOrders", temp);
    });
  }
  var tempMyCommision = 0;
  Object.values(store.state.myOrders).forEach((order) => {
    Object.entries((order as any).items).forEach(([key, value]) => {
      tempMyCommision +=
        store.state.products[key].price *
        (value as any).quantity *
        store.state.products[key].default;
    });
  });
  store.commit("setMyCommision", tempMyCommision);
}

async function getProducts() {
  var productsRef = await getDocs(collection(getFirestore(), "products"));
  var products: any = {};
  productsRef.forEach((doc) => {
    products[doc.id] = doc.data() as IProduct;
    products = {
      ...products,
      ...store.state.products,
    };
    store.commit("setProducts", products);
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
    for (const [key, value] of Object.entries(
      doc.data().exceptionalProducts as IProductDefault
    )) {
      store.state.products[`${key}`].default = value;
    }
  });
}
</script>
<template><div>sub</div></template>
