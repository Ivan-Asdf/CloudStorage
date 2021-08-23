import * as Vue from "vue";
import axios from "axios";
import uploadFiles from "./files.js";

const Counter = {
  data() {
    return {
      hoverover: false,
      current: 0,
      max: 0,
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
        uploadFiles(files);
        // wrapper(files);
      });
    },
  },
};

function getFilesSize(files) {
  let size = 0;
  files.forEach((file) => (size += file.size));
  return size;
}

async function getFileList(dataTransferItems) {
  const files = [];
  const promises = [];
  for (let dataTransferItem of dataTransferItems) {
    const fileSystemEntry = dataTransferItem.webkitGetAsEntry();
    promises.push(traverseFileSystem(files, fileSystemEntry));
  }
  await Promise.all(promises);
  return files;
}

// Returns a list of File objects
async function traverseFileSystem(list, fileSystemEntry) {
  const promises = [];
  if (fileSystemEntry.isFile) {
    promises.push(
      new Promise((resolve, reject) => {
        fileSystemEntry.file(
          (file) => {
            list.push(file);
            resolve();
          },
          (err) => console.log(err)
        );
      })
    );
  } else {
    let fsDirReader = fileSystemEntry.createReader();
    const entries = await new Promise((resolve, reject) => {
      fsDirReader.readEntries(
        (entries) => resolve(entries),
        (err) => reject(err)
      );
    });

    for (const entry of entries) {
      promises.push(traverseFileSystem(list, entry));
    }
  }
  await Promise.all(promises);
  // console.log("RETURNED");
}

Vue.createApp(Counter).mount("#app");
