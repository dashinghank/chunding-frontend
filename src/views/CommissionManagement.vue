<script setup lang="ts">
import _ from "lodash";
import moment from "moment";
import axios from "axios";
import { useStore } from "vuex";
import { onMounted, ref } from "vue";
import {
  getFirestore,
  getDocs,
  query,
  collection,
  where,
} from "firebase/firestore";
const store = useStore();
const db = getFirestore();
const sendAmount = ref(0);
const receivers: any = ref({});
const selectedReceiver = ref("");
const allCommissionRecords = ref();
onMounted(async () => {
  await getAllReceiverData();
  //get all commission records

  await getAllCommissionRecords();
  allCommissionRecords.value = _.orderBy(
    allCommissionRecords.value,
    "datetime",
    "desc"
  );
  allCommissionRecords.value = allCommissionRecords.value.slice(0, 100);
  console.log(allCommissionRecords.value);
});

async function getAllCommissionRecords() {
  let allCommissionRecordsSnapshot = await getDocs(
    query(collection(db, "records"))
  );
  allCommissionRecords.value = allCommissionRecordsSnapshot.docs.map(
    (doc: any) => {
      return {
        id: doc.id,
        ...doc.data(),
      };
    }
  );
}

async function getAllReceiverData() {
  const memberQuery = await query(
    collection(db, "members"),
    where("totalCommission", ">", 0)
  );
  const memberSnapshot = await getDocs(memberQuery);

  console.log("memberSnapshot:", memberSnapshot.empty);

  if (!memberSnapshot.empty) {
    memberSnapshot.forEach((d) => {
      console.log(d.id, d.data());
      receivers.value[d.data().urlsuffix] = d.data();
    });
  }
}

function onAmountChange() {
  console.log("onAmountChange");

  let max =
    selectedReceiver.value == ""
      ? 0
      : receivers.value[selectedReceiver.value].totalCommission -
        receivers.value[selectedReceiver.value].receivedCommission;

  sendAmount.value = sendAmount.value > max ? max : sendAmount.value;
}

function clearAllInputs() {
  sendAmount.value = 0;
  selectedReceiver.value = "";
}

async function sendAmountRequest() {
  let max =
    selectedReceiver.value == ""
      ? 0
      : receivers.value[selectedReceiver.value].totalCommission -
        receivers.value[selectedReceiver.value].receivedCommission;

  if (
    sendAmount.value < 1 ||
    sendAmount.value > max ||
    selectedReceiver.value == ""
  ) {
    alert("請確認送出的資料");
    return;
  }
  if (!confirm("是否確定要送出?")) return;
  console.log("send");
  try {
    let result = await axios.post(
      "https://shopify-api-nine.vercel.app/api/sendCommission",
      {
        amount: sendAmount.value,
        receiver: selectedReceiver.value,
        sender: store.state.userInfo.account,
      }
    );
    console.log("result:", result);
    console.log(receivers.value);

    receivers.value[selectedReceiver.value].receivedCommission +=
      sendAmount.value;

    clearAllInputs();
  } catch (error) {
    console.log(error);
  }
}
</script>
<template>
  <div class="container mx-auto px-5">
    <div class="w-full mx-auto max-w-xl">
      <div class="w-full">
        <label for="location" class="block text-sm font-medium text-gray-700"
          >選取發送紅利對象</label
        >
        <select
          class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          v-model="selectedReceiver"
        >
          <option value="" selected disabled>請選取發送對象</option>
          <option
            v-for="(receiver, k, i) in receivers"
            :key="k"
            :value="receiver.urlsuffix"
          >
            {{ receiver.nickname }}/{{ receiver.urlsuffix }}
          </option>
        </select>
      </div>

      <div class="w-full py-4">
        <label for="email" class="block text-sm font-medium text-gray-700"
          >可以發送的紅利金額</label
        >
        <div class="mt-1">
          <input
            disabled
            type="number"
            :value="
              selectedReceiver == ''
                ? 0
                : receivers[selectedReceiver].totalCommission -
                  receivers[selectedReceiver].receivedCommission
            "
            class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div class="w-full">
        <label for="email" class="block text-sm font-medium text-gray-700"
          >請輸入要發送的金額</label
        >
        <div class="mt-1">
          <input
            class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            :disabled="selectedReceiver == ''"
            type="number"
            v-model="sendAmount"
            @change="onAmountChange"
            min="0"
          />
        </div>
      </div>

      <div class="py-4">
        <button
          @click="sendAmountRequest"
          type="button"
          class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          確定送出
        </button>
      </div>
    </div>
    <div class="mt-12">
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h1 class="text-xl font-semibold text-gray-900">紅利發送紀錄</h1>
          <!-- <p class="mt-2 text-sm text-gray-700">
              A list of all the users in your account including their name,
              title, email and role.
            </p> -->
        </div>
      </div>
      <div class="flex flex-col mt-8">
        <div class="-my-2 overflow-x-auto">
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
                      發送時間
                    </th>
                    <th
                      scope="col"
                      class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      暱稱 / 帳號
                    </th>
                    <th
                      scope="col"
                      class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      發送金額
                    </th>
                    <th
                      scope="col"
                      class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      發送管理員
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr
                    v-for="(record, index) in allCommissionRecords"
                    :key="index"
                  >
                    <td
                      class="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 whitespace-nowrap sm:pl-6"
                    >
                      {{
                        moment(record.datetime).format("YYYY/MM/DD HH:mm:ss")
                      }}
                    </td>
                    <td
                      class="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 whitespace-nowrap sm:pl-6"
                    >
                      {{ record.receiver }}
                    </td>

                    <td
                      class="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 whitespace-nowrap sm:pl-6"
                    >
                      {{ record.amount }}
                    </td>
                    <td
                      v-if="store.state.userInfo.role == 'admin'"
                      class="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 whitespace-nowrap sm:pl-6"
                    >
                      {{ record.sender }}
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
