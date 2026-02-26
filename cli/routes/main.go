package routes

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path"

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
type ClientConfig struct {
  SelfUsernameChanges bool `json:"selfUsernameChanges"`
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
func GetClientConfig() (ClientConfig) {
	auth := getAuth()
	addr, err := url.Parse(auth.Server)
	if err != nil { panic (err) }
	addr.Path = path.Join(addr.Path, "/clientconfig")
	res, err := http.Get(addr.String())
	if err != nil { panic (err) }
	defer res.Body.Close()
	resBody, err := io.ReadAll(res.Body)
	if err != nil { panic (err) }
	var errBody APIError
	if err := json.Unmarshal(resBody, &errBody); err != nil { panic (err) }
	if errBody.Error != "" { handleAPIError(errBody) }
	var body ClientConfig
	if err := json.Unmarshal(resBody, &body); err != nil { panic (err) }
	return body
}