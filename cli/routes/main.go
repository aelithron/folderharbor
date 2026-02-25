package routes

import (
	"fmt"
	"net/url"
	"os"

	"github.com/spf13/viper"
)

type APIError struct {
	Error   string `json:"error"`
	Message string `json:"message"`
}
type AuthInfo struct {
	Token string
	Server string
}
func getAuth() (AuthInfo) {
	token := viper.GetString("token")
	server, err := url.Parse(viper.GetString("server"))
	if err != nil { panic (err) }
	if token == "" {
		fmt.Fprintf(os.Stderr, "You aren't logged in to a FolderHarbor server!\nPlease run " + `"folderharbor auth login"` + " to log in.\n")
		os.Exit(1)
	}
	return AuthInfo{ Token: token, Server: server.String() }
}
func handleAPIError(error APIError) {
	fmt.Fprintf(os.Stderr, "Error (%s): %s\n", error.Error, error.Message)
	os.Exit(1)
}