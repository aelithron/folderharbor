package routes

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/url"
	"path"
	"strings"

	"github.com/spf13/viper"
)

type login struct {
	Username string `json:"username"`
	Password string `json:"password"` 
}
type authRes struct { Token string `json:"token"` }
type LoginResult struct {
	Username string
	Session int
}
func Login(address, username, password string) (LoginResult) {
	reqBody, _ := json.Marshal(&login{ Username: username, Password: password })
	if !strings.Contains(address, "://") { address = "https://" + address }
	addr, err := url.Parse(address)
	if err != nil { panic (err) }
	addr.Path = path.Join(addr.Path, "/auth")
	resp, err := http.Post(addr.String(), "application/json", bytes.NewBuffer(reqBody))
	if err != nil { handleHTTPError(err) }
	defer resp.Body.Close()
	resBody, err := io.ReadAll(resp.Body)
	if err != nil { panic (err) }
	var errBody APIError
	if err := json.Unmarshal(resBody, &errBody); err != nil { panic (err) }
	if errBody.Error != "" { handleAPIError(errBody) }
	var body authRes
	if err := json.Unmarshal(resBody, &body); err != nil { panic (err) }
	viper.Set("server", addr.Scheme + "://" + addr.Host)
	viper.Set("token", body.Token)
	viper.WriteConfig()
  selfInfo := GetOwnInfo()
	return LoginResult{ Username: selfInfo.Username, Session: selfInfo.ActiveSession }
}
func LoginToken(address, token string) (LoginResult) {
	addr, err := url.Parse(address)
	if err != nil { panic (err) }
	addr.Path = path.Join(addr.Path, "/me")
	req, err := http.NewRequest(http.MethodGet, addr.String(), nil)
	cookie := http.Cookie{ Name: "token", Value: token, Path: "/" }
	req.AddCookie(&cookie)
	client := &http.Client{}
	res, err := client.Do(req)
	if err != nil { handleHTTPError(err) }
	defer res.Body.Close()
	resBody, err := io.ReadAll(res.Body)
	var errBody APIError
	if err := json.Unmarshal(resBody, &errBody); err != nil { panic (err) }
	if errBody.Error != "" { handleAPIError(errBody) }
	var body SelfInfo
	if err := json.Unmarshal(resBody, &body); err != nil { panic (err) }
	if err != nil { panic (err) }
	viper.Set("server", addr.Scheme + "://" + addr.Host)
	viper.Set("token", token)
	viper.WriteConfig()
	return LoginResult{ Username: body.Username, Session: body.ActiveSession }
}
func Logout(invalidate bool) {
	auth := getAuth()
	if invalidate == false {
		viper.Set("server", "")
		viper.Set("token", "")
		viper.WriteConfig()
		return
	}
	addr, err := url.Parse(auth.Server)
	if err != nil { panic (err) }
	addr.Path = path.Join(addr.Path, "/auth")
	req, err := http.NewRequest(http.MethodDelete, addr.String(), nil)
	cookie := http.Cookie{ Name: "token", Value: auth.Token, Path: "/" }
	req.AddCookie(&cookie)
	if err != nil { panic (err) }
	client := &http.Client{}
	res, err := client.Do(req)
	if err != nil { handleHTTPError(err) }
	defer res.Body.Close()
	resBody, err := io.ReadAll(res.Body)
	if err != nil { panic (err) }
	if len(resBody) == 0 {
		viper.Set("server", "")
		viper.Set("token", "")
		viper.WriteConfig()
		return
	}
	var errBody APIError
	if err := json.Unmarshal(resBody, &errBody); err != nil { panic (err) }
	if errBody.Error != "" { handleAPIError(errBody) }
}
func Register(address, username, password string) {
	reqBody, _ := json.Marshal(&login{ Username: username, Password: password })
	if !strings.Contains(address, "://") { address = "https://" + address }
	addr, err := url.Parse(address)
	if err != nil { panic (err) }
	addr.Path = path.Join(addr.Path, "/auth/register")
	resp, err := http.Post(addr.String(), "application/json", bytes.NewBuffer(reqBody))
	if err != nil { handleHTTPError(err) }
	defer resp.Body.Close()
	resBody, err := io.ReadAll(resp.Body)
	if err != nil { panic (err) }
	var errBody APIError
	if err := json.Unmarshal(resBody, &errBody); err != nil { panic (err) }
	if errBody.Error != "" { handleAPIError(errBody) }
	var body authRes
	if err := json.Unmarshal(resBody, &body); err != nil { panic (err) }
	viper.Set("server", addr.Scheme + "://" + addr.Host)
	viper.Set("token", body.Token)
	viper.WriteConfig()
}