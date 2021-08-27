import {
  MAX_REQUEST_SIZE,
  CHECK_IF_DONE_MSG,
  DONE_MSG,
  WORKING_MSG,
  SMALL_FILES_BATCH,
  BIGFILE,
} from "./utils.js";

self.addEventListener("message", function (e) {
  const files = e.data;
  distributeToWorker(files);
});

const uploadWorker = new Worker(new URL("./uploader.js", import.meta.url));
let uploadWorkerDone = false;

uploadWorker.onmessage = (e) => {
  const msg = e.data;
  if (msg === DONE_MSG) uploadWorkerDone = true;
  else if (msg === WORKING_MSG) {
  } else {
    postMessage({ type: "size", size: msg });
  }
};

let currentSize = 0;
let smallFiles = [];

async function distributeToWorker(files) {
  const file = files.pop();
  if (file == undefined) {
    if (currentSize > 0) {
      uploadWorker.postMessage([SMALL_FILES_BATCH, smallFiles]);
    }

    checkIfWorkersDone();
  } else if (file.size > 1000 * 1000 * 20) {
    postMessage(`BIG${file.size}`);
    uploadWorker.postMessage([BIGFILE, file]);

    setTimeout(distributeToWorker, 0, files);
  } else {
    currentSize += file.size;
    smallFiles.push(file);
    postMessage(
      `Add, ${file.path}, ${file.size}, Current, ${
        currentSize / 1000000.0
      }, FileCount ${files.length}`
    );
    if (currentSize > MAX_REQUEST_SIZE || smallFiles.length > 1000) {
      uploadWorker.postMessage([SMALL_FILES_BATCH, smallFiles]);
      smallFiles = [];
      currentSize = 0;
    }

    setTimeout(distributeToWorker, 0, files);
  }
}

async function checkIfWorkersDone() {
  uploadWorker.postMessage(CHECK_IF_DONE_MSG);

  if (uploadWorkerDone) {
    uploadWorker.terminate();
    self.postMessage(DONE_MSG);
    self.close();
  } else {
    setTimeout(checkIfWorkersDone, 20);
  }
}
