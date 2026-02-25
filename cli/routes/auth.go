package routes

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
)

type login struct {
	Username string `json:"username"`
	Password string `json:"password"` 
}
func Login(url, username, password string) (login) {
	reqBody, _ := json.Marshal(&login{ Username: username, Password: password })
	resp, err := http.Post(url, "application/json", bytes.NewBuffer(reqBody))
	if err != nil { panic (err) }
	defer resp.Body.Close()
	resBody, err := io.ReadAll(resp.Body)
	if err != nil { panic (err) }
	var errBody APIError
	if err := json.Unmarshal(resBody, &errBody); err != nil { panic (err) }
	if errBody.Error != "" { handleAPIError(errBody) }
	var body login
	if err := json.Unmarshal(resBody, &body); err != nil { panic (err) }
	return body
}
func Logout() (map[string]any) {
	req, err := http.NewRequest(http.MethodDelete, "http://localhost:3000/auth", nil)
	cookie := http.Cookie{ Name: "token", Value: "nBB3piJ0eqblaM5D96pXUe7xubhpoC7LzDpNa5ah2NM", Path: "/" }
	req.AddCookie(&cookie)
	if err != nil { panic (err) }
	client := &http.Client{}
	res, err := client.Do(req)
	if err != nil { panic (err) }
	defer res.Body.Close()
	resBody, err := io.ReadAll(res.Body)
	if err != nil { panic (err) }
	if len(resBody) == 0 { return map[string]any{ "success": "yes" } }
	var body map[string]any
	if err := json.Unmarshal(resBody, &body); err != nil { panic (err) }
	return body
}