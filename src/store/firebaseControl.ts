import "firebase/firestore";
import "firebase/auth";
import axios from "axios";

import {
  getFirestore,
  collection,
  // addDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  getDoc,
  doc,
} from "firebase/firestore";
import store from ".";

// import moment from "moment";
// import ShortUniqueId from "short-unique-id";

interface IProduct {
  default: number;
  handle: string;
  price: string;
  sku: string;
  vid: string;
}

// const uid = new ShortUniqueId({ length: 10 });

//======================管理者操作==========================
//取得下面層數的下線,depth=-1代表全部
// [{urlsuffix:"MY_UID"}] 取自己的下線
export async function getAllDownlines(downline: any[], depth: number) {
  let db = getFirestore();
  if (depth > 0) depth--;
  let children: any[] = [];
  for (let i = 0; i < downline.length; ++i) {
    let myQuery = query(
      collection(db, "members"),
      where("parent", "==", downline[i].urlsuffix)
    );
    var usersRef = await getDocs(myQuery);
    usersRef.forEach((doc) => {
      let downline = { docId: doc.id, ...doc.data() };
      children.push(downline);
    });

    let result: any[] = [];
    if (children.length > 0 && (depth > 0 || depth == -1)) {
      result = (await getAllDownlines(children, depth)) as any[];
      children = [...children, ...result];
    }
  }
  return children;
}

//======================通用操作==========================
//取得目前db中所有產品
export async function getAllProducts() {
  let db = getFirestore();
  var products: any = {};

  let currentSystems = store.state.systems;
  let remotesystemsProducts = (
    await getDoc(doc(db, "systems", "products"))
  ).data() as any;
  if (currentSystems.products == remotesystemsProducts.lastUpdateDatetime) {
    console.log("產品狀態為最新");
    products = store.state.allProducts;
  } else {
    console.log("更新產品");
    var productsRef = await getDocs(collection(db, "products"));
    productsRef.forEach((doc) => {
      products[doc.id] = doc.data() as IProduct;
    });

    currentSystems.products = remotesystemsProducts.lastUpdateDatetime;
    store.commit("setSystems", currentSystems);
  }

  return products;
}

//取得目前db中所有訂單
export async function getOrdersByDateRange(
  urlsuffixs: string[],
  startDate: number,
  endDate: number
) {
  let res: any = await axios.post(
    "https://shopify-api-nine.vercel.app/api/getOrders",
    {
      urlsuffixs,
      startDate,
      endDate,
    }
  );
  let tempOrders = res.data;

  let orders: any = {};
  for (let i = 0; i < tempOrders.length; ++i) {
    if (orders[tempOrders[i].urlsuffix] == undefined) {
      orders[tempOrders[i].urlsuffix] = [];
    }
    orders[tempOrders[i].urlsuffix].push(tempOrders[i]);
  }

  return orders;
}
