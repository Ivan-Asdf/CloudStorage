import axios from "axios";
self.addEventListener("message", async function (e) {
  const files = e.data;
  const requestSize = 1000 * 1000 * 200;
  let currentSize = 0;
  let formData = new FormData();
  for (const file of files) {
    let fileName = file.name;
    if (file.webkitRelativePath) fileName = file.webkitRelativePath;

    currentSize += file.size;
    formData.append(fileName, file);
    if (currentSize > requestSize) {
      sendRequest(formData);
      formData = new FormData();
      currentSize == 0;
    }
  }
  // Check if anything left
  sendRequest(formData);
  // await uploadFile(file);
});

function sendRequest(formData) {
  axios.post(`http://localhost:6969/upload`, formData);
}

async function uploadFile(file) {
  let fileName = file.name;
  if (file.webkitRelativePath) fileName = file.webkitRelativePath;
  const increment = 1000 * 1000 * 200;
  for (let start = 0; start < file.size; start += increment) {
    const slice = file.slice(start, start + increment);
    await axios.post(`http://localhost:6969/upload/${fileName}`, slice);
  }
}

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
