<template>
  <PathBrowser
    :currentDir="currentDir"
    @currentPathChanged="currentDir = $event"
  />
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
      :filetype="file.type"
      @click.stop="onClick"
      @contextmenu.prevent="onRightClick"
    >
      <div :class="file.type"></div>
      <p>{{ file.name }}</p>
    </div>
  </div>
  <ProgressBar :current="currentProgress" :max="maxProgress" />
  <ContextMenu
    :visible="contextMenuVisible"
    :x="rightClickX"
    :y="rightClickY"
    :currentDir="currentDir"
    :clickedFile="clickedFile"
    @fileDeleted="refreshBrowsingView"
  />
</template>

<script>
import axios from "axios";

import { uploadFiles, getFileList } from "./files.js";
import { getFilesSize } from "./utils.js";

import ProgressBar from "./components/ProgressBar.vue";
import ContextMenu from "./components/ContextMenu.vue";
import PathBrowser from "./components/PathBrowser.vue";

export default {
  components: {
    ProgressBar: ProgressBar,
    ContextMenu: ContextMenu,
    PathBrowser: PathBrowser,
  },
  data() {
    return {
      hoverover: false,

      currentProgress: 0,
      maxProgress: 0,

      currentDir: "",
      files: null,

      contextMenuVisible: false,
      rightClickX: 20,
      rightClickY: 20,
      clickedFile: null,
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
      getFileList(dataTransferItems).then((files) => {
        files.forEach((file) => (file.path = this.currentDir + file.path));
        console.log("Main files", files);
        this.maxProgress = getFilesSize(files);
        this.currentProgress = 0;
        uploadFiles(files, this.addSizeUi).then(() => {
          this.refreshBrowsingView();
        });
      });
    },

    addSizeUi(size) {
      this.currentProgress += size;
    },

    onClick(e) {
      const fileName = e.currentTarget.getAttribute("filename");
      const fileType = e.currentTarget.getAttribute("filetype");
      if (fileType === "dir") {
        this.currentDir += "/" + fileName;
      }
    },

    onRightClick(e) {
      this.contextMenuVisible = true;
      this.rightClickX = e.pageX;
      this.rightClickY = e.pageY;
      this.clickedFile = {
        name: e.currentTarget.getAttribute("filename"),
        type: e.currentTarget.getAttribute("filetype"),
      };
    },

    refreshBrowsingView() {
      axios
        .get("http://localhost:6969/get" + this.currentDir)
        .then((response) => {
          const data = response.data;
          this.files = data;
          // console.log(data);
        });
    },
  },
  watch: {
    currentDir: function () {
      this.refreshBrowsingView();
    },
  },
  mounted() {
    this.refreshBrowsingView();
    window.addEventListener("click", () => {
      this.contextMenuVisible = false;
    });
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
  overflow: auto;
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  border: 3px solid;
  padding: 10px;
}

.filebox {
  height: 115px;
  width: 100px;
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
  overflow: hidden;
  word-wrap: break-word;
  margin: auto;
}

body {
  background-color: rgb(236, 235, 235);
  height: 2000px;
}
.hoverover {
  background-color: red;
}
</style>
