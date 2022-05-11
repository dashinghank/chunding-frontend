<script setup lang="ts">
import { onMounted, Ref, ref } from "vue";
import { Chart, registerables } from "chart.js";
import { useStore } from "vuex";

import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue";
import _ from "lodash";

import { CheckIcon } from "@heroicons/vue/outline";
import { inject } from "vue";
import tr from "date-fns/esm/locale/tr/index.js";
Chart.register(...registerables);
const store = useStore();

const doughnutCanvas = ref();
const commissionDetail = inject<Ref<any>>("commissionDetail");
const open = inject<Ref<boolean>>("dsIsOpen");
onMounted(() => {
  console.log("donwlineCOM in");
  console.log(store.state.downlines);
});

function isSelf(key: any) {
  if (key == store.state.userInfo.urlsuffix) {
    return true;
  } else {
    return false;
  }
}
</script>
<template>
  <TransitionRoot as="template" :show="open">
    <Dialog as="div" class="relative z-10" @close="open = false">
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div
          class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        />
      </TransitionChild>

      <div class="fixed z-10 inset-0 overflow-y-auto">
        <div
          class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
        >
          <!-- This element is to trick the browser into centering the modal contents. -->
          <span
            class="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
            >&#8203;</span
          >
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel
              class="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6"
            >
              <div v-for="(com, key, index) in commissionDetail" :key="index">
                <div class="p-1" v-if="isSelf(key)">
                  {{ store.state.userInfo.nickname }}:{{ com }}
                </div>
                <div class="p-1" v-if="!isSelf(key)">
                  {{ store.state.downlines[key].nickname }}:{{ com }}
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
