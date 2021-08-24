export function getFileName(file) {
  let fileName = file.name;
  if (file.webkitRelativePath) fileName = file.webkitRelativePath;

  return fileName;
}

export const MAX_REQUEST_SIZE = 1000 * 1000 * 200;

export const SMALL_FILES_BATCH = "smallfiles";
export const BIGFILE = "bigfile";

export const CHECK_IF_DONE_MSG = "are you still working?";
export const DONE_MSG = "done";
export const WORKING_MSG = "working";
