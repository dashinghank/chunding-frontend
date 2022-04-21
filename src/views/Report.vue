<script setup lang="ts">
import { onMounted } from "vue";
import { useStore } from "vuex";
const store = useStore();

onMounted(async () => {
  console.log("report");
});
</script>

<template>
  <div class="flex justify-center w-full h-screen">
    <div
      class="w-full max-w-[350px] sm:max-w-[750px] lg:max-w-[900px] 2xl:max-w-[1300px] mt-[10%]"
    >
      <div>Commision:{{ store.state.myCommision }}</div>
      <div
        class="w-11/12 mx-auto my-4 overflow-hidden border-2 rounded-md"
        v-for="order in store.state.myOrders"
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
