<template>
  <div class="w-full md:mx-auto bg-base-200">
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
                      <button class="btn btn-primary" @click="sendIt" :disabled="processing || !phoneNumbers.size">Fetch Details</button>
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
const emit = defineEmits(['addPhoneNumber', 'clearPhoneNumbers', 'fetchPhoneNumbersDetails']);
const fileUpload = ref<HTMLElement | null>(null);

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
  fileReader.onload = (evt) => {
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
  if (!props.phoneNumbers.size) {
    return;
  }

  emit('fetchPhoneNumbersDetails');
}

function clearForm(): void {
  const uploader = fileUpload.value as HTMLInputElement;
  uploader.value = "";
  emit('clearPhoneNumbers');
}
</script>

<style scoped>

</style>