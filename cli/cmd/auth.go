package cmd

import (
	"bufio"
	"fmt"
	"folderharbor-cli/routes"
	"os"
	"strings"

	"github.com/spf13/cobra"
	"golang.org/x/term"
)

var authCMD = &cobra.Command{
	Use:   "auth",
	Short: "authenticate with a folderharbor server",
	Long:  "manage authentication with a folderharbor server",
}

var tokenLogin bool
var loginCMD = &cobra.Command{
	Use:   "login",
	Short: "log into a folderharbor server",
	Long:  "log into a folderharbor server",
	Run: func(cmd *cobra.Command, args []string) {
		reader := bufio.NewReader(os.Stdin)
		fmt.Print("Enter your server's URL: ")
		url, _ := reader.ReadString('\n')
		if tokenLogin == true {
			fmt.Print("Enter your server token: ")
			token, err := term.ReadPassword(int(os.Stdin.Fd()))
			if err != nil { panic (err) }
			fmt.Println()
			result := routes.LoginToken(strings.TrimSpace(url), strings.Replace(string(token), "token_", "", 1))
			fmt.Printf("Successfully logged in as %s, using a token! (Session #%d)\n", result.Username, result.Session)
			return;
		}
		fmt.Print("Enter your username: ")
		username, _ := reader.ReadString('\n')
		fmt.Print("Enter your password: ")
		password, err := term.ReadPassword(int(os.Stdin.Fd()))
		if err != nil { panic (err) }
		fmt.Println()
		result := routes.Login(strings.TrimSpace(url), strings.TrimSpace(username), string(password))
		fmt.Printf("Successfully logged in as %s, using credentials! (Session #%d)\n", result.Username, result.Session)
	},
}
var logoutCMD = &cobra.Command{
	Use:   "logout",
	Short: "log out of a folderharbor server",
	Long:  "log out of a folderharbor server",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Print("Do you want to invalidate your token?\nDoing so will cause any FTP/WebDAV clients using it to lose authentication. (y/n) ")
		fd := os.Stdin.Fd()
		state, err := term.MakeRaw(int(fd))
		if err != nil { panic (err) }
		defer term.Restore(int(fd), state)
		reader := bufio.NewReader(os.Stdin)
		letter, _, err := reader.ReadRune()
		if err != nil { panic (err) }
		term.Restore(int(fd), state)
  	fmt.Println(string(letter))
		if strings.ToLower(string(letter)) == "y" {
			routes.Logout(true)
			fmt.Println("Logged out and invalidated token successfully.")
		} else {
			routes.Logout(false)
			fmt.Println("Logged out successfully.")
		}
	},
}
var registerCMD = &cobra.Command{
	Use:   "register",
	Short: "create an account on a folderharbor server",
	Long:  "register for a new account on a folderharbor server",
	Run: func(cmd *cobra.Command, args []string) {
		reader := bufio.NewReader(os.Stdin)
		fmt.Print("Enter your server's URL: ")
		url, _ := reader.ReadString('\n')
		clientConfig := routes.GetClientConfig(strings.TrimSpace(url))
		if clientConfig.Registration == false {
			fmt.Fprintln(os.Stderr, "This server doesn't allow you to register.\nPlease ask the server's administrator to create an account for you.")
			os.Exit(1)
		}
		fmt.Print("Enter your new username: ")
		username, _ := reader.ReadString('\n')
		fmt.Print("Enter your new password: ")
		password, err := term.ReadPassword(int(os.Stdin.Fd()))
		if err != nil { panic (err) }
		fmt.Println()
		routes.Register(strings.TrimSpace(url), strings.TrimSpace(username), string(password))
		fmt.Println("Successfully registered and logged in!")
	},
}
func init() {
	rootCMD.AddCommand(authCMD)
	authCMD.AddCommand(loginCMD)
	loginCMD.Flags().BoolVar(&tokenLogin, "token", false, "provide a folderharbor auth token instead of credentials")
	authCMD.AddCommand(logoutCMD)
	authCMD.AddCommand(registerCMD)
}
