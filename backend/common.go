package main

import (
	"fmt"
	"net/http"
	"os"
	"regexp"
)

func writeCors(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:9000")
	w.Header().Set("Access-Control-Allow-Methods", "POST")
	w.Header().Set("Access-Control-Allow-Headers", "content-type, content-range, example")
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
