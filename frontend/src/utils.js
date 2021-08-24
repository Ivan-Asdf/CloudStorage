export function getFilesSize(files) {
  let size = 0;
  files.forEach((file) => (size += file.size));
  return size;
}
