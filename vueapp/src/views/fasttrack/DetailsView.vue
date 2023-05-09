<template>
  <div v-if="$route?.meta?.description"> {{$route?.meta?.description}} </div>
  <div class="alert bg-primary shadow-lg" :class="{ 'mt-4': $route?.meta?.description }" v-if="processing">
    <div class="text-primary-content">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current flex-shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      <span>Loading businesses from exchange.</span>
    </div>
  </div>
  <div class="flex items-start gap-4 w-full justify-between flex-col">
    <BusinessDetailedList
        :businesses="businessList"
        :processing="processing"
        :pageHash="pageHash"
        :totalCount="fetchedFromExchangeCount"
        @fetchBusinesses="fetchBusinesses"
        @fetchBusinessById="fetchBusinessById"
    />
  </div>
</template>

<script lang="ts" setup>
import {inject, onMounted, ref} from "vue";
import axios from "axios";
import type {CreateNotification} from "@/plugins/notifications";

const createNotification = inject("create-notification") as CreateNotification;
import BusinessDetailedList from "@/components/fasttrack/BusinessDetailedList.vue";

const requestSubmitted = ref(false);
const processing = ref(false);
const businessList = ref(new Map<string, string>());
const pageHash = ref("");
const fetchedFromExchangeCount = ref(0);

onMounted(() => {
  fetchBusinesses();
})

function addBusiness(key: string, value: string): void {
  businessList.value.set(key, JSON.stringify(value));
  fetchedFromExchangeCount.value++;
}

async function fetchBusinesses(shouldClear = false, legalName = '', status = '', grant = ''): Promise<void> {
  if (!pageHash.value || shouldClear) {
    pageHash.value = "";
    fetchedFromExchangeCount.value = 0;
    businessList.value.clear();
  }

  requestSubmitted.value = true;
  processing.value = true;

  try {
    const resp = await axios.get(`/api/businesses`, {
      headers: {
        'Authorization': localStorage.getItem("token"),
        'Content-Type': 'application/json'
      },
      params: {
        'limit': 50,
        'pageHash': pageHash.value ? pageHash.value : null,
        'legalName': legalName ? legalName : null,
        'status': status ? status : null,
        'serviceGrant': grant ? grant : null,
      }
    })

    if (resp.data) {
      if (resp?.data?.body) {
        resp?.data?.body?.forEach((it: any) => {
          addBusiness(it.businessId, it)
        });

        const respInfo = resp?.data?.info;

        if (respInfo) {
          const nextPageString = decodeURIComponent(respInfo?.nextPage)
          const params = nextPageString?.split('?')[1]?.split('&');
          const foundNextPage = params?.filter((it: any) => it.startsWith("pageHash="))[0]?.split("pageHash=")[1];
          if (foundNextPage) {
            pageHash.value = foundNextPage;
          } else {
            pageHash.value = "";
          }
        }
      } else {
        if (resp?.data?.info) {
          createNotification({message: "No businesses found.", type: "warning" });
          return;
        }

        if (resp?.data?.error) {
          createNotification({message: "Error fetching businesses from the Exchange.", type: "warning" });
        }
      }
    }
  } catch (e: any) {
    createNotification({message: "Error fetching businesses from the Exchange.", type: "error" });
  }

  processing.value = false;
}

async function fetchBusinessById(busId: string): Promise<void> {
  fetchedFromExchangeCount.value = 0;
  pageHash.value = "";
  businessList.value.clear();
  requestSubmitted.value = true;
  processing.value = true;


  try {
    const resp = await axios.get(`/api/businesses/${busId.trim()}`, {
      headers: {
        'Authorization': localStorage.getItem("token"),
        'Content-Type': 'application/json'
      }
    })

    if (resp.data) {
      if (resp?.data?.body) {
        const body = resp?.data?.body;
        addBusiness(body.resellerId, body);
      } else {
        if (resp?.data?.info) {
          createNotification({message: `No business with id of ${busId} found.`, type: "warning" });
        }

        if (resp?.data?.error) {
          createNotification({message: `Error fetching business with id of ${busId} from the Exchange.`, type: "warning" });
        }
      }
    }
  } catch (e: any) {
    createNotification({message: `Error fetching business with id of ${busId} from the Exchange.`, type: "error" });
  }

  processing.value = false;
}
</script>

<style scoped>

</style>