<template>
  <button @click="onBackClicked">Back</button>
  <p>Current dir: {{ root }}</p>
  <div
    class="droparea"
    v-bind:class="{ hoverover: hoverover }"
    @drop.prevent="drop"
    @dragenter.prevent="dragEnter"
    @dragleave.prevent="dragLeave"
    @dragover.prevent
  >
    <div v-for="file in files" :key="file.name">
      <div :class="file.type" @click="onClick">{{ file.name }}</div>
    </div>
  </div>
  <div id="progress">
    <p>{{ current }} of {{ max }}</p>
    <label for="file">File progress:</label>
    <progress id="file" :max="max" :value="current"></progress>
  </div>
  <test></test>
</template>

<script>
import axios from "axios";

import { uploadFiles, getFileList } from "./files.js";
import { getFilesSize } from "./utils.js";

// import folder from "./assets/folder-blue.svg";

export default {
  data() {
    return {
      hoverover: false,
      current: 0,
      max: 0,

      root: "",
      files: null,
    };
  },
  methods: {
    dragEnter(e) {
      console.log("DragEnter");
      this.hoverover = true;
    },
    dragLeave(e) {
      console.log("DragLeave");
      this.hoverover = false;
    },
    drop(e) {
      e.preventDefault();
      e.stopPropagation();
      this.hoverover = false;
      console.log("drop happened");

      // Get dropped folder file tree
      const dataTransferItems = e.dataTransfer.items;
      // console.log(dataTransferItems[0].webkitGetAsEntry().filesystem);
      getFileList(dataTransferItems).then((files) => {
        console.log("Main files", files);
        this.max = getFilesSize(files);
        this.current = 0;
        uploadFiles(files, this.addSizeUi);
        axios.get("http://localhost:6969/get").then((response) => {
          const data = response.data;
          this.files = data;
          console.log(data);
        });
      });
    },

    addSizeUi(size) {
      this.current += size;
    },

    onClick(e) {
      const fileName = e.target.textContent;
      this.root += "/" + fileName;
      console.log("FILE CLICKED", fileName);
      this.refreshBrowsingView();
    },

    onBackClicked(e) {
      const index = this.root.lastIndexOf("/");
      console.log(index);
      this.root = this.root.substring(0, index);

      this.refreshBrowsingView();
    },

    refreshBrowsingView() {
      axios.get("http://localhost:6969/get" + this.root).then((response) => {
        const data = response.data;
        this.files = data;
        console.log(data);
      });
    },
  },
  mounted() {
    this.refreshBrowsingView();
  },
};
</script>

<style>
.droparea {
  background-color: white;
  height: 300px;
  overflow: scroll;
  display: grid;
  grid-template-columns: repeat(10, 1fr);
}

.file {
  height: 100px;
  width: 100px;
  /* background-image: url(text-x-generic.svg); */
  background-size: cover;
}

.dir {
  height: 100px;
  width: 100px;
  /* background-image: url(folder-blue.svg); */
  background-size: cover;
}

body {
  background-color: aqua;
  height: 2000px;
}
.hoverover {
  background-color: red;
}

#progress {
  background-color: cadetblue;
  position: fixed;
  bottom: 20px;
  right: 20px;
}
</style>
