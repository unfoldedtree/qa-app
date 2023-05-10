<template>
  <div class="md:container md:w-50 md:mx-auto bg-base-200">
    <div class="flex flex-col justify-between min-h-screen h-full">
      <main class="container mx-auto px-3 pb-12">
        <div class="mt-7">
          <div class="text-center">
            <div class="max-w-100">
              <div class="text-center">
                <h1 class="text-5xl font-bold">
                  Login Here!
                </h1>
                <p class="py-6">
                  Please enter a relevant key and secret to generate a token. Then, you'll unlock all the cool functionality!
                </p>
              </div>
              <div class="max-w-md mx-auto my-7">
                <div class="card flex-shrink-0 w-full max-w-sm mx-auto shadow-2xl bg-base-100">
                  <div
                      class="card-body"
                      :class="{ 'border-primary border-2 rounded-xl': dropActive }"
                      @drop.prevent="onDrop"
                      @dragenter.prevent="onDragEnter"
                      @dragover="onDragOver"
                      @dragleave="onDragLeave"
                  >
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text">API Key</span>
                      </label>
                      <input type="text" id="apiKey" class="input input-bordered" placeholder="Enter that key here..." v-model="apiKey">
                    </div>
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text">Secret Key</span>
                      </label>
                      <input type="password" id="secretKey" class="input input-bordered" v-model="secretKey">
                    </div>
                    <div class="form-control mt-6">
                      <button class="btn btn-primary" @click="sendIt">Send it!</button>
                    </div>
                    <div class="divider">OR</div>
                    <div class="form-control mt-6">
                      <span>DROP AN API KEY JSON FILE <span class="text-primary cursor-pointer hover:underline" @click="clickUploadInput">HERE!</span></span>
                    </div>
                    <input
                        type="file"
                        ref="hiddenFileUploadButton"
                        accept=".json"
                        @change="onFileSelected"
                        style="display: none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {inject, onMounted, onUnmounted, ref} from "vue";
import axios from "axios";
import router from "@/router";
import type {CreateNotification} from "@/plugins/notifications";

const createNotification = inject("create-notification") as CreateNotification;
const apiKey = ref("");
const secretKey = ref("");
const events = ['dragenter', 'dragover', 'dragleave', 'drop'];
const dropActive = ref(false);
const hiddenFileUploadButton = ref<HTMLInputElement | null>(null);

async function sendIt(): Promise<void> {
  const resp = await axios.post('/v1/auth', null, {
    headers: {
      'X-API-KEY': apiKey.value,
      'X-SECRET-KEY': secretKey.value,
      'X-SERVICE': 'auth'
    }
  })

  if (resp.data) {
    localStorage.setItem('apiKey', apiKey.value);
    localStorage.setItem('token', resp.data.token);
    localStorage.setItem('refreshToken', resp.data.refresh_token);
    await router.push({
      name: "dashboard",
    });
  }
}

function clickUploadInput(): void {
  const fileInputEl = hiddenFileUploadButton.value as HTMLElement;
  fileInputEl.click();
}

function onFileSelected(): void {
  const files: File[] = (hiddenFileUploadButton.value as any).files;
  const file: File = files[0];
  if (files.length === 0) {
    return;
  }

  if (!validFormatFile(file.name)) {
    createNotification({ message: "Only JSON are allowed to be uploaded.", type: "error" });
    return;
  }

  uploadFile(file);
}

function uploadFile(file: File): void {
  const fileReader = new FileReader();
  fileReader.onload = () => {
    if (fileReader.readyState === FileReader.DONE) {
      const text = fileReader.result as string;
      const jsonResult = JSON.parse(text);

      (hiddenFileUploadButton.value as HTMLInputElement).value = '';

      if (jsonResult.apiKey && jsonResult.secretKey) {
        apiKey.value = jsonResult.apiKey;
        secretKey.value = jsonResult.secretKey;
        sendIt();
      } else {
        createNotification({ message: "Invalid JSON file.", type: "error" });
      }
    }
  };
  fileReader.readAsText(file);
}

function validFormatFile(fname: string): boolean {
  const format = fname.slice(
      (Math.max(0, fname.lastIndexOf(".")) || Infinity) + 1
  );
  return format === "json";
}

function onDragEnter(): void {
  dropActive.value = true;
}

function onDragLeave(): void {
  dropActive.value = false;
}

function onDragOver(): void {
  dropActive.value = true;
}

function onDrop(e: any): void {
  dropActive.value = false;
  if (e!.dataTransfer!.files!.length === 1) {
    let file = e!.dataTransfer!.files[0];

    if (validFormatFile(file.name)) {
      uploadFile(file);
    } else {
      createNotification({ message: "Only JSON are allowed to be uploaded.", type: "error" });
    }
  } else {
    createNotification({ message: "Just drag one file please.", type: "error" });
  }
}

function preventDefaults(e: any) {
  e.preventDefault()
  e.stopPropagation();
}

onMounted(() => {
  events.forEach((eventName) => {
    document.body.addEventListener(eventName, preventDefaults)
  })
})

onUnmounted(() => {
  events.forEach((eventName) => {
    document.body.removeEventListener(eventName, preventDefaults)
  })
})
</script>

<style scoped>

</style>