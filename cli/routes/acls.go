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

type ACLList struct { 
	ACLID int `json:"id"`
	Name string `json:"name"`
}
type ACL struct {
	Name string `json:"name"`
	Allow []string `json:"allow"`
	Deny []string `json:"deny"`
}

func ListACLs() ([]ACLList) {
	auth := getAuth()
	addr, err := url.Parse(auth.Server)
	if err != nil { panic (err) }
	addr.Path = path.Join(addr.Path, "/admin/acls")
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
	var body []ACLList
	if err := json.Unmarshal(resBody, &body); err != nil { panic (err) }
	return body	
}
type createACLReq struct { Name string `json:"string"` }
func CreateACL(name string) (int) {
	auth := getAuth()
	reqBody, _ := json.Marshal(&createACLReq{ Name: name })
	addr, err := url.Parse(auth.Server)
	if err != nil { panic (err) }
	addr.Path = path.Join(addr.Path, "/admin/acls")
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
func GetACL(aclID int) (ACL) {
	auth := getAuth()
	addr, err := url.Parse(auth.Server)
	if err != nil { panic (err) }
	addr.Path = path.Join(addr.Path, "/admin/acls/" + fmt.Sprint(aclID))
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
	var body ACL
	if err := json.Unmarshal(resBody, &body); err != nil { panic (err) }
	return body
}
type ACLInfoWrite struct { Name string `json:"name,omitempty"` }
func UpdateACL(aclID int, info ACLInfoWrite) {
	auth := getAuth()
	reqBody, _ := json.Marshal(info)
	addr, err := url.Parse(auth.Server)
	if err != nil { panic (err) }
	addr.Path = path.Join(addr.Path, "/admin/acls/" + fmt.Sprint(aclID))
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
func DeleteACL(aclID int) {
	auth := getAuth()
	addr, err := url.Parse(auth.Server)
	if err != nil { panic (err) }
	addr.Path = path.Join(addr.Path, "/admin/acls/" + fmt.Sprint(aclID))
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