<template>
  <div
    id="context_menu"
    v-if="visible"
    :style="{ left: x, top: y }"
    @focusout="onFocusOut"
  >
    <button class="contextmenu_button" @click="onDownload">⬇️ Download</button>
    <button class="contextmenu_button" @click="onDelete">🗑️ Delete</button>
  </div>
</template>

<script>
import axios from "axios";

export default {
  props: ["visible", "x", "y", "currentDir", "clickedFile"],
  methods: {
    onDownload() {
      let fileName = this.$props.clickedFile.name;
      const filePath = this.$props.currentDir + "/" + fileName;
      axios
        .get("http://localhost:6969/download" + filePath, {
          responseType: "blob",
        })
        .then((response) => {
          const url = window.URL.createObjectURL(response.data);
          const link = document.createElement("a");
          link.href = url;
          if (this.$props.clickedFile.type == "dir") fileName += ".zip";
          link.setAttribute("download", fileName);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
        });
    },

    onDelete() {
      const filePath =
        this.$props.currentDir + "/" + this.$props.clickedFile.name;
      axios
        .get("http://localhost:6969/delete" + filePath)
        .then(() => this.$emit("fileDeleted"));
    },
  },
};
</script>

<style scoped>
#context_menu {
  background-color: cadetblue;
  position: fixed;

  display: flex;
  flex-direction: column;
  box-shadow: 2px;
}

.contextmenu_button {
  border: unset;
  text-align: left;
}

.contextmenu_button:hover {
  background-color: rgb(223, 223, 223);
}
</style>
