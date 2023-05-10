<template>
  <div v-if="$route?.meta?.description"> {{$route?.meta?.description}} </div>
  <div class="alert bg-primary shadow-lg" :class="{ 'mt-4': $route?.meta?.description }" v-if="processing">
    <div class="text-primary-content">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current flex-shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      <span>Loading phone numbers details from exchange. {{ fetchedFromExchangeCount.toLocaleString("en-US") }}/{{ uploadedTotal.size.toLocaleString("en-US") }}</span>
    </div>
    <div class="flex-none">
      <button class="btn btn-sm" @click="cancelProcessing">Cancel</button>
    </div>
  </div>
  <div class="flex items-start gap-4 w-full justify-between flex-col">
    <VerifyDetails
        :phoneNumbers="uploadedTotal"
        :processing="processing"
        @addPhoneNumber="addPhoneNumber"
        @clearPhoneNumbers="clearPhoneNumbers"
        @fetchPhoneNumbersDetails="fetchDetails"
    />
    <PhoneNumberDetailedList :phoneNumbers="uploadedTotal" />
  </div>
</template>

<script lang="ts" setup>
import {ref} from "vue";
import axios from "axios";
import VerifyDetails from "@/components/phonenumbers/DetailsForm.vue"
import PhoneNumberDetailedList from "@/components/phonenumbers/PhoneNumberDetailedList.vue";

const requestSubmitted = ref(false);
const processing = ref(false);
const uploadedTotal = ref(new Map<string, string>());
const continueProcessing = ref(true);
const fetchedFromExchangeCount = ref(0);

function addPhoneNumber(key: string, value: string): void {
  uploadedTotal.value.set(key, JSON.stringify({}));
}

function clearPhoneNumbers(): void {
  fetchedFromExchangeCount.value = 0;
  uploadedTotal.value = new Map<string, string>();
}

function cancelProcessing(): void {
  continueProcessing.value = false;
  processing.value = false;
}

function processResult(phoneNumberResults: any): void {
  phoneNumberResults.forEach((result: any) => {
    if (result?.data?.body) {
      const phoneNumber = Object.keys(result?.data?.body)[0];
      const body = result?.data?.body[phoneNumber];
      if (body) {
        const data = body[0];

        if (data) {
          const newPhoneNumberDetails = {
            organizationId: data.organizationId || null,
            organizationName: data.organizationName || null,
            businessId: data.businessId || null,
            businessName: data.businessName || null,
            programId: data.programId || null,
            programName: data.programName || null,
            programActive: data.programActive || null,
            programDisplayName: data.programDisplayName || null,
            phoneNumberId: data.phoneNumberId || null,
            submissionStatus: data.submissionStatus || null,
            callPurposeCode: data.callPurposeCode || null,
            fetchingStatus: 3
          }

          uploadedTotal.value.set(phoneNumber.toString(), JSON.stringify(newPhoneNumberDetails));
        }
      } else {
        const phoneNumber = result.config.url.split("phone-numbers/")[1];
        const data = JSON.parse(uploadedTotal.value.get(phoneNumber) as string);
        data.fetchingStatus = 2;
        uploadedTotal.value.set(phoneNumber.toString(), JSON.stringify(data));
      }
    }

    fetchedFromExchangeCount.value++;
  })
}

function fetchNumberDetails(key: any): any {
  const newPromise = axios.get(`/exchange/v1/administration/phone-numbers/${key}`, {
    headers: {
      'Authorization': localStorage.getItem("token"),
      'Content-Type': 'application/json'
    },
  }).catch(() => {
    const data = JSON.parse(uploadedTotal.value.get(key) as string);
    data.fetchingStatus = 1;
    uploadedTotal.value.set(key.toString(), JSON.stringify(data));
  })

  return newPromise;
}

async function fetchDetails(): Promise<void> {
  const chunkSize = 100;
  requestSubmitted.value = true;
  processing.value = true;
  continueProcessing.value = true;

  const numbers = [ ...uploadedTotal.value.keys() ];

  chunks(numbers, fetchNumberDetails, chunkSize)
}

function all(items: any, fn: any) {
  if (!continueProcessing.value) {
    return null;
  }

  const promises = items.map((item: any) => fn(item));
  return Promise.all(promises);
}

function series(items: any, fn: any) {
  let result = [] as any[];
  return items.reduce((acc: any, item: any) => {
    acc = acc.then(() => {
      return fn(item).then((res: any) => result.push(res));
    });
    return acc;
  }, Promise.resolve())
      .then(() => result);
}

function splitToChunks(items: any, chunkSize = 100) {
  const result = [];
  for (let i = 0; i < items.length; i+= chunkSize) {
    result.push(items.slice(i, i + chunkSize));
  }
  return result;
}

function chunks(items: any, fn: any, chunkSize = 100) {
  let result = [] as any[];
  const chunks = splitToChunks(items, chunkSize);
  return series(chunks, (chunk: any) => {
    return all(chunk, fn)!.then(res => {
          if (res) {
            processResult(res);
            return result = result.concat(res);
          }
        })
  })
      .then(() => {
        processing.value = false;
        return result;
      });
}
</script>

<style scoped>

</style>