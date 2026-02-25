package routes

import (
	"fmt"
	"os"
)

type APIError struct {
	Error   string `json:"error"`
	Message string `json:"message"`
}

func handleAPIError(error APIError) {
	if err := fmt.Errorf("Error (%s): %s", error.Error, error.Message); err != nil { panic(err) }
	os.Exit(1)
}
