import { DONE_MSG } from "./workers/upload/utils.js";

export function uploadFiles(files, sizeCallback) {
  const worker = new Worker(
    new URL("./workers/upload/distributor.js", import.meta.url)
  );

  worker.postMessage(files);

  return new Promise((resolve) => {
    worker.onmessage = (e) => {
      const msg = e.data;
      if (typeof msg === "object") {
        sizeCallback(msg["size"]);
      } else {
        if (msg === DONE_MSG) {
          resolve();
        }
      }
    };
  });
}

export async function getFileList(dataTransferItems) {
  const files = [];
  const promises = [];
  for (let dataTransferItem of dataTransferItems) {
    const fileSystemEntry = dataTransferItem.webkitGetAsEntry();
    promises.push(traverseFileSystem(files, fileSystemEntry));
  }
  await Promise.all(promises);
  return files;
}

// Returns a list of File objects
async function traverseFileSystem(list, fileSystemEntry) {
  const promises = [];
  if (fileSystemEntry.isFile) {
    promises.push(
      new Promise((resolve) => {
        fileSystemEntry.file(
          (file) => {
            // Wrap file
            list.push({
              self: file,
              path: fileSystemEntry.fullPath,
              size: file.size,
            });
            resolve();
          },
          (err) => console.log(err)
        );
      })
    );
  } else {
    let fsDirReader = fileSystemEntry.createReader();
    const entries = await new Promise((resolve, reject) => {
      fsDirReader.readEntries(
        (entries) => resolve(entries),
        (err) => reject(err)
      );
    });

    for (const entry of entries) {
      promises.push(traverseFileSystem(list, entry));
    }
  }
  await Promise.all(promises);
}
