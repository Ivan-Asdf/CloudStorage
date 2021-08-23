import { MAX_REQUEST_SIZE } from "./utils.js";

self.addEventListener("message", async function (e) {
  e.preventDefault();
  e.stopPropagation();
  const files = e.data;
  console.log("WORKER STARTED");
  wrapper(files);
});

const smallFilesWorker = new Worker(
  new URL("./smallfiles_uploader.js", import.meta.url)
);

const bigFileWorker = new Worker(
  new URL("./bigfile_uploader.js", import.meta.url)
);

let currentSize = 0;
let smallFiles = [];

async function wrapper(files) {
  const file = files.pop();
  if (file == undefined) {
    if (currentSize > 0) {
      smallFilesWorker.postMessage(smallFiles);
    }

    checkIfWorkersDone();
  } else if (file.size > 1000 * 1000 * 20) {
    postMessage(`BIG${file.size}`);
    bigFileWorker.postMessage(file);

    setTimeout(wrapper, 0, files);
  } else {
    currentSize += file.size;
    smallFiles.push(file);
    postMessage(
      `Add, ${file.name}, ${file.size}, Current, ${
        currentSize / 1000000.0
      }, FileCount ${files.length}`
    );
    if (currentSize > MAX_REQUEST_SIZE || smallFiles.length > 1000) {
      smallFilesWorker.postMessage(smallFiles);
      smallFiles = [];
      currentSize = 0;
    }

    setTimeout(wrapper, 0, files);
  }
}

// Not efficient
async function checkIfWorkersDone() {
  smallFilesWorker.postMessage("are you done?");
  const responseSmallFiles = await new Promise(
    (resolve) => (smallFilesWorker.onmessage = (e) => resolve(e.data))
  );

  bigFileWorker.postMessage("are you done?");
  const responseBigFile = await new Promise(
    (resolve) => (bigFileWorker.onmessage = (e) => resolve(e.data))
  );
  console.log("WORKER RESPONSE", responseSmallFiles, responseBigFile);

  if (responseSmallFiles === "done" && responseBigFile == "done") {
    smallFilesWorker.terminate();
    bigFileWorker.terminate();
    self.close();
  } else {
    setTimeout(checkIfWorkersDone, 20);
    return;
  }
}
