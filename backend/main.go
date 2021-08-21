package main

import (
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"regexp"
	"time"
)

type myHandler struct{}

func (h *myHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// fmt.Println("Request received")
	defer r.Body.Close()

	reader, _ := r.MultipartReader()
	for {
		part, err := reader.NextPart()
		if err != nil {
			if err == io.EOF {
				break
			} else {
				fmt.Println("ERROR NextPart", err)
			}
		}

		fileName := part.FormName()
		createDir(fileName)

		bytes, err := ioutil.ReadAll(part)
		writeFile(fileName, bytes)
	}

	writeCors(w)
	// fmt.Println("Request proccesses")
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
}

func createDir(path string) {
	re := regexp.MustCompile(`(.+)/([^/]+)`)
	matches := re.FindStringSubmatch(path)
	fmt.Println("Matches", matches)
	if len(matches) > 2 {
		err := os.MkdirAll(matches[1], 0744)
		if err != nil {
			fmt.Println(err)
		}
	}
}

// Get filename to write to and also make sure all directories are created.
// func getFileName(path string) string {
// 	re := regexp.MustCompile(`/(.+)/([^/]+)`)
// 	matches := re.FindStringSubmatch(path)
// 	err := os.MkdirAll(matches[1], 0744)
// 	if err != nil {
// 		fmt.Println(err)
// 	}
// 	return matches[1] + "/" + matches[2]
// }

func main() {
	s := http.Server{
		Addr:           ":6969",
		Handler:        &myHandler{},
		ReadTimeout:    5 * time.Minute,
		WriteTimeout:   5 * time.Minute,
		MaxHeaderBytes: 1 << 20,
	}

	s.ListenAndServe()
}

func writeCors(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:9000")
	w.Header().Set("Access-Control-Allow-Methods", "POST")
	w.Header().Set("Access-Control-Allow-Headers", "content-type, content-range, example")
	_, err := w.Write([]byte("ZDR file uploaded"))
	if err != nil {
		fmt.Println(err)
	}
}
