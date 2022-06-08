<script lang="ts" setup>
import { ref, Ref, inject } from "vue";
import MemberTreeView from "@/components/MemberTreeView.vue";

defineProps({
  data: {
    type: Object,
    require: true,
    default: () => {},
  },
});

const isFold = ref(false) as Ref<boolean>;
const currentSelectMember = inject("currentSelectMember") as Ref<string>;
const onDownlineChangeClick = inject("onDownlineChangeClick") as Function;
</script>

<template>
  <div>
    <div class="flex items-center gap-2 cursor-pointer">
      <div v-if="data.children.length > 0" @click="isFold = !isFold">
        <div v-if="!isFold">+</div>
        <div v-if="isFold">-</div>
      </div>
      <div
        :class="currentSelectMember == data.id ? 'bg-yellow-200' : ''"
        class="px-2 border-2"
        @click="
          () => {
            isFold = !isFold;
            currentSelectMember = data.id;
            onDownlineChangeClick();
          }
        "
      >
        {{ data.id }}
      </div>
    </div>
    <div v-if="isFold">
      <template v-for="(value, index) in data.children" :key="index">
        <div class="my-2 ml-5">
          <MemberTreeView :data="value" />
        </div>
      </template>
    </div>
  </div>
</template>
