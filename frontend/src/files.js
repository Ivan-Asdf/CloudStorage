export default function uploadFiles(files, sizeCallback) {
  const worker = new Worker(
    new URL("./workers/distributor.js", import.meta.url)
  );

  worker.postMessage(files);
  worker.onmessage = (e) => {
    const msg = e.data;
    if (typeof msg === "object") {
      // console.log("files.js", msg);
      sizeCallback(msg["size"]);
      // console.log("size recieved", msg["size"]);
    } else {
    }
  };
}
