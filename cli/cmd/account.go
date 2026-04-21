package cmd

import (
	"bufio"
	"cmp"
	"fmt"
	"folderharbor-cli/routes"
	"net/url"
	"os"
	"slices"
	"strconv"
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
		slices.SortFunc(info.Sessions, func(a, b routes.Session) int { return cmp.Compare(a.ID, b.ID) })
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
			fmt.Println("• Session " + fmt.Sprint(info.Sessions[session].ID) + " (Created at " + createdAt + " • Expires at " + expiry + ")")
		}
		fmt.Println()
		fmt.Println("Current Session: " + fmt.Sprint(info.ActiveSession))
		if info.FailedLoginLockout == true {
			fmt.Println("Failed Login Lockout: Yes")
		} else {
			fmt.Println("Failed Login Lockout: No")
		}
		fmt.Printf("Permissions (Effective): ")
		if len(info.Permissions) == 0 { 
			fmt.Println("None") 
		} else {
			fmt.Println()
			slices.Sort(info.Permissions)
			for permission := range info.Permissions { fmt.Println("• " + info.Permissions[permission]) }
		}
	},
}
var changeOwnUsernameCMD = &cobra.Command{
	Use:   "username",
	Short: "change your username",
	Long:  "update your username on folderharbor",
  Run: func(cmd *cobra.Command, args []string) {
		server := routes.GetServerAddress()
		clientConfig := routes.GetClientConfig(server)
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
var revokeOwnSessionCMD = &cobra.Command{
	Use: "revoke-session <id>",
	Short: "revoke another session by its ID",
	Long: "revoke (sign out of) a session on another device by providing its ID",
	Args: cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		sessionID, err := strconv.Atoi(args[0])
		if err != nil {
			fmt.Println("Error: This session ID (" + args[0] + ") is not a number!")
			os.Exit(1)
		}
		routes.RevokeOwnSession(sessionID)
    fmt.Printf("Successfully revoked session %s.\n", fmt.Sprint(sessionID))
	},
}
func init() {
	rootCMD.AddCommand(accountCMD)
	accountCMD.AddCommand(ownInfoCMD)
	accountCMD.AddCommand(changeOwnUsernameCMD)
	accountCMD.AddCommand(changeOwnPasswordCMD)
	accountCMD.AddCommand(clearOwnFailedLoginsCMD)
	accountCMD.AddCommand(revokeOwnSessionCMD)
}