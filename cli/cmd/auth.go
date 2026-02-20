package cmd

import (
	"FolderHarbor-CLI/routes"
	"bufio"
	"fmt"
	"os"
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
		password, _ := reader.ReadString('\n')
		fmt.Print(routes.Login(username, password))
	},
}
func init() {
	rootCMD.AddCommand(authCMD)
	authCMD.AddCommand(loginCMD)
}
