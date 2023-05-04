<template>
  <div class="md:container md:w-50 md:mx-auto bg-base-200">
    <div class="flex items-start justify-start">
      <div class="container mx-auto">
        <div class="overflow-x-auto mt-7 border-base-100 border-2 rounded-xl shadow-2xl">
          <table class="table table-compact w-full">
            <thead>
            <tr>
              <th></th>
              <th>Phone Number</th>
              <th>Call Purpose</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(item, index) in currentPageResults" :key="item">
              <th>{{ index }}</th>
              <td>{{ item[0] }}</td>
              <td>{{ item[1] }}</td>
            </tr>
            </tbody>
          </table>
        </div>
        <div class="mt-2 flex align-center justify-center btn-group">
          <button class="btn" :disabled="getCurrentPage() === 0 || getCurrentPage() === 1" @click="goToPrevPage">«</button>
          <button class="btn">Page {{ getCurrentPage().toLocaleString("en-US") }} of {{ totalPages.toLocaleString("en-US") }}</button>
          <button class="btn" :disabled="getCurrentPage() === totalPages" @click="goToNextPage">»</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed, ref, watch} from "vue";

const props = defineProps(['phoneNumbers', 'processing', 'requestSubmitted']);
const currentPage = ref(0);
const pageSize = ref(10);
const currentPageResults = ref([] as any[]);

const phoneNumberArr = computed(() => {
  return [ ...props.phoneNumbers.entries() ];
})

watch(phoneNumberArr, () => {
  currentPage.value = 0;
  generatePage();
})

const totalPages = computed(() => {
  return Math.floor(props.phoneNumbers.size / pageSize.value)
})

function getCurrentPage(): number {
  return (totalPages.value > 0 ? currentPage.value + 1 : 0)
}

function goToPrevPage(): void {
  if (currentPage.value === 0) {
    return;
  }

  currentPage.value--;
  generatePage();
}

function goToNextPage(): void {
  if (currentPage.value === totalPages.value) {
    return;
  }

  currentPage.value++;
  generatePage();
}

function generatePage(): void {
  const pageStart = pageSize.value * currentPage.value;
  const pageEnd = pageStart + pageSize.value;
  currentPageResults.value = phoneNumberArr.value.slice(pageStart, pageEnd);
}
</script>

<style scoped>

</style>