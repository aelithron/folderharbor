package routes

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/url"
	"path"
)

type ConfigEdit struct {
	key string
	value string
}
func ReadConfig() (map[string]any) {
	auth := getAuth()
	addr, err := url.Parse(auth.Server)
	if err != nil { panic (err) }
	addr.Path = path.Join(addr.Path, "/admin/config")
	req, err := http.NewRequest(http.MethodGet, addr.String(), nil)
	cookie := http.Cookie{ Name: "token", Value: auth.Token, Path: "/" }
	req.AddCookie(&cookie)
	req.Header.Add("Content-Type", "application/json")
	if err != nil { panic (err) }
	client := &http.Client{}
	res, err := client.Do(req)
	if err != nil { panic (err) }
	defer res.Body.Close()
	resBody, err := io.ReadAll(res.Body)
	if err != nil { panic (err) }
	var errBody APIError
	if err := json.Unmarshal(resBody, &errBody); err != nil { panic (err) }
	if errBody.Error != "" { handleAPIError(errBody) }
	var body map[string]any
	if err := json.Unmarshal(resBody, &body); err != nil { panic (err) }
	return body
}
func EditConfig(change ConfigEdit) {
	auth := getAuth()
	reqBody, _ := json.Marshal((map[string]any{ change.key: change.value }))
	addr, err := url.Parse(auth.Server)
	if err != nil { panic (err) }
	addr.Path = path.Join(addr.Path, "/admin/config")
	req, err := http.NewRequest(http.MethodPatch, addr.String(), bytes.NewBuffer(reqBody))
	cookie := http.Cookie{ Name: "token", Value: auth.Token, Path: "/" }
	req.AddCookie(&cookie)
	req.Header.Add("Content-Type", "application/json")
	if err != nil { panic (err) }
	client := &http.Client{}
	res, err := client.Do(req)
	if err != nil { panic (err) }
	defer res.Body.Close()
	resBody, err := io.ReadAll(res.Body)
	if err != nil { panic (err) }
	var errBody APIError
	if err := json.Unmarshal(resBody, &errBody); err != nil { panic (err) }
	if errBody.Error != "" { handleAPIError(errBody) }
}