package main

import (
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

func writeFile(fileName string, bytes []byte) {
	f, err := os.OpenFile(fileName, os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0644)
	defer f.Close()
	if err != nil {
		fmt.Println(err)
	}

	n, err := f.Write(bytes)
	if err != nil {
		fmt.Println(err)
	} else if n != len(bytes) {
		fmt.Println("ERROR: did not write entire buffer to file")
	}
	fmt.Println("Wrote to file", fileName)
}

func createDir(path string) {
	os.MkdirAll("upload", 0744)
	re := regexp.MustCompile(`(.+)/([^/]+)`)
	matches := re.FindStringSubmatch(path)
	// fmt.Println("Matches", matches)
	if len(matches) > 2 {
		err := os.MkdirAll("upload/"+matches[1], 0744)
		if err != nil {
			fmt.Println(err)
		}
	}
}

func main() {
	// http.HandleFunc("/upload", upload)
	// http.HandleFunc("/get/{wildcard}", get)
	r := mux.NewRouter()
	r.HandleFunc("/upload", upload)
	r.HandleFunc("/get", get)
	r.HandleFunc("/get/{dir:.+}", get)
	http.Handle("/", r)

	http.ListenAndServe(":6969", r)
}

func writeCors(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:9000")
	w.Header().Set("Access-Control-Allow-Methods", "POST")
	w.Header().Set("Access-Control-Allow-Headers", "content-type, content-range, example")
}

type FileData struct {
	Type string `json:"type"`
	Name string `json:"name"`
}

func get(w http.ResponseWriter, r *http.Request) {
	// fmt.Println(r.URL.Path)

	vars := mux.Vars(r)
	file := vars["dir"]
	// fmt.Println(dir)

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
