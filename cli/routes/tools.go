package routes

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"path"
)

type AuditLog struct {
	PageCount int `json:"pageCount"`
	Logs []LogEntry `json:"logs"`
}
type LogEntry struct {
	UserID int `json:"userID"`
	Username string `json:"username"`
	Action string `json:"action"`
	Body json.RawMessage `json:"body"`
  Blurb string `json:"blurb"`
	CreatedAt string `json:"createdAt"`
}
type Permission struct {
	ID string `json:"id"`
	Description string `json:"description"`
}
type ProviderList struct {
	WebDAV string `json:"webdav"`
	FTP string `json:"ftp"`
}

func ReadLogs(page int) (AuditLog) {
	auth := getAuth()
	addr, err := url.Parse(auth.Server)
	if err != nil { panic (err) }
	addr.Path = path.Join(addr.Path, "/admin/logs")
	query := addr.Query()
	query.Add("page", fmt.Sprint(page))
	addr.RawQuery = query.Encode()
	req, err := http.NewRequest(http.MethodGet, addr.String(), nil)
	cookie := http.Cookie{ Name: "token", Value: auth.Token, Path: "/" }
	req.AddCookie(&cookie)
	if err != nil { panic (err) }
	client := &http.Client{}
	res, err := client.Do(req)
	if err != nil { handleHTTPError(err) }
	defer res.Body.Close()
	resBody, err := io.ReadAll(res.Body)
	if err != nil { panic (err) }
	if res.StatusCode != 200 {
		var errBody APIError
		if err := json.Unmarshal(resBody, &errBody); err != nil { panic (err) }
		if errBody.Error != "" { handleAPIError(errBody) }
	}
	var body AuditLog
	if err := json.Unmarshal(resBody, &body); err != nil { panic (err) }
	return body
}
func GetPermissions() ([]Permission) {
	auth := getAuth()
	addr, err := url.Parse(auth.Server)
	if err != nil { panic (err) }
	addr.Path = path.Join(addr.Path, "/admin/permissions")
	req, err := http.NewRequest(http.MethodGet, addr.String(), nil)
	cookie := http.Cookie{ Name: "token", Value: auth.Token, Path: "/" }
	req.AddCookie(&cookie)
	if err != nil { panic (err) }
	client := &http.Client{}
	res, err := client.Do(req)
	if err != nil { handleHTTPError(err) }
	defer res.Body.Close()
	resBody, err := io.ReadAll(res.Body)
	if err != nil { panic (err) }
	if res.StatusCode != 200 {
		var errBody APIError
		if err := json.Unmarshal(resBody, &errBody); err != nil { panic (err) }
		if errBody.Error != "" { handleAPIError(errBody) }
	}
	var body []Permission
	if err := json.Unmarshal(resBody, &body); err != nil { panic (err) }
	return body
}
func GetProtocols() (ProviderList) {
	auth := getAuth()
	addr, err := url.Parse(auth.Server)
	if err != nil { panic (err) }
	addr.Path = path.Join(addr.Path, "/protocols")
	req, err := http.NewRequest(http.MethodGet, addr.String(), nil)
	cookie := http.Cookie{ Name: "token", Value: auth.Token, Path: "/" }
	req.AddCookie(&cookie)
	if err != nil { panic (err) }
	client := &http.Client{}
	res, err := client.Do(req)
	if err != nil { handleHTTPError(err) }
	defer res.Body.Close()
	resBody, err := io.ReadAll(res.Body)
	if err != nil { panic (err) }
	if res.StatusCode != 200 {
		var errBody APIError
		if err := json.Unmarshal(resBody, &errBody); err != nil { panic (err) }
		if errBody.Error != "" { handleAPIError(errBody) }
	}
	var body ProviderList
	if err := json.Unmarshal(resBody, &body); err != nil { panic (err) }
	return body
}