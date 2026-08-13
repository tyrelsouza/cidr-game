<script setup lang="ts">
import { ref, watch } from 'vue'
import type { CidrChoices, CIDR } from "@cidr-game/shared";

const apiUrl = import.meta.env.VITE_API_URL ?? '';

const correct = ref(0);
const incorrect = ref(0);
const cidr = ref<CIDR>({'ip': undefined, 'suffix':-1})
const cidrChoice = ref<CidrChoices>({'ip': '', 'choices': [], 'answer': -1})

async function getCIDRChoice(ip: string, suffix: number){
    const resp = await fetch(`${apiUrl}/api/generate?base=${ip}&suffix=${suffix}`);
    const result = await resp.json();
    cidrChoice.value = result;
}

async function getNewCIDR() {
    const resp = await fetch(`${apiUrl}/api/new_ip`);
    const result = await resp.json();
    cidr.value = result;
}

watch(cidr, async (nextCIDR, _) => {
    if (nextCIDR.ip !== undefined && nextCIDR.suffix !== undefined){
        await getCIDRChoice(nextCIDR.ip, nextCIDR.suffix)
    }
})

function handleChoiceClick(choice: number) {
    if (choice === cidrChoice.value.answer) {
        correct.value++;
    } else {
        incorrect.value++;
    }
    getNewCIDR()
}

function newGame(){
    correct.value = 0;
    incorrect.value = 0;
    getNewCIDR()
}
</script>

<template>
    <h1> CIDR Game </h1>
    <hr />
    <button @click="newGame"> New Game </button>
    <h2 v-if="cidr.ip"> SCORE: ✅{{correct}}/❌{{incorrect}}</h2>
    <div v-if="cidr.ip">
      <h3>{{cidr.ip}}/{{cidr.suffix}}</h3>
      <p> What is the Base IP?</p>
      <button
          v-for="(choice, index) in cidrChoice.choices"
          :key="index"
          @click="handleChoiceClick(index)"
      >
          {{ choice }}
      </button>
    </div>  
</template>
