package routes

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"path"
)

type UserList struct { 
	UserID int `json:"id"`
	Username string `json:"username"`
}
type User struct {
	AccessLevel string `json:"access"`
	Username string `json:"username"`
	Locked bool `json:"locked"`
	FailedLogins int `json:"failedLogins"`

	Sessions []Session `json:"sessions"`
	Roles []int `json:"roles"`
	ACLs []int `json:"acls"`
	Permissions []string `json:"permissions"`
}
type UserInfoWrite struct {
	Username string `json:"username,omitempty"`
	Password string `json:"password,omitempty"`
	ClearLoginAttempts bool `json:"clearLoginAttempts,omitempty"`
}

func ListUsers() ([]UserList) {
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
	if res.StatusCode != 200 {
		var errBody APIError
		if err := json.Unmarshal(resBody, &errBody); err != nil { panic (err) }
		if errBody.Error != "" { handleAPIError(errBody) }
	}
	var body []UserList
	if err := json.Unmarshal(resBody, &body); err != nil { panic (err) }
	return body	
}
func GetUser(userID int) (User) {
	auth := getAuth()
	addr, err := url.Parse(auth.Server)
	if err != nil { panic (err) }
	addr.Path = path.Join(addr.Path, "/admin/users/" + fmt.Sprint(userID))
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
	var body User
	if err := json.Unmarshal(resBody, &body); err != nil { panic (err) }
	return body
}
type createUserReq struct {
	Username string `json:"username"`
	Password string `json:"password"`
}
func CreateUser(username, password string) (int) {
	auth := getAuth()
	reqBody, _ := json.Marshal(&createUserReq{ Username: username, Password: password })
	addr, err := url.Parse(auth.Server)
	if err != nil { panic (err) }
	addr.Path = path.Join(addr.Path, "/admin/users")
	req, err := http.NewRequest(http.MethodPost, addr.String(), bytes.NewBuffer(reqBody))
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
	if res.StatusCode != 200 {
		var errBody APIError
		if err := json.Unmarshal(resBody, &errBody); err != nil { panic (err) }
		if errBody.Error != "" { handleAPIError(errBody) }
	}
	var body createRes
	if err := json.Unmarshal(resBody, &body); err != nil { panic (err) }
	return body.ID
}
func UpdateUser(userID int, info UserInfoWrite) {
	auth := getAuth()
	reqBody, _ := json.Marshal(info)
	addr, err := url.Parse(auth.Server)
	if err != nil { panic (err) }
	addr.Path = path.Join(addr.Path, "/admin/users/" + fmt.Sprint(userID))
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
type lockUserReq struct { Locked bool `json:"locked"` }
func LockUser(userID int, locked bool) {
	auth := getAuth()
	reqBody, _ := json.Marshal(&lockUserReq{ Locked: locked })
	addr, err := url.Parse(auth.Server)
	if err != nil { panic (err) }
	addr.Path = path.Join(addr.Path, "/admin/users/" + fmt.Sprint(userID) + "/lock")
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
func GrantUser(userID int, items []Grant) {
	auth := getAuth()
	reqBody, _ := json.Marshal(items)
	addr, err := url.Parse(auth.Server)
	if err != nil { panic (err) }
	addr.Path = path.Join(addr.Path, "/admin/users/" + fmt.Sprint(userID) + "/grant")
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
func DeleteUser(userID int) {
	auth := getAuth()
	addr, err := url.Parse(auth.Server)
	if err != nil { panic (err) }
	addr.Path = path.Join(addr.Path, "/admin/users/" + fmt.Sprint(userID))
	req, err := http.NewRequest(http.MethodDelete, addr.String(), nil)
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
}
func RevokeSession(sessionID int) {
	auth := getAuth()
	addr, err := url.Parse(auth.Server)
	if err != nil { panic (err) }
	addr.Path = path.Join(addr.Path, "/admin/sessions/" + fmt.Sprint(sessionID))
	req, err := http.NewRequest(http.MethodDelete, addr.String(), nil)
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