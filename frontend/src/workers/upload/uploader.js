import axios from "axios";

import {
  MAX_REQUEST_SIZE,
  DONE_MSG,
  WORKING_MSG,
  SMALL_FILES_BATCH,
  BIGFILE,
} from "./utils.js";
import { getFilesSize } from "./../../utils.js";

self.onmessage = (e) => {
  const msg = e.data;
  if (typeof msg === "string") {
    // They check us if work done
    if (pendingUploads || fileBatches.length || bigFiles.length) {
      postMessage(WORKING_MSG);
    } else {
      postMessage(DONE_MSG);
    }
  } else {
    if (msg[0] == SMALL_FILES_BATCH) fileBatches.push(msg[1]);
    else if (msg[0] == BIGFILE) bigFiles.push(msg[1]);
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
  const batchSize = getFilesSize(filesBatch);
  const formData = new FormData();
  for (const file of filesBatch) {
    formData.append(file.path, file.self);
  }

  axios
    .post(`http://localhost:6969/upload`, formData)
    .then(() => {
      pendingUploads--;
      postMessage(batchSize);
    })
    .catch((e) => console.error(e));
}

function sendBigFile(file) {
  pendingUploads++;
  sendBySlicing(file)
    .then(() => {
      pendingUploads--;
      postMessage(file.size);
    })
    .catch((e) => console.error(e));
}

async function sendBySlicing(file) {
  for (let start = 0; start < file.size; start += MAX_REQUEST_SIZE) {
    const slice = file.self.slice(start, start + MAX_REQUEST_SIZE);
    const formData = new FormData();
    formData.append(file.path, slice);
    await axios.post(`http://localhost:6969/upload`, formData);
  }
}
