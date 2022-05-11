import "firebase/firestore";
import "firebase/auth";

import {
  getFirestore,
  collection,
  // addDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

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
const db = getFirestore();

//======================管理者操作==========================
//取得下面層數的下線,depth=-1代表全部
// [{urlsuffix:"MY_UID"}] 取自己的下線
export async function getAllDownlines(downline: any[], depth: number) {
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
    return children;
  }
}

//======================通用操作==========================
//取得目前db中所有產品
export async function getAllProducts() {
  var productsRef = await getDocs(collection(db, "products"));
  var products: any = {};
  productsRef.forEach((doc) => {
    products[doc.id] = doc.data() as IProduct;
  });

  return products;
}

//取得目前db中所有訂單
export async function getOrdersByDateRange(
  urlsuffixs: string[],
  startDate: number,
  endDate: number
) {
  let myQuery = query(
    collection(db, "orders"),
    where("urlsuffix", "in", urlsuffixs),
    where("updatedAt", ">=", startDate),
    where("updatedAt", "<=", endDate)
  );

  let tempOrders: any[] = [];
  var ordersRef = await getDocs(myQuery);
  ordersRef.forEach((doc) => {
    let order = doc.data();
    tempOrders.push(order);
  });

  let orders: any = {};
  for (let i = 0; i < tempOrders.length; ++i) {
    if (orders[tempOrders[i].urlsuffix] == undefined) {
      orders[tempOrders[i].urlsuffix] = [];
    }
    orders[tempOrders[i].urlsuffix].push(tempOrders[i]);
  }

  return orders;
}
