import * as Vue from "vue/dist/vue.esm-bundler.js";

const Counter = {
  data() {
    return {
      hoverover: false,
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
      this.hoverover = false;
      console.log("drop happened");

      // Get dropped folder file tree
      const dataTransferItems = e.dataTransfer.items;
      const fileSystemTree = [];
      for (let dataTransferItem of dataTransferItems) {
        const fileSystemEntry = dataTransferItem.webkitGetAsEntry();
        parseEntry(fileSystemTree, fileSystemEntry);
      }
      console.log(fileSystemTree);

      // Create request
    },
  },
};

// Returns a list of File objects
function parseEntry(list, fileSystemEntry) {
  if (fileSystemEntry.isFile) {
    fileSystemEntry.file(
      (file) => {
        list.push({
          type: "file",
          content: file,
        });
      },
      (err) => console.log(err)
    );
  } else {
    let newList = [];
    let fsDirReader = fileSystemEntry.createReader();
    fsDirReader.readEntries(
      (entries) => entries.forEach((entry) => parseEntry(list, entry)),
      (err) => console.log(err)
    );
    // list.push({
    //   type: "dir",
    //   name: fileSystemEntry.name,
    //   content: newList,
    // });
  }

  return list;
}

Vue.createApp(Counter).mount("#app");
