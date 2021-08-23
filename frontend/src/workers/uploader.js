import axios from "axios";

import { getFileName } from "./utils.js";
import { MAX_REQUEST_SIZE } from "./utils.js";

self.onmessage = (e) => {
  const msg = e.data;
  if (typeof msg === "string") {
    // They check us if work done
    if (pendingUploads || fileBatches.length || bigFiles.length) {
      postMessage("working");
    } else {
      postMessage("done");
    }
  } else {
    // msg is files
    if (msg[0] == "smallfiles") fileBatches.push(msg[1]);
    else if (msg[0] == "bigfile") bigFiles.push(msg[1]);
  }
};

const MAX_CONCURRENT_REQUESTS = 6;
let pendingUploads = 0;
const fileBatches = [];
const bigFiles = [];
work();

function work() {
  if (pendingUploads >= MAX_CONCURRENT_REQUESTS) return;

  const batch = fileBatches.pop();
  if (batch !== undefined) {
    sendBatch(batch);
    setTimeout(work, 30);
    return;
  }

  const bigFile = bigFiles.pop();
  if (bigFile !== undefined) {
    sendBigFile(bigFile);
  }
  setTimeout(work, 30);
}

function sendBatch(filesBatch) {
  pendingUploads++;
  console.log("SENDING BATCH");
  const formData = new FormData();
  for (const file of filesBatch) {
    formData.append(getFileName(file), file);
  }

  axios
    .post(`http://localhost:6969/upload`, formData)
    .then(() => pendingUploads--)
    .catch((e) => console.error(e));
}

function sendBigFile(file) {
  pendingUploads++;
  sendBySlicing(file)
    .then((result) => pendingUploads--)
    .catch((e) => console.error(e));
}

async function sendBySlicing(file) {
  const fileName = getFileName(file);
  for (let start = 0; start < file.size; start += MAX_REQUEST_SIZE) {
    const slice = file.slice(start, start + MAX_REQUEST_SIZE);
    const formData = new FormData();
    formData.append(fileName, slice);
    await axios.post(`http://localhost:6969/upload`, formData);
  }
}
