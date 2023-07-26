<template>
  <div class="w-full md:mx-auto bg-base-200">
    <div class="flex items-start justify-start">
      <div class="container mx-auto">
        <div class="overflow-x-auto mt-7 border-base-100 border-2 rounded-xl shadow-2xl">
          <div class="flex items-center justify-start m-2">
            <div class="form-control mr-4">
              <div class="input-group">
                <select class="select select-ghost select-bordered" @change="shouldFilterById = !shouldFilterById">
                  <option :selected="!shouldFilterById">Business Name</option>
                  <option :selected="shouldFilterById">Business Id</option>
                </select>
                <input type="text" :placeholder="shouldFilterById ? 'Enter full business id here' : 'Enter business name here'" class="input input-bordered min-w-[350px]" v-model="businessToSearch" />
              </div>
            </div>
            <select class="select select-ghost select-bordered mr-4" :disabled="shouldFilterById" v-model="selectedStatus">
              <option selected :value="''">Status</option>
              <option :value="'APPROVED'">Approved</option>
              <option :value="'PENDING'">Pending</option>
              <option :value="'UNDER_REVIEW'">Under Review</option>
              <option :value="'REJECTED'">Rejected</option>
            </select>
            <select class="select select-ghost select-bordered mr-4" :disabled="shouldFilterById" v-model="selectedGrant">
              <option selected :value="''">Grant</option>
              <option :value="'CT'">CT</option>
              <option :value="'CE'">CE</option>
              <option :value="'ATT'">ATT</option>
              <option :value="'CNO'">CNO</option>
              <option :value="'BLK'">BLK</option>
            </select>
            <button class="btn btn-link p-0" @click="clearFilter">Reset</button>
            <div class="flex-1 flex items-center justify-end">
              <div class="mr-4">{{ totalCount.toLocaleString() }} Businesses</div>
              <button class="float-right btn btn-primary" @click="filterBusinesses">Filter</button>
            </div>
          </div>
          <table class="table table-zebra table-compact w-full">
            <thead>
            <tr class="border-t-[1px] border-base-100">
              <th></th>
              <th>Business Id</th>
              <th>Business Name</th>
              <th>DBA</th>
              <th>Zendesk Ticket</th>
              <th>Grants</th>
              <th>Self Service</th>
              <th>Status</th>
              <th></th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(item, index) in toJSON(businessArr)" :key="item">
              <th>{{ index }}</th>
              <td>
                <span>{{ item[0] || "N/A" }}</span>
              </td>
              <td>
                <span>{{ item[1]?.legalName || "N/A" }}</span>
              </td>
              <td>
                <span>{{ item[1]?.dba || "N/A" }}</span>
              </td>
              <td>
                <span>{{ item[1]?.zendeskTicketId || "N/A" }}</span>
              </td>
              <td>
                <div class="badge badge-xs mr-2" v-for="grant in item[1]?.context?.serviceGrants" :key="grant">{{ grant }}</div>
              </td>
              <td>
                <span class="ml-2">{{ item[1]?.isSelfServe || "N/A" }}</span>
              </td>
              <td>
                <span>{{ item[1]?.status || "N/A" }}</span>
              </td>
              <td>
                <button class="btn btn-xs btn-link" @click="openJsonModal(item[0], item[1])">Details</button>
                <button class="btn btn-xs btn-link" @click="openProgramModal(item[1])">Programs</button>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
        <div class="mt-2 flex align-center justify-center" v-if="pageHash">
          <button
              class="btn"
              :class="{ 'loading': processing }"
              :disabled="processing"
              @click="emit('fetchBusinesses')"
          >
            Load More
          </button>
        </div>
      </div>
    </div>

    <input type="checkbox" id="business-list-json-modal" class="modal-toggle" ref="jsonModalInput" />
    <div class="modal">
      <div class="modal-box w-11/12 max-w-5xl relative">
        <label for="business-list-json-modal" class="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
        <h3 class="text-lg font-bold">{{ `Details: ${jsonModalNumber.number}` || "No Number Provided" }}</h3>
        <div class="mockup-code mt-2">
          <pre class="px-5"><code>{{ jsonModalNumber.data }}</code></pre>
        </div>
        <div class="mt-2 float-right ml-2 btn" @click="handleJsonDownload">Download</div>
        <div class="mt-2 float-right ml-auto btn" @click="handleJsonCopy">Copy</div>
      </div>
    </div>

    <input type="checkbox" id="business-list-program-modal" class="modal-toggle" ref="programModalInput" />
    <BusinessProgramsModal :selectedBusiness="selectedBusiness" />

  </div>
</template>

<script lang="ts" setup>
import {computed, inject, ref, watch} from "vue";
import type {CreateNotification} from "@/plugins/notifications";
import BusinessProgramsModal from "@/components/modals/program/BusinessProgramsModal.vue";

const createNotification = inject("create-notification") as CreateNotification;
const emit = defineEmits(['fetchBusinesses', 'fetchBusinessById']);
const props = defineProps(['businesses', 'pageHash', 'processing', 'requestSubmitted', 'totalCount']);
const programModalInput = ref<HTMLInputElement | null>(null);
const selectedBusiness = ref({} as any);
const jsonModalInput = ref<HTMLInputElement | null>(null);
const jsonModalNumber = ref({} as any);
const shouldFilterById = ref(false);
const selectedStatus = ref("");
const selectedGrant = ref("");
const businessToSearch = ref("");

const businessArr = computed(() => [ ...props.businesses.entries() ]);

function openJsonModal(number: string, data: any): void {
  jsonModalNumber.value = {
    number: number,
    data: data
  };

  jsonModalNumber.value.data.phoneNumber = number;
  delete jsonModalNumber.value.data.fetchingStatus;
  (jsonModalInput.value as HTMLInputElement).checked = true;
}

function openProgramModal(data: any): void {
  selectedBusiness.value = data;
  (programModalInput.value as HTMLInputElement).checked = true;
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

function toJSON(items: any[]): any {
  return items.map((item: any) => [item[0], JSON.parse(item[1])]);
}

function filterBusinesses(): void {
  if (shouldFilterById.value) {
    emit("fetchBusinessById", businessToSearch.value);
  } else {
    emit('fetchBusinesses', true, businessToSearch.value || '', selectedStatus.value || '', selectedGrant.value || '');
  }
}

function clearFilter(): void {
  shouldFilterById.value = false;
  selectedStatus.value = "";
  selectedGrant.value = "";
  businessToSearch.value = "";
  filterBusinesses();
}
</script>

<style scoped>

</style>