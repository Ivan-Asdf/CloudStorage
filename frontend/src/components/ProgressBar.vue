<template>
  <div id="progress">
    <p>{{ current }} of {{ max }}</p>
    <label for="file">File progress:</label>
    <progress id="file" :max="max" :value="current"></progress>
  </div>
</template>

<script>
export default {
  props: ["current", "max"],
};
</script>

<style scoped>
#progress {
  background-color: cadetblue;
  position: fixed;
  bottom: 20px;
  right: 20px;
}
</style>
