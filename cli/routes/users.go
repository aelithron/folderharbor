package routes

import (
	"encoding/json"
	"io"
	"net/http"
	"net/url"
	"path"
)

type UserList struct { 
	UserID int `json:"id"`
	Username string `json:"username"`
}
func ListUsers() (UserList) {
	auth := getAuth()
	addr, err := url.Parse(auth.Server)
	if err != nil { panic (err) }
	addr.Path = path.Join(addr.Path, "/admin/users")
	req, err := http.NewRequest(http.MethodGet, addr.String(), nil)
	cookie := http.Cookie{ Name: "token", Value: auth.Token, Path: "/" }
	req.AddCookie(&cookie)
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
	var body UserList
	if err := json.Unmarshal(resBody, &body); err != nil { panic (err) }
	return body	
}