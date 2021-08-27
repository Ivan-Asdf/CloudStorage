package main

import (
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

func init() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)
}

func main() {
	r := mux.NewRouter()
	r.HandleFunc("/upload", upload)
	r.HandleFunc("/get", get)
	r.HandleFunc("/get/{filepath:.+}", get)
	r.HandleFunc("/download/{filepath:.+}", download)
	r.HandleFunc("/delete/{filepath:.+}", delete)
	http.Handle("/", r)

	err := http.ListenAndServe(":6969", r)
	if err != nil {
		log.Printf("Cant start server: %+v", err)
	}
}
