package cmd

import (
	"bufio"
	"fmt"
	"folderharbor-cli/routes"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"golang.org/x/term"
)
var accountCMD = &cobra.Command{
	Use:   "account",
	Aliases: []string{"me"},
	Short: "manage your account info",
	Long:  "manage your user account on a folderharbor server",
}
var ownInfoCMD = &cobra.Command{
	Use: "get",
	Short: "get own account info",
	Long: "get information about your account",
	Run: func(cmd *cobra.Command, args []string) {
		info := routes.GetOwnInfo()
		fmt.Println("Information for " + info.Username + " (ID " + fmt.Sprint(info.ID) + ")")
		fmt.Println("----------------------------")
		fmt.Println("Active Sessions:")
		if len(info.Sessions) == 0 { fmt.Println("No sessions found!") }
		for session := range info.Sessions {
			createdAtRaw, err := time.Parse(time.RFC3339, info.Sessions[session].CreatedAt)
			var createdAt string
			if err == nil {
			  createdAt = createdAtRaw.Format(time.RFC1123)
			} else {
				createdAt = info.Sessions[session].CreatedAt
			}
			expiryRaw, err := time.Parse(time.RFC3339, info.Sessions[session].Expiry)
			var expiry string
			if err == nil {
			  expiry = expiryRaw.Format(time.RFC1123)
			} else {
				expiry = info.Sessions[session].Expiry
			}
			fmt.Println("Session " + fmt.Sprint(info.Sessions[session].ID) + " (Created at " + createdAt + " • Expires at " + expiry + ")")
		}
		fmt.Println()
		fmt.Println("Current Session: " + fmt.Sprint(info.ActiveSession))
		if info.FailedLoginLockout == true {
			fmt.Println("Failed Login Lockout: Yes")
		} else {
			fmt.Println("Failed Login Lockout: No")
		}
	},
}
var changeOwnUsernameCMD = &cobra.Command{
	Use:   "username",
	Short: "change your username",
	Long:  "update your username on folderharbor",
  Run: func(cmd *cobra.Command, args []string) {
		clientConfig := routes.GetClientConfig()
		if clientConfig.SelfUsernameChanges == false {
			fmt.Fprintln(os.Stderr, "This server doesn't allow you to change your username.\nPlease contact your administrator and ask them to change it for you.")
			os.Exit(1)
		}
		info := routes.GetOwnInfo()
		fmt.Println("Your current username is " + info.Username + ".")
		reader := bufio.NewReader(os.Stdin)
		fmt.Print("Enter your new username: ")
		username, _ := reader.ReadString('\n')
		routes.UpdateOwnInfo(routes.SelfInfoWrite{ Username: strings.TrimSpace(username) })
		fmt.Println("Successfully updated your username!")
	},
}
var changeOwnPasswordCMD = &cobra.Command{
	Use:   "password",
	Short: "change your password",
	Long:  "update your password on folderharbor",
  Run: func(cmd *cobra.Command, args []string) {
		info := routes.GetOwnInfo()
		server, err := url.Parse(viper.GetString("server"))
		if err != nil { panic (err) }
		fmt.Print("Enter your new password: ")
		password, err := term.ReadPassword(int(os.Stdin.Fd()))
		if err != nil { panic (err) }
		fmt.Println()
		routes.UpdateOwnInfo(routes.SelfInfoWrite{ Password: string(password) })
		fmt.Println("Successfully updated your password!\nNote: You have been automatically logged out everywhere except here.")
		routes.Login(server.String(), info.Username, string(password))
	},
}
var clearOwnFailedLoginsCMD = &cobra.Command{
	Use:   "failedlogins",
	Short: "reset the failed login counter for your account",
	Long:  "reset your account's failed password attempts",
  Run: func(cmd *cobra.Command, args []string) {
		routes.UpdateOwnInfo(routes.SelfInfoWrite{ ClearLoginAttempts: true })
		fmt.Println("Successfully reset your failed login attempts!")
	},
}
func init() {
	rootCMD.AddCommand(accountCMD)
	accountCMD.AddCommand(ownInfoCMD)
	accountCMD.AddCommand(changeOwnUsernameCMD)
	accountCMD.AddCommand(changeOwnPasswordCMD)
	accountCMD.AddCommand(clearOwnFailedLoginsCMD)
}