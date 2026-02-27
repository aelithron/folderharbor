package routes

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/url"
	"path"
)

type Session struct {
	ID int `json:"id"`
	CreatedAt string `json:"createdAt"`
	Expiry string `json:"expiry"`
}
type SelfInfo struct {
	ID int `json:"id"`
	Username string `json:"username"`
	Sessions []Session `json:"sessions"`
	ActiveSession int `json:"activeSession"`
	FailedLoginLockout bool `json:"failedLoginLockout"`
}
type SelfInfoWrite struct {
	Username string `json:"username,omitempty"`
	Password string `json:"password,omitempty"`
	ClearLoginAttempts bool `json:"clearLoginAttempts,omitempty"`
}

func GetOwnInfo() (SelfInfo) {
	auth := getAuth()
	addr, err := url.Parse(auth.Server)
	if err != nil { panic (err) }
	addr.Path = path.Join(addr.Path, "/me")
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
	var body SelfInfo
	if err := json.Unmarshal(resBody, &body); err != nil { panic (err) }
	return body
}
func UpdateOwnInfo(info SelfInfoWrite) {
	auth := getAuth()
	reqBody, _ := json.Marshal(info)
	addr, err := url.Parse(auth.Server)
	if err != nil { panic (err) }
	addr.Path = path.Join(addr.Path, "/me")
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
type ownSessionRevoke struct { SessionID int `json:"sessionID"` }
func RevokeOwnSession(sessionID int) {
	auth := getAuth()
	reqBody, _ := json.Marshal(&ownSessionRevoke{ SessionID: sessionID });
	addr, err := url.Parse(auth.Server)
	if err != nil { panic (err) }
	addr.Path = path.Join(addr.Path, "/me/session")
	req, err := http.NewRequest(http.MethodDelete, addr.String(), bytes.NewBuffer(reqBody))
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