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
	fmt.Fprintf(os.Stderr, "Error (%s): %s\n", error.Error, error.Message)
	os.Exit(1)
}