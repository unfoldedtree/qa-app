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
                <div class="badge badge-xs mr-2 p-2" v-for="grant in item[1]?.context?.serviceGrants" :key="grant">{{ grant }}</div>
              </td>
              <td>
                <span class="ml-2">{{ item[1]?.status || "N/A" }}</span>
              </td>
              <td>
                <button class="btn btn-xs btn-link" @click="openJsonModal(item[1])">View</button>
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

    <input type="checkbox" id="my-modal-3" class="modal-toggle" ref="jsonModalInput" />
    <div class="modal">
      <div class="modal-box w-11/12 max-w-5xl relative">
        <label for="my-modal-3" class="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
        <h3 class="text-lg font-bold mb-2">{{ `Fast Track Submissions: ${jsonModalBusiness.legalName}` || "No Business Provided" }}</h3>
        <div class="max-h-[750px] overflow-auto" v-if="jsonModalBusiness?.submissions?.length">
          <Submission v-for="submission in jsonModalBusiness.submissions" :key="submission.submissionId" :submission="submission" />
        </div>
        <div class="w-full hero bg-base-200 rounded-lg flex items-center justify-center" v-else>
          <div class="hero-content text-center">
            <h1 class="flex items-center p-5 justify-center flex-col" v-if="loadingSubmissions">
              <button class="btn btn-xl btn-ghost loading flex flex-col">
                <span class="pt-3">Loading Submissions</span>
              </button>
            </h1>
            <h1 class="p-5" v-else>
              <span>NO SUBMISSIONS FOUND</span>
            </h1>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script lang="ts" setup>
import {computed, inject, ref, watch} from "vue";
import type {CreateNotification} from "@/plugins/notifications";
import axios from "axios";
import Submission from "@/components/fasttrack/Submission.vue";

const createNotification = inject("create-notification") as CreateNotification;
const emit = defineEmits(['fetchBusinesses', 'fetchBusinessById']);
const props = defineProps(['businesses', 'pageHash', 'processing', 'requestSubmitted', 'totalCount']);
const jsonModalInput = ref<HTMLInputElement | null>(null);
const jsonModalBusiness = ref({} as any);
const shouldFilterById = ref(false);
const selectedStatus = ref("");
const selectedGrant = ref("");
const businessToSearch = ref("");
const loadingSubmissions = ref(false);

const businessArr = computed(() => [ ...props.businesses.entries() ]);

async function openJsonModal(data: any): Promise<void> {
  jsonModalBusiness.value = data;
  jsonModalBusiness.value.submissions = [] as any[];
  (jsonModalInput.value as HTMLInputElement).checked = true;
  await loadSubmissions(data.businessId);
}

async function loadSubmissions(businessId: string, pageHash = ""): Promise<void> {
  loadingSubmissions.value = true;

  try {
    const resp = await axios.get(`/api/businesses/${businessId}/display-name-bulk`, {
      headers: {
        'Authorization': localStorage.getItem("token"),
        'Content-Type': 'application/json'
      },
      params: {
        'page_size': 20,
        'next_page_token': pageHash || null
      }
    });

    if (resp?.data?.body) {
      const submissions = resp.data.body.submissions;
      const nextPageToken = resp.data.body.nextPageToken;

      if (submissions) {
        jsonModalBusiness.value.submissions.push(...submissions);
      }

      if (nextPageToken) {
        await loadSubmissions(businessId, nextPageToken)
      } else {
        console.log("Submissions: ", jsonModalBusiness.value.submissions);
        loadingSubmissions.value = false;
        return;
      }
    }

    loadingSubmissions.value = false;
  } catch (err: any) {
    loadingSubmissions.value = false;
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