<template>
  <div class="alert bg-primary shadow-lg" v-if="processing">
    <div class="text-primary-content">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current flex-shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      <span>Loading phone numbers from exchange.</span>
    </div>
    <div class="flex-none">
      <button class="btn btn-sm" @click="cancelRequest">Cancel</button>
    </div>
  </div>
  <div class="flex items-start gap-4 w-full justify-between flex-row">
    <VerifyForm
        :phoneNumbers="uploadedTotal"
        :processing="processing"
        @addPhoneNumber="addPhoneNumber"
        @clearPhoneNumbers="clearPhoneNumbers"
        @fetchPhoneNumbersList="loopNumbers"
    />
    <PhoneNumberList :phoneNumbers="uploadedTotal" />
  </div>
  <VerifyActions
      :uploadedTotal="uploadedTotal"
      :uploadedMatched="uploadedMatched"
      :uploadedRemaining="uploadedRemaining"
      :exchangeTotal="exchangeTotal"
      :exchangeMatched="exchangeMatched"
      :exchangeRemaining="exchangeRemaining"
      @downloadResults="downloadCSV"
  />
</template>

<script lang="ts" setup>
import {inject, ref} from "vue";
import axios from "axios";
import VerifyForm from "@/components/phonenumbers/VerifyForm.vue";
import PhoneNumberList from "@/components/phonenumbers/PhoneNumberList.vue";
import VerifyActions from "@/components/phonenumbers/VerifyActions.vue";
import type {CreateNotification} from "@/plugins/notifications";

const requestSubmitted = ref(false);
const processing = ref(false);
const uploadedTotal = ref(new Map<string, string>());
const uploadedMatched = ref(new Map<string, string>());
const uploadedRemaining = ref(new Map<string, string>());
const exchangeTotal = ref(new Map<string, string>());
const exchangeMatched = ref(new Map<string, string>());
const exchangeRemaining = ref(new Map<string, string>());
const pageHash = ref("");

const createNotification = inject("create-notification") as CreateNotification;

// createNotification({ message: "Notification Working" });
// createNotification({ message: "Success Working", type: "success" });
// createNotification({ message: "Warning Working", type: "warning" });
// createNotification({ message: "Error Working", type: "error" });

function addPhoneNumber(key: string, value: string): void {
  uploadedTotal.value.set(key, value);
  uploadedRemaining.value.set(key, value);
}

function clearPhoneNumbers(): void {
  uploadedTotal.value = new Map<string, string>();
  uploadedMatched.value = new Map<string, string>();
  uploadedRemaining.value = new Map<string, string>();
  exchangeTotal.value = new Map<string, string>();
  exchangeMatched.value = new Map<string, string>();
  exchangeRemaining.value = new Map<string, string>();
}

function cancelRequest(): void {
  processing.value = false;
}

function downloadCSV(resultsMap: Map<string, string>, source: string): void {
  let csv = "";

  resultsMap.forEach((value, key, map) => {
    let arr = [];
    arr.push(key);
    arr.push(value);
    csv += arr.join(",");
    csv += "\n";
  })

  const link = document.createElement("a");
  link.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
  link.target = "_blank";
  link.download = `${source}-phonenumber-results-${resultsMap.size}.csv`;
  link.click();
}

async function loopNumbers(businessId: string, businessUnitId: string, programId: string): Promise<void> {
  requestSubmitted.value = true;
  processing.value = true;


  try {
    const resp = await axios.get(`/api/businesses/${businessId}/phone-numbers`, {
      headers: {
        'Authorization': localStorage.getItem("token"),
        'Content-Type': 'application/json'
      },
      params: {
        'businessUnitId': businessUnitId ? businessUnitId : null,
        'programId': programId ? programId : null,
        'limit': 1000,
        'pageHash': pageHash.value ? pageHash.value : null,
      }
    })

    if (resp.data) {
      if (resp?.data?.body) {
        resp?.data?.body?.forEach((it: any) => {
          const phoneNumber = it.phoneNumber;
          exchangeTotal.value.set(phoneNumber, it.callPurposeCode)

          const inUploadedFile = uploadedTotal.value.has(phoneNumber);

          if (inUploadedFile) {
            const record = uploadedTotal.value.get(phoneNumber);
            uploadedMatched.value.set(phoneNumber, record as string);
            exchangeMatched.value.set(phoneNumber, record as string);
            uploadedRemaining.value.delete(phoneNumber);

          } else {
            exchangeRemaining.value.set(phoneNumber, it.callPurposeCode);
          }
        });

        const respInfo = resp?.data?.info;

        if (respInfo) {
          const nextPageString = decodeURIComponent(respInfo?.nextPage)
          const params = nextPageString?.split('?')[1]?.split('&');
          const foundNextPage = params?.filter((it: any) => it.startsWith("pageHash="))[0]?.split("pageHash=")[1];
          if (foundNextPage) {
            if (processing.value === true) {
              pageHash.value = foundNextPage;
              await loopNumbers(businessId, businessUnitId, programId);
            } else {
              pageHash.value = "";
              processing.value = false;
            }
          } else {
            pageHash.value = "";
            processing.value = false;
          }
        }
      } else {
        if (resp?.data?.info) {
          createNotification({message: "No phone numbers found.", type: "warning" });
          return;
        }

        if (resp?.data?.error) {
          createNotification({message: "Error fetching numbers from the Exchange.", type: "warning" });
        }
      }
    }
  } catch (e: any) {
    createNotification({message: "Error fetching numbers from the Exchange.", type: "error" });
  }
}
</script>

<style scoped>

</style>