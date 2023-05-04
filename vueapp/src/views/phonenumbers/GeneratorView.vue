<template>
  <p class="py-6 text-center">Just put in your starting phone number and how many consecutive numbers you need. Then, we'll provide you with a downloadable CSV!</p>
  <div class="w-full max-w-md mx-auto my-7">
    <div class="card flex-shrink-0 w-full max-w-sm mx-auto shadow-2xl bg-base-100">
      <div class="card-body">
        <div class="form-control">
          <label class="label">
            <span class="label-text">Initial Phone Number</span>
          </label>
          <input min="1" max="99999999999" type="number" placeholder="Starting number?" id="phoneNumber" class="input input-bordered" v-model="phoneNumberInput" @change="formatPhone">
        </div>
        <div class="form-control w-full max-w-xs">
          <label class="label">
            <span class="label-text">Call Purpose</span>
          </label>
          <select class="select select-bordered" v-model="purpose">
            <option v-for="option in selectOptions" :key="option">{{ option }}</option>
          </select>
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">Count</span>
          </label>
          <input min="1" max="10000" type="number" placeholder="How many?" id="inc" class="input input-bordered" v-model="inc" @change="formatCount">
        </div>
        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text">Prepend with (+)?</span>
            <input type="checkbox" class="checkbox checkbox-primary" v-model="prepend">
          </label>
        </div>
        <div class="form-control mt-6">
          <button class="btn btn-primary" @click="handleSubmit">Generate</button>
        </div>
      </div>
    </div>
    <button class="btn btn-link my-7" v-if="results.length" @click="downloadNumbers">
      Download {{ results.length }} number(s)
    </button>
  </div>
</template>

<script lang="ts" setup>
import {ref} from "vue";

const selectOptions = ref([
  "Customer Service",
  "Debt Collection",
  "Informational/Notification",
  "Charity",
  "Political",
  "Survey",
  "Telemarketing",
  "Multi-Use Line",
  "Prison*",
  "Do Not Originate",
])

const phoneNumberInput = ref("");
const purpose = ref(selectOptions.value[0]);
const results = ref([] as any[]);
const prepend = ref(false);
const inc = ref(1);

const getNumber = async () => {
  let localNumber = await fetchNumberFromLocalStorage();

  if (!localNumber) {
    localNumber = await fetchNumbersFromApi();
  }

  const newNumber = localNumber.replace(/\D+/g, "");

  phoneNumberInput.value = newNumber;
};

getNumber();

async function fetchNumberFromLocalStorage(): Promise<any> {
  try {
    const localNumbers = await JSON.parse(
        localStorage.getItem("phoneNumbers") || ""
    );

    if (localNumbers && localNumbers.length > 0) {
      const firstNumber = localNumbers.shift();
      localStorage.setItem("phoneNumbers", JSON.stringify(localNumbers));

      return firstNumber;
    }
  } catch (error) {
    console.log(error);
  }

  return null;
};

async function fetchNumbersFromApi(): Promise<any> {
  const key = "7d390ffd2d534abf9090251c15d421eb";

  const response = await fetch(
      `https://randommer.io/api/Phone/Generate?CountryCode=US&Quantity=101`,
      {
        method: "GET",
        headers: {
          "X-Api-Key": key,
        },
      }
  );

  const data = await response.json();

  const apiNumber = data.shift();

  localStorage.setItem("phoneNumbers", JSON.stringify(data));

  return apiNumber;
}

async function handleSubmit(): Promise<void> {
  results.value = []

  const obj = {
    phoneNumber: +phoneNumberInput.value,
    purpose: purpose.value,
    inc: inc.value,
    prepend: prepend.value,
  };

  // Generate List
  await generateNumbers(obj);

  // Reset Form
  purpose.value = selectOptions.value[0];
  inc.value = 1;
  prepend.value = false;
};

async function generateNumbers(obj: any): Promise<void> {
  const { phoneNumber, purpose, inc, prepend } = obj;
  const resultArray = [];

  for (let i = 0; i < inc; i++) {
    const newNumber = `${prepend ? "+" : ""}${phoneNumber + i},${purpose}`;
    resultArray.push(newNumber);
  }

  results.value = resultArray;
};

async function downloadNumbers(): Promise<void> {
  const csvContent = "data:text/csv;charset=utf-8," + results.value.join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  const id = Date.now();
  link.setAttribute("id", id.toString());
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${results.value.length}-phone-numbers.csv`);
  document.body.appendChild(link); // Required for FF
  link.click(); // This will download the data file named "my_data.csv".
  document.body.removeChild(document.getElementById(id.toString()) as HTMLElement);
};

async function formatCount(e: any): Promise<void> {
  const regex = /^[0-9\b]+$/;
  const value = e.target.value;
  if (value === 0 || regex.test(value)) {
    inc.value = value;
  }
};

async function formatPhone(e: any): Promise<void> {
  const regex = /^[0-9\b]+$/;
  const value = e.target.value;
  if (
      (value === 0 || regex.test(value)) &&
      value >= 1 &&
      value <= 99999999999
  ) {
    phoneNumberInput.value = value;
  }
};
</script>

<style scoped>

</style>