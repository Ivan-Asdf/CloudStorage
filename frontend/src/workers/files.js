import axios from "axios";
self.addEventListener("message", async function (e) {
  e.preventDefault();
  e.stopPropagation();
  const files = e.data;
  console.log("WORKER STARTED");
  wrapper(files);
});

let i = 0;
const requestSize = 1000 * 1000 * 200;
let currentSize = 0;
let requestFiles = [];

async function wrapper(files) {
  const file = files.pop();
  if (file == undefined) {
    if (currentSize > 0) {
      await sendRequest(requestFiles);
    }
    postMessage("FINAL FILE UPLOADED");
  } else if (file.size > 1000 * 1000 * 20) {
    postMessage(`BIG${file.size}`);
    await sendRequest([file]);
    setTimeout(wrapper, 0, files);
  } else {
    currentSize += file.size;
    requestFiles.push(file);
    postMessage(
      `Add, ${file.name}, ${file.size}, Current, ${
        currentSize / 1000000.0
      }, FileCount ${files.length}`
    );
    if (currentSize > requestSize || requestFiles.length > 1000) {
      await sendRequest(requestFiles);
      requestFiles = [];
      currentSize = 0;
    }
    setTimeout(wrapper, 0, files);
  }
}

function getFileName(file) {
  let fileName = file.name;
  if (file.webkitRelativePath) fileName = file.webkitRelativePath;

  return fileName;
}

async function sendRequest(files) {
  console.log("request files:", files);
  const formData = new FormData();
  for (const file of files) {
    formData.append(getFileName(file), file);
  }
  i++;
  postMessage(`REQUEST ${i}`);
  await axios
    .post(`http://localhost:6969/upload`, formData)
    .catch((e) => console.log(e));
  postMessage(`RESPONSE ${i}`);
}

// async function uploadFile(file) {
//   let fileName = file.name;
//   if (file.webkitRelativePath) fileName = file.webkitRelativePath;
//   const increment = 1000 * 1000 * 200;
//   for (let start = 0; start < file.size; start += increment) {
//     const slice = file.slice(start, start + increment);
//     await axios.post(`http://localhost:6969/upload/${fileName}`, slice);
//   }
// }

// console.log("WORKER START", files, files.length);

// const formData = new FormData();
// const promises = [];
// for (let file of files) {
//   promises.push(
//     new Promise((resolve, reject) => {
//       // let fr = new FileReader();
//       // fr.readAsText(file);
//       // fr.onload = function () {
//       formData.append(file.name, file);
//       resolve();
//       // };
//     })
//   );
// }
// Promise.all(promises).then(() => {
//   axios
//     .post("http://localhost:6969/upload", formData)
//     .then((response) => {
//       console.log("Response");
//       console.log("WORKER END");
//       self.close();
//     })
//     .catch((e) => {
//       console.log("ERROR WITH RESPONSE", e);
//       self.close();
//     });
// });
