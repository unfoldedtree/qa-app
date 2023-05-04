<template>
  <div class="w-full md:mx-auto bg-base-200">
    <div class="flex items-start justify-start">
      <div class="container mx-auto">
        <div class="overflow-x-auto mt-7 border-base-100 border-2 rounded-xl shadow-2xl">
          <div>
            <input type="text" placeholder="Enter full phone number here" class="input input-bordered w-full mx-2 my-2 max-w-xs" v-model="numberToSearch" />
            <button class="btn btn-primary" @click="filterPhoneNumber" :disabled="!numberToSearch.length" v-if="!isFiltered">Filter</button>
            <button class="btn btn-outline btn-primary" @click="clearFilter" v-if="isFiltered">Clear Filter</button>
          </div>
          <table class="table table-zebra table-compact w-full">
            <thead>
            <tr class="border-t-[1px] border-base-100">
              <th></th>
              <th>Phone Number</th>
              <th>CPC</th>
              <th>Organization</th>
              <th>Business</th>
              <th>Program</th>
              <th>Display Name</th>
              <th>Approval Status</th>
              <th></th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(item, index) in toJSON(currentPageResults)" :key="item">
              <th>{{ index }}</th>
              <td>
                <div className="tooltip tooltip-right tooltip-hover" :data-tip="getFetchingStatusDesc(item[1]?.fetchingStatus)">
                  <div :class="`badge badge-xs ${getFetchingStatus(item[1]?.fetchingStatus)}`"></div>
                </div>
                <div className="tooltip tooltip-right tooltip-hover" :data-tip="item[1]?.phoneNumberId">
                  <span class="ml-2">{{ item[0] || "N/A" }}</span>
                </div>
              </td>
              <td>
                <span>{{ item[1]?.callPurposeCode || "N/A" }}</span>
              </td>
              <td>
                <div className="tooltip tooltip-hover" :data-tip="item[1]?.organizationId">
                  <span class="ml-2">{{ item[1]?.organizationName || "N/A" }}</span>
                </div>
              </td>
              <td>
                <div className="tooltip tooltip-hover" :data-tip="item[1]?.businessId">
                  <span class="ml-2">{{ item[1]?.businessName || "N/A" }}</span>
                </div>
              </td>
              <td>
                <div className="tooltip tooltip-hover" :data-tip="(item[1]?.programActive ? 'Program is active.' : 'Program is not active.')">
                  <div class="badge badge-xs" :class="(item[1]?.programActive ? 'badge-success' : 'badge-error')" v-if="item[1]?.programDisplayName"></div>
                </div>
                <div className="tooltip tooltip-hover" :data-tip="item[1]?.programId">
                  <span class="ml-2">{{ item[1]?.programName || "N/A" }}</span>
                </div>
              </td>
              <td>
                <span>{{ item[1]?.programDisplayName || "N/A" }}</span>
              </td>
              <td>
                <span>{{ item[1]?.submissionStatus || "N/A" }}</span>
              </td>
              <td>
                <button class="btn btn-xs btn-link" @click="openJsonModal(item[0], item[1])">View</button>
              </td>
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

    <input type="checkbox" id="my-modal-3" class="modal-toggle" ref="jsonModalInput" />
    <div class="modal">
      <div class="modal-box w-11/12 max-w-5xl relative">
        <label for="my-modal-3" class="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
        <h3 class="text-lg font-bold">{{ `Details: ${jsonModalNumber.number}` || "No Number Provided" }}</h3>
        <div class="mockup-code mt-2">
          <pre class="px-5"><code>{{ jsonModalNumber.data }}</code></pre>
        </div>
        <div class="mt-2 float-right ml-2 btn" @click="handleJsonDownload">Download</div>
        <div class="mt-2 float-right ml-auto btn" @click="handleJsonCopy">Copy</div>
      </div>
    </div>

  </div>
</template>

<script lang="ts" setup>
import {computed, inject, ref, watch} from "vue";
import type {CreateNotification} from "@/plugins/notifications";

const createNotification = inject("create-notification") as CreateNotification;
const props = defineProps(['phoneNumbers', 'processing', 'requestSubmitted']);
const jsonModalInput = ref<HTMLInputElement | null>(null);
const jsonModalNumber = ref({} as any);
const numberToSearch = ref("");
const isFiltered = ref(false);
const currentPage = ref(0);
const pageSize = ref(50);
const currentPageResults = ref([] as any[]);

const phoneNumberArr = computed(() => [ ...props.phoneNumbers.entries() ]);

watch(phoneNumberArr, () => {
  if (!isFiltered.value) {
    currentPage.value = 0;
    generatePage();
  } else {
    filterPhoneNumber()
  }
})

const totalPages = computed(() => {
  if (isFiltered.value) {
    return 1;
  }
  return Math.ceil(props.phoneNumbers.size / pageSize.value)
})

function openJsonModal(number: string, data: any): void {
  jsonModalNumber.value = {
    number: number,
    data: data
  };

  jsonModalNumber.value.data.phoneNumber = number;
  delete jsonModalNumber.value.data.fetchingStatus;
  (jsonModalInput.value as HTMLInputElement).checked = true;
}

function handleJsonDownload(): void {
  if (jsonModalNumber.value) {
    const link = document.createElement("a");
    link.href = "data:json/csv;charset=utf-8," + encodeURIComponent(JSON.stringify(jsonModalNumber.value.data));
    link.target = "_blank";
    link.download = `${jsonModalNumber.value.number}.json`;
    link.click();
    createNotification({ message: `File downloaded as ${jsonModalNumber.value.number}.json.`, type: "success" });
  } else {
    createNotification({ message: "Error downloading file.", type: "warning" });
  }
}

function handleJsonCopy(): void {
  if (jsonModalNumber.value) {
    navigator.clipboard.writeText(JSON.stringify(jsonModalNumber.value.data));
    createNotification({ message: `Successfully copied to clipboard.`, type: "success" });
  } else {
    createNotification({ message: "Error copying to clipboard.", type: "error" });
  }
}

function getFetchingStatus(status: number): string {
  switch (status) {
    case 1:
      return 'badge-error';
    case 2:
      return 'badge-warning';
    case 3:
      return "badge-success";
    default:
      return "";
  }
}

function getFetchingStatusDesc(status: number): string {
  switch (status) {
    case 1:
      return 'The number does not exist.';
    case 2:
      return 'No data present on the number.';
    case 3:
      return "The number was found successfully.";
    default:
      return "No attempt to fetch yet.";
  }
}

function toJSON(items: any[]): any {
  return items.map((item: any) => [item[0], JSON.parse(item[1])]);
}

function getCurrentPage(): number {
  if (isFiltered.value) {
    return 1;
  }

  return (totalPages.value > 0 ? currentPage.value + 1 : 0)
}

function clearFilter(): void {
  numberToSearch.value = "";
  filterPhoneNumber();
}

function filterPhoneNumber(): void {
  if (numberToSearch.value) {
    isFiltered.value = true;
    const foundNumber = props.phoneNumbers.get(numberToSearch.value);
    if (foundNumber) {
      const filterReady = [numberToSearch.value, foundNumber];
      currentPageResults.value = [];
      currentPageResults.value.push(filterReady);
    } else {
      createNotification({ message: "Phone number not found in list.", type: "error" });
    }
  } else {
    isFiltered.value = false;
    generatePage();
  }
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