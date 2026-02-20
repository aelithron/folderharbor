package routes
import (
  "net/http"
)

func Login() {
	resp, err := http.Post("http://localhost:3000/auth")
	if err != nil { panic (err) }
	defer resp.Body.Close()
	
}