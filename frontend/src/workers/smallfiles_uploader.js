import axios from "axios";

import { getFileName } from "./utils.js";

self.onmessage = (e) => {
  const msg = e.data;
  if (typeof msg === "string") {
    // They check us if work done
    if (concurentRequests || fileBatches.length) {
      postMessage("working");
    } else {
      postMessage("done");
    }
  } else {
    // msg is files
    fileBatches.push(msg);
    console.log("recieved", fileBatches);
  }
};

const MAX_CONCURRENT_REQUESTS = 7;
let concurentRequests = 0;
const fileBatches = [];
work();

function work() {
  if (concurentRequests >= MAX_CONCURRENT_REQUESTS) return;
  const batch = fileBatches.pop();
  if (batch !== undefined) {
    sendBatch(batch);
  }
  setTimeout(work, 30);
}

// Make this not async
async function sendBatch(filesBatch) {
  console.log("SENDING BATCH");
  const formData = new FormData();
  for (const file of filesBatch) {
    formData.append(getFileName(file), file);
  }
  concurentRequests++;
  await axios
    .post(`http://localhost:6969/upload`, formData)
    .catch((e) => console.log(e));
  concurentRequests--;
}
