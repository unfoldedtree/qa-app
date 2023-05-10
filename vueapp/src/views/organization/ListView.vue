<template>
  <div v-if="$route?.meta?.description"> {{$route?.meta?.description}} </div>
  <div class="alert bg-primary shadow-lg" :class="{ 'mt-4': $route?.meta?.description }" v-if="processing">
    <div class="text-primary-content">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current flex-shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      <span>Loading organizations from exchange.</span>
    </div>
  </div>
  <div class="flex items-start gap-4 w-full justify-between flex-col">
    <OrganizationDetailedList
        :organizations="orgList"
        :processing="processing"
        :pageHash="pageHash"
        :totalCount="fetchedFromExchangeCount"
        @fetchOrgs="fetchOrgs"
        @fetchOrgById="fetchOrgById"
    />
  </div>
</template>

<script lang="ts" setup>
import {inject, onMounted, ref} from "vue";
import axios from "axios";
import type {CreateNotification} from "@/plugins/notifications";

const createNotification = inject("create-notification") as CreateNotification;
import OrganizationDetailedList from "@/components/organization/OrganizationDetailedList.vue";

const requestSubmitted = ref(false);
const processing = ref(false);
const orgList = ref(new Map<string, string>());
const pageHash = ref("");
const fetchedFromExchangeCount = ref(0);

onMounted(() => {
  fetchOrgs();
})

function addOrg(key: string, value: string): void {
  orgList.value.set(key, JSON.stringify(value));
  fetchedFromExchangeCount.value++;

  getRelationships(key);
}

async function fetchOrgs(): Promise<void> {
  if (!pageHash.value) {
    fetchedFromExchangeCount.value = 0;
    orgList.value.clear();
  }

  requestSubmitted.value = true;
  processing.value = true;

  try {
    const resp = await axios.get(`/exchange/v1/resellers`, {
      headers: {
        'Authorization': localStorage.getItem("token"),
        'Content-Type': 'application/json'
      },
      params: {
        'limit': 50,
        'pageHash': pageHash.value ? pageHash.value : null,
      }
    })

    if (resp.data) {
      if (resp?.data?.body) {
        resp?.data?.body?.forEach((it: any) => {
          addOrg(it.resellerId, it)
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
          createNotification({message: "No organizations found.", type: "warning" });
        }

        if (resp?.data?.error) {
          createNotification({message: "Error fetching organizations from the Exchange.", type: "warning" });
        }
      }
    }
  } catch (e: any) {
    createNotification({message: "Error fetching organizations from the Exchange.", type: "error" });
  }

  processing.value = false;
}

async function fetchOrgById(orgId: string): Promise<void> {
  fetchedFromExchangeCount.value = 0;
  pageHash.value = "";
  orgList.value.clear();
  requestSubmitted.value = true;
  processing.value = true;


  try {
    const resp = await axios.get(`/exchange/v1/resellers/${orgId.trim()}`, {
      headers: {
        'Authorization': localStorage.getItem("token"),
        'Content-Type': 'application/json'
      }
    })

    if (resp.data) {
      if (resp?.data?.body) {
        const body = resp?.data?.body;
        addOrg(body.resellerId, body)
      } else {
        if (resp?.data?.info) {
          createNotification({message: `No organization with id of ${orgId} found.`, type: "warning" });
        }

        if (resp?.data?.error) {
          createNotification({message: `Error fetching organization with id of ${orgId} from the Exchange.`, type: "warning" });
        }
      }
    }
  } catch (e: any) {
    createNotification({message: `Error fetching organization with id of ${orgId} from the Exchange.`, type: "error" });
  }

  processing.value = false;
}

async function getRelationships(orgId: string): Promise<void> {
  const resp = await axios.get(`/hierarchy/v1/${orgId}`, {
    headers: {
      'Authorization': localStorage.getItem("token"),
      'Content-Type': 'application/json',
      'X-SERVICE': 'forp.v1.Hierarchy'
    },
  });

  if (resp.data) {
    const initialOrg = orgList.value.get(orgId);

    if (initialOrg) {
      const orgObj = JSON.parse(initialOrg);
      orgObj.relationships = resp.data;
      orgList.value.set(orgId, JSON.stringify(orgObj));
    }
  }
}
</script>

<style scoped>

</style>