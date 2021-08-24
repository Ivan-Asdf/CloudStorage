export function uploadFiles(files, sizeCallback) {
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
      new Promise((resolve, reject) => {
        fileSystemEntry.file(
          (file) => {
            list.push(file);
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
