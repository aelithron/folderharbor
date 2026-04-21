package routes

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/url"
	"os"
	"path"
	"strings"
	"syscall"

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
type Grant struct {
	ID string `json:"id"`
	Type string `json:"type"`
	Revoke bool `json:"revoke"`
}
type ClientConfig struct {
  SelfUsernameChanges bool `json:"selfUsernameChanges"`
	Registration bool `json:"registration"`
}
type createRes struct { ID int `json:"id"` }

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
func handleHTTPError(err error) {
	var urlError *url.Error
	if !errors.As(err, &urlError) { panic(err) }
	var opError *net.OpError
	if errors.As(urlError.Err, &opError) {
		address, addrErr := url.Parse(urlError.URL)
		if addrErr != nil { panic(addrErr) }
		if errors.Is(opError.Err, syscall.ECONNREFUSED) {
			fmt.Println(`Error: The FolderHarbor server at "` + address.Scheme + "://" + address.Host + `" is unreachable!`)
			fmt.Println(`Please contact your administrator, or log in to a different server with "folderharbor auth login".`);
			os.Exit(1)
		}
		var dnsError *net.DNSError
		if errors.As(opError.Err, &dnsError) {
			fmt.Println(`Error: The FolderHarbor server at "` + address.Scheme + "://" + address.Host + `" could not be found!`)
			fmt.Println(`Please contact your administrator, or log in to a different server with "folderharbor auth login".`);
			os.Exit(1)
		}
	}
	panic(err)
}
func GetServerAddress() (string) {
	server, err := url.Parse(viper.GetString("server"))
	if err != nil {
		fmt.Fprintf(os.Stderr, "You aren't logged in to a FolderHarbor server!\nPlease run " + `"folderharbor auth login"` + " to log in.\n")
		os.Exit(1)
	}
	return server.String()
}
func GetClientConfig(address string) (ClientConfig) {
	if !strings.Contains(address, "://") { address = "https://" + address }
	addr, err := url.Parse(address)
	if err != nil { panic (err) }
	addr.Path = path.Join(addr.Path, "/clientconfig")
	res, err := http.Get(addr.String())
	if err != nil { handleHTTPError(err) }
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