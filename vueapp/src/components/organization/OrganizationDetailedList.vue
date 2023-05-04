<template>
  <div class="w-full md:mx-auto bg-base-200">
    <div class="flex items-start justify-start">
      <div class="container mx-auto">
        <div class="overflow-x-auto mt-7 border-base-100 border-2 rounded-xl shadow-2xl">
          <div class="flex items-center justify-start">
            <input type="text" placeholder="Enter full organization id here" class="input input-bordered w-full mx-2 my-2 max-w-xs" v-model="orgToSearch" />
            <button class="btn btn-primary" @click="filterOrg" :disabled="!orgToSearch.length" v-if="!isFiltered">Filter</button>
            <button class="btn btn-outline btn-primary" @click="clearFilter" v-if="isFiltered">Clear Filter</button>
            <div class="flex-1 text-right px-5">{{ totalCount.toLocaleString() }} Organizations</div>
          </div>
          <table class="table table-zebra table-compact w-full">
            <thead>
            <tr class="border-t-[1px] border-base-100">
              <th></th>
              <th>Org Id</th>
              <th>Name</th>
              <th>Relationships</th>
              <th>Grants</th>
              <th></th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(item, index) in toJSON(orgArr)" :key="item">
              <th>{{ index }}</th>
              <td>
                <span>{{ item[0] || "N/A" }}</span>
              </td>
              <td>
                <span>{{ item[1]?.name || "N/A" }}</span>
              </td>
              <td>
                <div class="badge badge-xs mr-2 p-2" v-for="relationship in mapRelationshipStatusText(item[1]?.relationships)" :key="relationship">{{ relationship }}</div>
              </td>
              <td>
                <div class="badge badge-xs mr-2 p-2" v-for="grant in item[1]?.context?.serviceGrants" :key="grant">{{ grant }}</div>
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
              @click="emit('fetchOrgs')"
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
        <h3 class="text-lg font-bold">{{ `${jsonModalNumber.name} Details` || "No Name Provided" }}</h3>
        <div class="mockup-code mt-2">
          <pre class="px-5"><code>{{ jsonModalNumber }}</code></pre>
        </div>
        <div class="mt-2 float-right ml-2 btn" @click="handleJsonDownload">Download</div>
        <div class="mt-2 float-right ml-auto btn" @click="handleJsonCopy">Copy</div>
      </div>
    </div>

  </div>
</template>

<script lang="ts" setup>
import {computed, inject, ref} from "vue";
import type {CreateNotification} from "@/plugins/notifications";

const createNotification = inject("create-notification") as CreateNotification;
const emit = defineEmits(['fetchOrgs', 'fetchOrgById']);
const props = defineProps(['organizations', 'pageHash', 'processing', 'requestSubmitted', 'totalCount']);
const jsonModalInput = ref<HTMLInputElement | null>(null);
const jsonModalNumber = ref({} as any);
const orgToSearch = ref("");
const isFiltered = ref(false);

const orgArr = computed(() => [ ...props.organizations.entries() ]);

function openJsonModal(data: any): void {
  jsonModalNumber.value = data;

  (jsonModalInput.value as HTMLInputElement).checked = true;
}

function mapRelationshipStatusText(relationships: any): string[] {
  const relationshipArr = [] as string[];

  if (relationships) {
    if (relationships?.parent) {
      relationshipArr.push("Parent")
    }
    if (relationships?.children?.length) {
      relationshipArr.push("Child")
    }
  }

  return relationshipArr;
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

function filterOrg(): void {
  if (orgToSearch.value) {
    isFiltered.value = true;
    emit("fetchOrgById", orgToSearch.value);
  } else {
    isFiltered.value = false;
    emit('fetchOrgs');
  }
}

function clearFilter(): void {
  orgToSearch.value = "";
  filterOrg();
}
</script>

<style scoped>

</style>