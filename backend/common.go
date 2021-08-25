package main

import (
	"archive/zip"
	"bytes"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"regexp"
)

func writeCorsHeaders(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:9000")
	w.Header().Set("Access-Control-Allow-Methods", "POST")
	w.Header().Set("Access-Control-Allow-Headers", "content-type, content-range, example")
}

func writeFile(fileName string, bytes []byte) error {
	f, err := os.OpenFile(fileName, os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0644)
	defer f.Close()
	if err != nil {
		return err
	}

	bytesWritten, err := f.Write(bytes)
	if err != nil {
		return err
	} else if bytesWritten != len(bytes) {
		return fmt.Errorf("Not all bytes written to file expected: %d written: %d", len(bytes), bytesWritten)
	}
	// todo: Make this debug log
	log.Println("Wrote to file", fileName)
	return nil
}

// Given file path will make sure all directories of that path are created
func createNecessaryDirs(path string) error {
	os.MkdirAll("upload", 0744)
	re := regexp.MustCompile(`(.+)/([^/]+)`)
	matches := re.FindStringSubmatch(path)
	if len(matches) > 2 {
		err := os.MkdirAll("upload/"+matches[1], 0744)
		if err != nil {
			return err
		}
	}
	return nil
}

// Splits dir/dir1/file1 -> dir/dir1/, file1
func getDirAndName(path string) (dir, name string) {
	re := regexp.MustCompile(`(.+/)([^/]+)`)
	matches := re.FindStringSubmatch(path)
	return matches[1], matches[2]
}

// Given a folder returns a bytes slice of that folder zipped
func zipFolder(folderPath string) ([]byte, error) {
	buf := new(bytes.Buffer)
	zipWriter := zip.NewWriter(buf)

	dir, name := getDirAndName(folderPath)
	err := addFolderToZip(zipWriter, name, dir)
	if err != nil {
		return nil, err
	}

	zipWriter.Close()
	return buf.Bytes(), nil
}

// Adds a folders files to zip. If any subdirectories are detected it will be called recursively on them.
func addFolderToZip(w *zip.Writer, folderName string, folderPath string) error {
	folderFilesInfo, err := ioutil.ReadDir(folderPath + folderName)
	if err != nil {
		return err
	}
	for _, fileInfo := range folderFilesInfo {
		fileName := folderName + "/" + fileInfo.Name()
		if !fileInfo.IsDir() {
			err := addFileToZip(w, fileName, folderPath)
			if err != nil {
				return fmt.Errorf("Failed to add file %s to zip: %w", folderPath+fileName, err)
			}
		} else {
			err := addFolderToZip(w, fileName, folderPath)
			if err != nil {
				return err
			}
		}
	}
	return nil
}

func addFileToZip(w *zip.Writer, filePath string, basePath string) error {
	fileHandle, err := os.Open(basePath + filePath)
	if err != nil {
		return err
	}
	bytes, err := ioutil.ReadAll(fileHandle)
	if err != nil {
		return err
	}
	f, err := w.Create(filePath)
	if err != nil {
		return err
	}
	_, err = f.Write(bytes)
	if err != nil {
		return err
	}
	return nil
}
