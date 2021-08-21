export default function doShit(files) {
  const worker = new Worker(new URL("./workers/files.js", import.meta.url));

  worker.postMessage(files);
  // worker.onmessage = (e) => {
  //   const files = e.data();
  //   console.log(e.data);
  // };
}
