package main

import (
	"net/http"

	"github.com/gorilla/mux"
)

func main() {
	// http.HandleFunc("/upload", upload)
	// http.HandleFunc("/get/{wildcard}", get)
	r := mux.NewRouter()
	r.HandleFunc("/upload", upload)
	r.HandleFunc("/get", get)
	r.HandleFunc("/get/{filepath:.+}", get)
	r.HandleFunc("/download", download)
	r.HandleFunc("/download/{filepath:.+}", download)
	http.Handle("/", r)

	http.ListenAndServe(":6969", r)
}
