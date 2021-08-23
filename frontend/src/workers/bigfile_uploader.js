import axios from "axios";

import { getFileName } from "./utils.js";
import { MAX_REQUEST_SIZE } from "./utils.js";

self.onmessage = (e) => {
  const msg = e.data;
  if (typeof msg === "string") {
    // They check us if work done
    if (concurentRequests || files.length) {
      postMessage("working");
    } else {
      postMessage("done");
    }
  } else {
    // msg is file
    files.push(msg);
    console.log("recieved", files);
  }
};

const MAX_CONCURRENT_REQUESTS = 1;
let concurentRequests = 0;
const files = [];
work();

function work() {
  if (concurentRequests >= MAX_CONCURRENT_REQUESTS) return;
  const file = files.pop();
  if (file !== undefined) {
    sendBigFile(file);
  }
  setTimeout(work, 30);
}

async function sendBigFile(file) {
  const fileName = getFileName(file);
  for (let start = 0; start < file.size; start += MAX_REQUEST_SIZE) {
    const slice = file.slice(start, start + MAX_REQUEST_SIZE);
    const formData = new FormData();
    formData.append(fileName, slice);
    concurentRequests++;
    await axios.post(`http://localhost:6969/upload`, formData);
    concurentRequests--;
  }
}
