package main

import (
	"archive/zip"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"regexp"

	"github.com/gorilla/mux"
)

func upload(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Request received")

	reader, _ := r.MultipartReader()
	for {
		part, err := reader.NextPart()
		if err != nil {
			if err == io.EOF {
				break
			} else {
				fmt.Println("ERROR NextPart", err)
				break
			}
		}

		fileName := part.FormName()
		createDir(fileName)

		bytes, err := ioutil.ReadAll(part)
		part.Close()
		writeFile("upload/"+fileName, bytes)
	}

	writeCors(w)
	fmt.Println("Request proccesses")
}

type FileData struct {
	Type string `json:"type"`
	Name string `json:"name"`
}

func get(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	file := vars["filepath"]

	fileInfo, err := ioutil.ReadDir("upload/" + file)
	if err != nil {
		fmt.Println(err)
	}

	writeCors(w)
	filesData := make([]FileData, 0)
	for _, f := range fileInfo {
		var fileType string
		if f.IsDir() {
			fileType = "dir"
		} else {
			fileType = "file"
		}
		filesData = append(filesData, FileData{fileType, f.Name()})
	}
	bytes, err := json.Marshal(filesData)
	if err != nil {
		fmt.Println(err)
	}
	w.Write(bytes)
}

func download(w http.ResponseWriter, r *http.Request) {
	writeCors(w)
	vars := mux.Vars(r)
	filePath := vars["filepath"]
	fileHandle, err := os.Open("upload/" + filePath)
	if err != nil {
		fmt.Println(err)
	}

	fileInfo, err := fileHandle.Stat()
	if err != nil {
		fmt.Println(err)
	}
	if fileInfo.IsDir() {
		buf := new(bytes.Buffer)
		zipWriter := zip.NewWriter(buf)

		fullPath := "upload/" + filePath
		dir, name := getDir(fullPath)
		fmt.Println("SPLIT", dir, name)
		zipFolder(zipWriter, name, dir)
		zipWriter.Close()
		w.Write(buf.Bytes())

		return
	}

	bytes, err := ioutil.ReadAll(fileHandle)
	if err != nil {
		fmt.Println(err)
	}
	_, err = w.Write(bytes)
	if err != nil {
		fmt.Println(err)
	}
}

func getDir(path string) (dir, name string) {
	re := regexp.MustCompile(`(.+/)([^/]+)`)
	matches := re.FindStringSubmatch(path)
	return matches[1], matches[2]
}

func zipFolder(w *zip.Writer, folderPath string, basePath string) {
	folderFilesInfo, err := ioutil.ReadDir(basePath + folderPath)
	if err != nil {
		fmt.Println(err)
	}
	for _, fileInfo := range folderFilesInfo {
		fileName := folderPath + "/" + fileInfo.Name()
		if !fileInfo.IsDir() {
			fmt.Println("WRITING", fileName)
			fileHandle, err := os.Open(basePath + fileName)
			if err != nil {
				fmt.Println(err)
			}
			bytes, err := ioutil.ReadAll(fileHandle)
			if err != nil {
				fmt.Println(err)
			}
			addFileToZip(w, fileName, bytes)
		} else {
			zipFolder(w, fileName, basePath)
		}
	}
}

func addFileToZip(w *zip.Writer, filePath string, fileData []byte) {
	f, err := w.Create(filePath)
	if err != nil {
		fmt.Println(err)
	}
	_, err = f.Write(fileData)
	if err != nil {
		fmt.Println(err)
	}
}
