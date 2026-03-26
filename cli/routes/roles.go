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

type RoleList struct { 
	RoleID int `json:"id"`
	Name string `json:"name"`
}
type Role struct {
	Name string `json:"name"`
	Permissions []string `json:"permissions"`
	ACLs []int `json:"acls"`
}

func ListRoles() ([]RoleList) {
	auth := getAuth()
	addr, err := url.Parse(auth.Server)
	if err != nil { panic (err) }
	addr.Path = path.Join(addr.Path, "/admin/roles")
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
	var body []RoleList
	if err := json.Unmarshal(resBody, &body); err != nil { panic (err) }
	return body	
}
type createRoleReq struct { Name string `json:"name"` }
func CreateRole(name string) (int) {
	auth := getAuth()
	reqBody, _ := json.Marshal(&createRoleReq{ Name: name })
	addr, err := url.Parse(auth.Server)
	if err != nil { panic (err) }
	addr.Path = path.Join(addr.Path, "/admin/roles")
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
func GetRole(roleID int) (Role) {
	auth := getAuth()
	addr, err := url.Parse(auth.Server)
	if err != nil { panic (err) }
	addr.Path = path.Join(addr.Path, "/admin/roles/" + fmt.Sprint(roleID))
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
	var body Role
	if err := json.Unmarshal(resBody, &body); err != nil { panic (err) }
	return body
}
type RoleInfoWrite struct { Name string `json:"name,omitempty"` }
func UpdateRole(roleID int, info RoleInfoWrite) {
	auth := getAuth()
	reqBody, _ := json.Marshal(info)
	addr, err := url.Parse(auth.Server)
	if err != nil { panic (err) }
	addr.Path = path.Join(addr.Path, "/admin/roles/" + fmt.Sprint(roleID))
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
func DeleteRole(roleID int) {
	auth := getAuth()
	addr, err := url.Parse(auth.Server)
	if err != nil { panic (err) }
	addr.Path = path.Join(addr.Path, "/admin/roles/" + fmt.Sprint(roleID))
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