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
func Login(username, password string) (map[string]any) {
	reqBody, _ := json.Marshal(&login{ Username: username, Password: password })
	resp, err := http.Post("http://localhost:3000/auth", "application/json", bytes.NewBuffer(reqBody))
	if err != nil { panic (err) }
	defer resp.Body.Close()
	resBody, err := io.ReadAll(resp.Body)
	if err != nil { panic (err) }
	var body map[string]any
	if err := json.Unmarshal(resBody, &body); err != nil { panic (err) }
	return body
}