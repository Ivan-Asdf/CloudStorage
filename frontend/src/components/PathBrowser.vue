<template>
  <div class="container">
    <button id="back_button" @click="onBackClicked">⬅️</button>
    <div
      class="element"
      v-for="(dir, index) in pathArray"
      @click="onPathElementClick(index)"
    >
      {{ dir }}
    </div>
  </div>
</template>

<script>
export default {
  props: ["currentDir"],
  methods: {
    onPathElementClick(index) {
      const newPathArray = this.pathArray.slice(0, index + 1);
      newPathArray.shift();
      const reducer = (acc, curr) => acc + "/" + curr;
      const newCurrentDir = newPathArray.reduce(reducer, "");
      this.$emit("currentPathChanged", newCurrentDir);
    },
    onBackClicked() {
      let newCurrentDir = this.$props["currentDir"];
      const index = newCurrentDir.lastIndexOf("/");
      newCurrentDir = newCurrentDir.substring(0, index);
      this.$emit("currentPathChanged", newCurrentDir);
    },
  },
  computed: {
    pathArray() {
      const pathArray = this.$props["currentDir"]
        .split("/")
        .filter((value) => value);

      pathArray.unshift("root");
      return pathArray;
    },
  },
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: row;
}

.element {
  padding: 0px 10px 0px;
  font-size: 1.3em;
  background: rgb(243, 243, 243);
  cursor: pointer;
}

.element:hover {
  background-color: white;
}

#back_button {
  font-size: 1.3em;
  cursor: pointer;
}
</style>
