export function getFileName(file) {
  let fileName = file.name;
  if (file.webkitRelativePath) fileName = file.webkitRelativePath;

  return fileName;
}

export const MAX_REQUEST_SIZE = 1000 * 1000 * 200;
