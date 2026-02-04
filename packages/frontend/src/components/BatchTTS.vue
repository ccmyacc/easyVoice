<template>
  <div class="batch-tts">
    <input type="file" accept=".txt" multiple ref="filesRef" />
    <button @click="handleBatch">批量生成 MP3</button>
  </div>
</template>

<script setup>
import { ref } from "vue";

const filesRef = ref(null);

async function handleBatch() {
  const files = filesRef.value.files;
  if (!files.length) return alert("请选择 TXT 文件");

  const form = new FormData();
  for (const f of files) form.append("files", f);

  const res = await fetch("/api/v1/tts/batch", {
    method: "POST",
    body: form,
  });

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "tts_batch.zip";
  a.click();
}
</script>
