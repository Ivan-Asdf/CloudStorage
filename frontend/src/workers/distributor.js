import { MAX_REQUEST_SIZE } from "./utils.js";

self.addEventListener("message", function (e) {
  e.preventDefault();
  e.stopPropagation();
  const files = e.data;
  wrapper(files);
});

const smallFilesWorker = new Worker(new URL("./uploader.js", import.meta.url));

smallFilesWorker.onmessage = (e) => {
  const msg = e.data;
};

let currentSize = 0;
let smallFiles = [];

async function wrapper(files) {
  const file = files.pop();
  if (file == undefined) {
    if (currentSize > 0) {
      smallFilesWorker.postMessage(["smallfiles", smallFiles]);
    }

    checkIfWorkersDone();
  } else if (file.size > 1000 * 1000 * 20) {
    postMessage(`BIG${file.size}`);
    smallFilesWorker.postMessage(["bigfile", file]);

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
      smallFilesWorker.postMessage(["smallfiles", smallFiles]);
      smallFiles = [];
      currentSize = 0;
    }

    setTimeout(wrapper, 0, files);
  }
}

async function checkIfWorkersDone() {
  smallFilesWorker.postMessage("are you done?");
  const responseSmallFiles = await new Promise(
    (resolve) => (smallFilesWorker.onmessage = (e) => resolve(e.data))
  );

  if (responseSmallFiles === "done") {
    smallFilesWorker.terminate();
    self.close();
  } else {
    setTimeout(checkIfWorkersDone, 20);
    return;
  }
}
