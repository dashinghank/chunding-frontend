<script setup lang="ts">
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

onMounted(async () => {
  await getAllReceiverData();
});

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
  <div>
    <div class="flex gap-5 items-center">
      <div class="h-fit">選取發送紅利對象:</div>
      <select v-model="selectedReceiver">
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
    <div v-show="!(selectedReceiver == '')">
      <div class="flex gap-5 items-center">
        <div>可以發送的紅利金額:</div>
        <input
          :value="
            selectedReceiver == ''
              ? 0
              : receivers[selectedReceiver].totalCommission -
                receivers[selectedReceiver].receivedCommission
          "
          disabled
        />
      </div>
      <div class="flex gap-5 items-center">
        <div>請輸入要發送的金額</div>
        <input
          type="number"
          v-model="sendAmount"
          @change="onAmountChange"
          min="0"
        />
      </div>
      <div class="pl-1">
        <button
          @click="sendAmountRequest"
          class="border-2 border-black px-5 py-1"
        >
          確定送出
        </button>
      </div>
    </div>
  </div>
</template>
