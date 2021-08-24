import { MAX_REQUEST_SIZE } from "./utils.js";

self.addEventListener("message", function (e) {
  e.preventDefault();
  e.stopPropagation();
  const files = e.data;
  distributeToWorker(files);
});

const uploadWorker = new Worker(new URL("./uploader.js", import.meta.url));
let uploadWorkerDone = false;

uploadWorker.onmessage = (e) => {
  const msg = e.data;
  if (msg === "done") uploadWorkerDone = true;
  else if (msg === "working") {
  } else {
    // console.log(msg);
    // console.log("distrubuter sent size", { type: "size", size: msg });
    postMessage({ type: "size", size: msg });
  }
};

let currentSize = 0;
let smallFiles = [];

async function distributeToWorker(files) {
  const file = files.pop();
  if (file == undefined) {
    if (currentSize > 0) {
      uploadWorker.postMessage(["smallfiles", smallFiles]);
    }

    checkIfWorkersDone();
  } else if (file.size > 1000 * 1000 * 20) {
    postMessage(`BIG${file.size}`);
    uploadWorker.postMessage(["bigfile", file]);

    setTimeout(distributeToWorker, 0, files);
  } else {
    currentSize += file.size;
    smallFiles.push(file);
    postMessage(
      `Add, ${file.name}, ${file.size}, Current, ${
        currentSize / 1000000.0
      }, FileCount ${files.length}`
    );
    if (currentSize > MAX_REQUEST_SIZE || smallFiles.length > 1000) {
      uploadWorker.postMessage(["smallfiles", smallFiles]);
      smallFiles = [];
      currentSize = 0;
    }

    setTimeout(distributeToWorker, 0, files);
  }
}

async function checkIfWorkersDone() {
  uploadWorker.postMessage("are you done?");

  if (uploadWorkerDone) {
    uploadWorker.terminate();
    self.close();
  } else {
    setTimeout(checkIfWorkersDone, 20);
  }
}
