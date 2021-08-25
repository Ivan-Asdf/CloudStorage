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
    <div
      class="filebox"
      v-for="file in files"
      :key="file.name"
      :filename="file.name"
      @click.stop="onClick"
      @contextmenu.prevent="onRightClick"
    >
      <div :class="file.type"></div>
      <p>{{ file.name }}</p>
    </div>
  </div>
  <Progress :current="current" :max="max"></Progress>
</template>

<script>
import axios from "axios";

import { uploadFiles, getFileList } from "../files.js";
import { getFilesSize } from "../utils.js";

export default {
  data() {
    return {
      hoverover: false,
      current: 1,
      max: 2,

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
      const fileName = e.currentTarget.getAttribute("filename");
      this.root += "/" + fileName;
      this.refreshBrowsingView();
    },

    onBackClicked(e) {
      const index = this.root.lastIndexOf("/");
      console.log(index);
      this.root = this.root.substring(0, index);

      this.refreshBrowsingView();
    },

    onRightClick(e) {
      const fileName = e.currentTarget.getAttribute("filename");
      const filePath = this.root + "/" + fileName;
      console.log("DOWNLOAD", filePath);
      axios
        .get("http://localhost:6969/download" + filePath, {
          responseType: "blob",
        })
        .then((response) => {
          const url = window.URL.createObjectURL(response.data);
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", fileName);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
        });
    },

    refreshBrowsingView() {
      axios.get("http://localhost:6969/get" + this.root).then((response) => {
        const url = window.ULR;
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
body {
  font-family: Arial;
  font-size: 20px;
}
.droparea {
  background-color: white;
  height: 300px;
  overflow: scroll;
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  border: 3px solid;
  padding: 10px;
}

.filebox {
  height: 115px;
  width: 100px;
  /* border: 1px solid; */
  overflow: hidden;
  align-items: center;
}

.filebox div {
  width: 90px;
  height: 66px;
  background-position: center;
  background-size: contain;
  background-repeat: no-repeat;
  margin: auto;
  /* border: 1px solid; */
}

.file {
  background-image: url(assets/text-x-generic.svg);
}

.dir {
  background-image: url(assets/folder-blue.svg);
}

.filebox p {
  text-align: center;
  font-size: 0.7em;
  margin: 0;
  width: 80px;
  /* border: 1px solid; */
  overflow: hidden;
  word-wrap: break-word;
  margin: auto;
}

body {
  background-color: aqua;
  height: 2000px;
}
.hoverover {
  background-color: red;
}
</style>
