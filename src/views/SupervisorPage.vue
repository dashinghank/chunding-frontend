<script setup lang="ts">
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import moment from "moment";

import { onMounted, ref } from "vue";
interface IOrder {
  amount: number;
  createdAt: number;
  customer: string;
  email: string;
  items: IItem[];
  name: string;
  id: string;
  kolSuffix: string;
  fullyPaid: boolean;
}

interface IOrders {
  [key: string]: IOrder;
}
interface IExceptionalProduct {
  [key: string]: number;
}
interface IMember {
  account: string;
  depth: number;
  exceptionalProducts: IExceptionalProduct;
  islocked: boolean;
  lastLoginDatetime: number;
  nickname: string;
  parent: string;
  password: string;
  registerDatetime: number;
  role: string;
  urlsuffix: string;
}
interface IMembers {
  [key: string]: IMember;
}
const allMembers = ref<IMembers>({});
const allOrders = ref<IOrders>({});
const db = getFirestore();
onMounted(async () => {
  const allOrdersQuery = query(
    collection(db, "orders"),
    where("fullyPaid", "==", true)
  );
  const allOrdersRef = await getDocs(allOrdersQuery);
  if (!allOrdersRef.empty) {
    allOrdersRef.forEach((doc) => {
      console.log(doc.id, doc.data() as IOrder);
      allOrders.value[doc.id] = doc.data() as IOrder;
    });
  }

  const allMembersQuery = query(collection(db, "members"));
  const allMembersRef = await getDocs(allMembersQuery);

  if (!allMembersRef.empty) {
    allMembersRef.forEach((doc) => {
      console.log(doc.id, doc.data());

      allMembers.value[doc.id] = doc.data() as IMember;
    });
  }
  console.log(allMembers.value);
});
</script>

<template>
  <div class="w-full h-screen flex items-center justify-center">
    <div class="px-4 sm:px-6 lg:px-8">
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h1 class="text-xl font-semibold text-gray-900">Users</h1>
          <p class="mt-2 text-sm text-gray-700">
            A list of all the users in your account including their name, title,
            email and role.
          </p>
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            Add user
          </button>
        </div>
      </div>
      <div class="mt-8 flex flex-col">
        <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div
            class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8"
          >
            <div
              class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg"
            >
              <table class="min-w-full divide-y divide-gray-300">
                <thead class="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      訂單金額
                    </th>
                    <th
                      scope="col"
                      class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      訂單創立時間
                    </th>
                    <th
                      scope="col"
                      class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      客戶名稱
                    </th>
                    <th
                      scope="col"
                      class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      客戶信箱
                    </th>

                    <th
                      scope="col"
                      class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      kolSuffix
                    </th>
                    <th
                      scope="col"
                      class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      訂單抽成
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">
                  <tr v-for="(order, index) in allOrders" :key="index">
                    <td
                      class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6"
                    >
                      {{ order.amount }}
                    </td>
                    <td
                      class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                    >
                      {{
                        moment(order.createdAt).format("YYYY/MM/DD HH:mm:ss")
                      }}
                    </td>
                    <td
                      class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                    >
                      {{ order.customer }}
                    </td>
                    <td
                      class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                    >
                      {{ order.email }}
                    </td>

                    <td
                      class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                    >
                      {{ order.kolSuffix }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style></style>
