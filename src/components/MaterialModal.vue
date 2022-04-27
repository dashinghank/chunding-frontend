<script setup lang="ts">
import { computed, ComputedRef, inject, ref } from "vue";
import {
  Dialog,
  DialogOverlay,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue";
import _ from "lodash";

const selectedId: any = inject("selectedId");
const materials: any = inject("materials");
const open: any = inject("open");

const types = computed(() => {
  return _.uniq(
    Object.values(materials.value).map((m: any) => {
      return m.type;
    })
  );
});

const tempMarterials: ComputedRef<any[]> = computed(() => {
  let _keyword = keyword.value.toLowerCase().trim();
  let _type = selectedtype.value;
  let _materials = materials.value;
  // currentIndex.value = 0;
  _materials =
    _type == "全類型"
      ? _materials
      : Object.values(_materials).filter((m: any) => {
          return m.type == _type;
        });

  if (_keyword === "") {
    _materials = Object.values(_materials);
  } else {
    _materials = Object.values(_materials).filter((m: any) => {
      return m.name.toLowerCase().includes(_keyword);
    });
  }

  return _materials;
});

const selectedtype = ref("全類型");
const keyword = ref("");

function onMaterialSelect(id: string) {
  selectedId.value = id;
  open.value = false;
}
</script>

<template>
  <TransitionRoot as="template" :show="open">
    <Dialog
      as="div"
      class="fixed z-50 inset-0 overflow-y-auto"
      @close="open = false"
    >
      <div
        class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
      >
        <TransitionChild
          as="template"
          enter="ease-out duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="ease-in duration-200"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <DialogOverlay
            class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          />
        </TransitionChild>

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
          <div
            class="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-x-hidden overflow-y-auto shadow-xl transform transition-all sm:my-8 sm:align-middle w-full sm:max-w-[750px] sm:w-full sm:p-6 h-[80vh]"
          >
            <!-- 選材質 -->
            <div class="max-w-sm">
              <label
                for="location"
                class="block text-sm font-medium text-gray-700"
                >分類</label
              >
              <select
                class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                v-model="selectedtype"
              >
                <option value="全類型" selected>全類型</option>
                <template v-for="(t, index) in types" :key="index">
                  <option :value="t">{{ t }}</option>
                </template>
              </select>
              <!-- 模糊搜尋欄位 -->

              <label class="mt-4 block text-md font-medium text-gray-700"
                >關鍵字</label
              >
              <div class="mt-1">
                <input
                  type="text"
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-md border-gray-300 rounded-md"
                  placeholder="輸入部分關鍵字"
                  v-model="keyword"
                />
              </div>
            </div>

            <!-- 表單選擇花材 -->
            <div class="px-4 sm:px-6 lg:px-8">
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
                              名稱
                            </th>
                            <th
                              scope="col"
                              class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                            >
                              類型
                            </th>
                            <th
                              scope="col"
                              class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                            >
                              當前庫存
                            </th>
                            <th
                              scope="col"
                              class="relative py-3.5 pl-3 pr-4 sm:pr-6"
                            >
                              <span class="sr-only">Edit</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 bg-white">
                          <tr v-for="m in tempMarterials" :key="m.id">
                            <td
                              class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6"
                            >
                              {{ m.name }}
                            </td>
                            <td
                              class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                            >
                              {{ m.type }}
                            </td>
                            <td
                              class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                            >
                              {{ m.amount }}
                            </td>

                            <td
                              class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6"
                            >
                              <button
                                class="text-indigo-600 hover:text-indigo-900 outline-none"
                                @click="onMaterialSelect(m.id)"
                              >
                                選擇
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- 表單選擇花材 END-->
          </div>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
