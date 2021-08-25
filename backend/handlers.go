package main

import (
	"encoding/json"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
)

func upload(w http.ResponseWriter, r *http.Request) {
	log.Println("Request received")

	reader, _ := r.MultipartReader()
	for {
		part, err := reader.NextPart()
		if err != nil {
			if err == io.EOF {
				break
			} else {
				log.Println(err)
				w.WriteHeader(http.StatusBadRequest)
				break
			}
		}

		fileName := part.FormName()
		createNecessaryDirs(fileName)

		bytes, err := ioutil.ReadAll(part)
		if err != nil {
			log.Println(err)
		}
		part.Close()
		writeFile("upload/"+fileName, bytes)
	}

	writeCorsHeaders(w)
	log.Println("Request proccesses")
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
		log.Println(err)
		w.WriteHeader(http.StatusNotFound)
		return
	}

	writeCorsHeaders(w)
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
		log.Println(err)
		return
	}
	_, err = w.Write(bytes)
	if err != nil {
		log.Println(err)
	}
}

func download(w http.ResponseWriter, r *http.Request) {
	writeCorsHeaders(w)
	vars := mux.Vars(r)
	filePath := vars["filepath"]
	fullPath := "upload/" + filePath
	fileHandle, err := os.Open(fullPath)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusNotFound)
		return
	}

	fileInfo, err := fileHandle.Stat()
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	if fileInfo.IsDir() {
		bytes, err := zipFolder(fullPath)
		if err != nil {
			log.Println(err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		_, err = w.Write(bytes)
		if err != nil {
			log.Println(err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
	} else {
		bytes, err := ioutil.ReadAll(fileHandle)
		if err != nil {
			log.Println(err)
		}
		bytesWritten, err := w.Write(bytes)
		if err != nil {
			log.Println(err)
		} else if bytesWritten != len(bytes) {
			log.Printf("Not all bytes written to file expected: %d written: %d\n", len(bytes), bytesWritten)
		}
	}
}
