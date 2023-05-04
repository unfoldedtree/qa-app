<template>
  <div class="md:container md:w-50 md:mx-auto bg-base-200">
    <div class="flex flex-col justify-between">
      <div class="container mx-auto">
        <div class="mt-7">
          <div class="text-center">
            <div class="max-w-100">
              <div class="mx-auto my-7">
                <div class="card flex-shrink-0 w-full mx-auto shadow-2xl bg-base-100">
                  <div class="card-body">
                    <div class="card-title">
                      <span>Details</span>
                      <button class="ml-auto btn btn-link" :disabled="processing" @click="clearForm">Clear</button>
                    </div>
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text">Business</span>
                        <span class="label-text-alt">(required)</span>
                      </label>
                      <input type="text" id="businessId" class="input input-bordered" placeholder="Enter business id here..." v-model="businessId" :disabled="processing">
                    </div>
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text">Business Unit</span>
                      </label>
                      <input type="text" id="businessUnitId" class="input input-bordered" placeholder="Enter business unit id here..." v-model="businessUnitId" :disabled="processing">
                    </div>
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text">Program</span>
                      </label>
                      <input type="text" id="programId" class="input input-bordered" placeholder="Enter program id here..." v-model="programId" :disabled="processing">
                    </div>
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text">Phone Numbers {{ phoneNumbers.size > 0 ? `(${phoneNumbers.size.toLocaleString('en-US')})` : null }}</span>
                      </label>
                      <input
                          type="file"
                          id="fileUpload"
                          ref="fileUpload"
                          accept=".csv"
                          class="file-input file-input-bordered w-full max-w-xs"
                          @change="onFileSelected"
                          :disabled="processing"
                      />
                    </div>

                    <div class="form-control mt-6">
                      <button class="btn btn-primary" @click="sendIt" :disabled="processing || !phoneNumbers.size || !businessId">Compare</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {inject, ref} from "vue";
import type {CreateNotification} from "@/plugins/notifications";

const createNotification = inject("create-notification") as CreateNotification;
const props = defineProps(['phoneNumbers', 'processing']);
const emit = defineEmits(['addPhoneNumber', 'clearPhoneNumbers', 'fetchPhoneNumbersList']);
const fileUpload = ref<HTMLElement | null>(null);
const businessId = ref("c171c130-d440-4aac-bb92-97b21ea921cb");
const businessUnitId = ref("9474de7b-e619-49c9-8580-122b546df92e");
const programId = ref("7908d988-2947-4ce5-96b9-cc9f3fdee5f6");

function onFileSelected(): void {
  const files: File[] = (fileUpload.value as any).files;
  const file: File = files[0];
  if (files.length === 0) {
    return;
  }

  if (!validFormatFile(file.name)) {
    createNotification({ message: "Only CSV files are allowed to be uploaded.", type: "error" });
    return;
  }

  uploadFile(file);
}

function uploadFile(file: File): void {
  const fileReader = new FileReader();
  fileReader.onload = () => {
    if (fileReader.readyState === FileReader.DONE) {
      emit('clearPhoneNumbers');

      const text = fileReader.result as string;
      const allParts = text.trim().split(/[\n]/);

      // Currently throwing out anything over 1000000 anumbers.
      if(allParts.length > 1000000 || allParts.length > 1000000) {
        createNotification({ message: "You can only upload 1,000,000 numbers at a time.", type: "error" });
      } else {
        const parts = allParts.slice(0, 1000001);

        for (const part of parts) {
          if (part === "") {
            continue;
          }

          const splitpart = part.split(/[,|\n]/);

          emit('addPhoneNumber', formatPhoneNumber(splitpart[0].trim()), splitpart[1].trim());
        }

        (fileUpload as unknown as HTMLFormElement).value = null
      }
    };
  };
  fileReader.readAsText(file);
}

function validFormatFile(fname: string): boolean {
  const format = fname.slice(
      (Math.max(0, fname.lastIndexOf(".")) || Infinity) + 1
  );
  return format === "csv";
}

function formatPhoneNumber(phoneNumber: string) {
  let formattedPhoneNumber = "";
  const E_164_PHONE_NUMBER_LENGTH = 12;
  if (phoneNumber) {
    let rawPhoneNumber = phoneNumber.replace(" ", "");
    rawPhoneNumber = rawPhoneNumber.replace("-", "");
    if (rawPhoneNumber.length == E_164_PHONE_NUMBER_LENGTH) {
      formattedPhoneNumber = rawPhoneNumber;
    }
    else if (rawPhoneNumber.length == E_164_PHONE_NUMBER_LENGTH-1) {
      formattedPhoneNumber = "+" + rawPhoneNumber;
    }
    else if (rawPhoneNumber.length == E_164_PHONE_NUMBER_LENGTH-2) {
      formattedPhoneNumber = "+1" + rawPhoneNumber; // todo account for country code once international phone numbers are supported
    }
    else {
      formattedPhoneNumber = rawPhoneNumber;
    }
  }
  return formattedPhoneNumber;
}

async function sendIt(): Promise<void> {
  if (!businessId.value) {
    return;
  }

  emit('fetchPhoneNumbersList', businessId.value, businessUnitId.value, programId.value);
}

function clearForm(): void {
  const uploader = fileUpload.value as HTMLInputElement;
  uploader.value = "";
  emit('clearPhoneNumbers');
  businessId.value = "";
  businessUnitId.value = "";
  programId.value = "";
}
</script>

<style scoped>

</style>