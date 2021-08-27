<template>
  <div id="progress" v-if="visible">
    <p>{{ current }} of {{ max }}</p>
    <label for="file">File progress:</label>
    <progress id="file" :max="max" :value="current"></progress>
  </div>
</template>

<script>
export default {
  props: ["current", "max"],
  computed: {
    visible: function () {
      if (this.$props.current === this.$props.max) return false;
      else return true;
    },
  },
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
