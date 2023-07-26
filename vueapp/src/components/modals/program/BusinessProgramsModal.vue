<template>
  <div class="modal">
    <div class="modal-box w-11/12 max-w-5xl relative">
      <label for="business-list-program-modal" class="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
      <h3 class="text-lg font-bold mb-4">{{ selectedBusiness.legalName }} - Programs</h3>
      <div class="alert bg-primary shadow-lg my-4" v-if="businessUnitsMap.size">
        <div class="text-primary-content">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current flex-shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span>Loading business units and programs from exchange.</span>
        </div>
      </div>
      <div class="flex items-center justify-start my-4" v-else>
        <input type="text" :placeholder="'Enter program name here'" class="input input-bordered min-w-[350px] max-w-[350px]" v-model="programToSearch" />
        <select class="select select-ghost select-bordered mx-4  min-w-[250px] max-w-[250px]" v-model="selectedBU">
          <option selected :value="''">Business Unit Name</option>
          <option v-for="item in businessUnits" :key="item.businessUnitId" :value="item.businessUnitName">{{ item.businessUnitName }}</option>
        </select>
        <button class="btn btn-link p-0" style="background-color: transparent !important;" :disabled="!isFiltered" @click="clearFilter">Reset</button>
        <div class="flex-1 flex items-center justify-end">
          <div class="mr-4">{{ sortedPrograms.length.toLocaleString() }} Programs</div>
          <button class="float-right btn btn-primary" @click="filterPrograms">Filter</button>
        </div>
      </div>
      <table class="table table-zebra table-compact w-full">
        <thead>
        <tr class="border-t-[1px] border-base-100">
          <th></th>
          <th>Program Name</th>
          <th>Business Unit</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(program, index) in sortedPrograms" :key="index">
          <th>{{ index }}</th>
          <td>
            <span>{{ program.programName }}</span>
          </td>
          <td>
            <span>{{ program.businessUnitName }}</span>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed, inject, ref, watch} from "vue";
import axios from "axios";
import type {CreateNotification} from "@/plugins/notifications";

const props = defineProps(['selectedBusiness']);
const createNotification = inject("create-notification") as CreateNotification;
const selectedBU = ref("");
const programToSearch = ref("");
const businessUnits = ref([] as any[]);
const businessUnitsMap = ref(new Map<string, string>());
const buPageHash = ref("");
const fetchedPrograms = ref([] as any[]);
const stashedPrograms = ref([] as any[]);
const isFiltered = ref(false);
const sortedPrograms = computed(() => {
  return [...fetchedPrograms.value].sort((a, b) => {
    if (a.programName < b.programName) {
      return -1;
    }
    if (a.programName > b.programName) {
      return 1;
    }
    return 0;
  });
});

watch(() => props.selectedBusiness, (newVal) => {
  resetModal();
  fetchBusinessUnits(newVal);
});

function resetModal(): void {
  selectedBU.value = "";
  programToSearch.value = "";
  businessUnits.value = [];
  businessUnitsMap.value = new Map<string, string>();
  buPageHash.value = "";
  fetchedPrograms.value = [];
  stashedPrograms.value = [];
  isFiltered.value = false;
}

async function fetchBusinessUnits(business: any): Promise<void> {
  try {
    const resp = await axios.get(`/exchange/v1/businesses/${business.businessId}/business-units`, {
      headers: {
        'Authorization': localStorage.getItem("token"),
        'Content-Type': 'application/json'
      },
      params: {
        limit: 1000,
        pageHash: buPageHash.value ? buPageHash.value : null
      }
    });

    if (resp?.data?.body) {
      businessUnits.value.push(...resp.data.body);

      const respInfo = resp?.data?.info;

      if (respInfo) {
        const foundNextPage = decodePageHash(respInfo?.nextPage);
        if (foundNextPage) {
          buPageHash.value = foundNextPage;
          fetchBusinessUnits(business);
        } else {
          buPageHash.value = "";
          businessUnits.value.forEach((it: any) => {
            businessUnitsMap.value.set(it.businessUnitId, it.businessUnitName);
            fetchProgramsDetails(it);
          });
        }
      }
    }
  } catch (e) {
    createNotification({message: "Error fetching business units from the Exchange.", type: "error" });
  }
}

function decodePageHash(nextPage: string): string {
  const nextPageString = decodeURIComponent(nextPage);
  const params = nextPageString?.split('?')[1]?.split('&');
  const foundNextPage = params?.filter((it: any) => it.startsWith("pageHash="))[0]?.split("pageHash=")[1];

  return foundNextPage;
}

async function fetchProgramsDetails(businessUnit: any, pageHash = ""): Promise<void> {
  const resp = await axios.get(`/exchange/v1/businesses/${props.selectedBusiness.businessId}/business-units/${businessUnit.businessUnitId}/programs`, {
    headers: {
      'Authorization': localStorage.getItem("token"),
      'Content-Type': 'application/json'
    },
    params: {
      limit: 1000,
      pageHash: pageHash ? pageHash : null
    }
  })

  if (resp.data) {
    const respPrograms = resp.data.body;

    if (respPrograms.length) {
      respPrograms.map((it: any) => {
        it.businessUnitName = businessUnit.businessUnitName;
        it.businessUnitId = businessUnit.businessUnitId;
      });

      fetchedPrograms.value.push(...respPrograms);

      const respInfo = resp?.data?.info;

      if (respInfo?.nextPage) {
        const nextPageHash = decodePageHash(respInfo?.nextPage);
        fetchProgramsDetails(businessUnit, nextPageHash);
      } else {
        businessUnitsMap.value.delete(businessUnit.businessUnitId);
      }
    } else {
      const index = businessUnits.value.findIndex((it: any) => it.businessUnitId === businessUnit.businessUnitId);
      businessUnits.value.splice(index, 1);
      businessUnitsMap.value.delete(businessUnit.businessUnitId);
    }
  }
}

function filterPrograms(): void {
  if (!isFiltered.value) {
    stashedPrograms.value = fetchedPrograms.value; // This stops two consecutive filters from overriding the initial filter's stashed programs.
  }

  if (programToSearch.value) {
    fetchedPrograms.value = fetchedPrograms.value.filter((it: any) => it.programName.toLowerCase().includes(programToSearch.value.toLowerCase()));
  }

  if (selectedBU.value) {
    fetchedPrograms.value = fetchedPrograms.value.filter((it: any) => it.businessUnitName === selectedBU.value);
  }

  isFiltered.value = true;
}

function clearFilter(): void {
  programToSearch.value = "";
  selectedBU.value = "";
  isFiltered.value = false;
  fetchedPrograms.value = stashedPrograms.value;
  stashedPrograms.value = [];
}
</script>

<style lang="scss" scoped>

</style>