package cmd

import (
	"folderharbor-cli/routes"
	"bufio"
	"fmt"
	"golang.org/x/term"
	"os"
	"strings"
	"github.com/spf13/cobra"
)

var authCMD = &cobra.Command{
	Use:   "auth",
	Short: "authenticate with a folderharbor server",
	Long:  "manage authentication with a folderharbor server",
}
var loginCMD = &cobra.Command{
	Use:   "login",
	Short: "log into a folderharbor server",
	Long:  "log into a folderharbor server",
	Run: func(cmd *cobra.Command, args []string) {
		reader := bufio.NewReader(os.Stdin)
		fmt.Print("Enter your username: ")
		username, _ := reader.ReadString('\n')
		fmt.Print("Enter your password: ")
		password, err := term.ReadPassword(int(os.Stdin.Fd()))
		if err != nil { panic (err) }
		fmt.Println()
		fmt.Print(routes.Login(strings.TrimSpace(username), string(password)))
	},
}
var logoutCMD = &cobra.Command{
	Use:   "logout",
	Short: "log out of a folderharbor server",
	Long:  "log out of a folderharbor server",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Print(routes.Logout())
	},
}
func init() {
	rootCMD.AddCommand(authCMD)
	authCMD.AddCommand(loginCMD)
	authCMD.AddCommand(logoutCMD)
}
