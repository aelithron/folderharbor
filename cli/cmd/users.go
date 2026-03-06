package cmd

import (
	"bufio"
	"fmt"
	"folderharbor-cli/routes"
	"os"
	"slices"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/spf13/cobra"
	"golang.org/x/term"
)

var usersCMD = &cobra.Command{
	Use:   "users",
	Short: "(admin) manage users",
	Long:  "(admin) manage users and sessions on a folderharbor server",
}
var listUsersCMD = &cobra.Command{
	Use: "list",
	Short: "get a list of users",
	Long: "get a list of all users on the server",
	Run: func(cmd *cobra.Command, args []string) {
		users := routes.ListUsers()
		if len(users) == 0 { fmt.Println("No users found!") }
		sort.Slice(users, func(i, j int) bool { return users[i].UserID < users[j].UserID })
		for user := range users { fmt.Printf("• %s (ID %d)\n", users[user].Username, users[user].UserID) }
	},
}
var getUserCMD = &cobra.Command{
	Use: "get <id>",
	Short: "get info on a user",
	Long: "get information about a specific user",
	Args: cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		userID, err := strconv.Atoi(args[0])
		if err != nil { panic (err) }
		info := routes.GetUser(userID)
		fmt.Println("Information for " + info.Username + " (ID " + fmt.Sprint(userID) + ")")
		fmt.Println("----------------------------")
		if info.Locked == true {
			fmt.Println("Locked: Yes")
		} else {
			fmt.Println("Locked: No")
		}
		fmt.Println("Failed Logins: " + fmt.Sprint(info.FailedLogins))
		
		if info.AccessLevel == "full" {
			fmt.Println()
			fmt.Printf("Roles: ")
			if len(info.Roles) == 0 { 
				fmt.Println("None") 
			} else {
				fmt.Println()
				for role := range info.Roles { fmt.Println("• #" + fmt.Sprint(info.Roles[role])) }
			}
			fmt.Printf("ACLs: ")
			if len(info.ACLs) == 0 { 
				fmt.Println("None") 
			} else {
				fmt.Println()
				for acl := range info.ACLs { fmt.Println("• #" + fmt.Sprint(info.ACLs[acl])) }
			}
			fmt.Printf("Direct Permissions: ")
			if len(info.Permissions) == 0 { 
				fmt.Println("None") 
			} else {
				fmt.Println()
				slices.Sort(info.Permissions)
				for permission := range info.Permissions { fmt.Println("• " + info.Permissions[permission]) }
			}
			fmt.Printf("Active Sessions: ")
			if len(info.Sessions) == 0 { 
				fmt.Println("None") 
			} else {
				fmt.Println()
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
			}
		}
	},
}
var createUserCMD = &cobra.Command{
	Use:   "create",
	Short: "create a user",
	Long:  "create a new user",
	Run: func(cmd *cobra.Command, args []string) {
		reader := bufio.NewReader(os.Stdin)
		fmt.Print("Enter the new user's username: ")
		username, _ := reader.ReadString('\n')
		fmt.Print("Enter the new user's password: ")
		password, err := term.ReadPassword(int(os.Stdin.Fd()))
		if err != nil { panic (err) }
		fmt.Println()
		userID := routes.CreateUser(strings.TrimSpace(username), string(password))
		fmt.Println("New user created! (ID: #" + fmt.Sprint(userID) + ")")
	},
}
var deleteUserCMD = &cobra.Command{
	Use: "delete <id>",
	Short: "delete a user",
	Long: "permanently delete a specific user",
	Args: cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		userID, err := strconv.Atoi(args[0])
		if err != nil { panic (err) }
		routes.DeleteUser(userID)
		fmt.Println("Successfully deleted the user (ID: #" + fmt.Sprint(userID) + ").")
	},
}
var updateUserCMD = &cobra.Command{
	Use: "update",
	Short: "update a user's info/settings",
	Long: "update information and settings for a user",
}
var lockUserCMD = &cobra.Command{
	Use: "lock <id> [yes|no]",
	Short: "lock/unlock a user",
	Long: "lock or unlock a user",
	Args: cobra.RangeArgs(1, 2),
	Run: func(cmd *cobra.Command, args []string) {
		userID, err := strconv.Atoi(args[0])
		if err != nil { panic (err) }
		var locked = true;
		if len(args) == 2 {
			switch args[1] {
			case "no", "false":
				locked = false;
			case "yes", "true":
				break;
			default:
					fmt.Println(`Error: Action "` + args[1] + `" isn't "yes" or "no"!`);
					os.Exit(1)
			}
		}
		routes.LockUser(userID, locked)
		if !locked {
			fmt.Println("Successfully unlocked the user (ID: #" + fmt.Sprint(userID) + ").")
		} else {
			fmt.Println("Successfully locked the user (ID: #" + fmt.Sprint(userID) + ").")
		}
	},
}
var changeUsernameCMD = &cobra.Command{
	Use: "username <id>",
	Short: "change a user's username",
	Long: "change the username of a user",
  Run: func(cmd *cobra.Command, args []string) {
		userID, err := strconv.Atoi(args[0])
		if err != nil { panic (err) }
		reader := bufio.NewReader(os.Stdin)
		fmt.Print("Enter the user's new username: ")
		username, _ := reader.ReadString('\n')
		routes.UpdateUser(userID, routes.UserInfoWrite{ Username: strings.TrimSpace(username) })
		fmt.Println("Successfully changed user #" + fmt.Sprint(userID) + "'s username to " + strings.TrimSpace(username) + ".")
	},
}
var changePasswordCMD = &cobra.Command{
	Use: "password <id>",
	Short: "change a user's password",
	Long: "change the password for a user",
  Run: func(cmd *cobra.Command, args []string) {
		userID, err := strconv.Atoi(args[0])
		if err != nil { panic (err) }
		fmt.Print("Enter the user's new password: ")
		password, err := term.ReadPassword(int(os.Stdin.Fd()))
		routes.UpdateUser(userID, routes.UserInfoWrite{ Password: string(password) })
		fmt.Println("Successfully changed user #" + fmt.Sprint(userID) + "'s password.\nNote: they have been signed out on all devices.")
	},
}
var clearFailedLoginsCMD = &cobra.Command{
	Use: "failedlogins <id>",
	Short: "reset a user's failed login counter",
	Long: "reset the failed login counter for a user",
  Run: func(cmd *cobra.Command, args []string) {
		userID, err := strconv.Atoi(args[0])
		if err != nil { panic (err) }
		routes.UpdateUser(userID, routes.UserInfoWrite{ ClearLoginAttempts: true })
		fmt.Println("Successfully reset user #" + fmt.Sprint(userID) + "'s failed login attempts.")
	},
}
func init() {
	rootCMD.AddCommand(usersCMD)
	usersCMD.AddCommand(listUsersCMD)
	usersCMD.AddCommand(getUserCMD)
	usersCMD.AddCommand(createUserCMD)
	usersCMD.AddCommand(deleteUserCMD)
	usersCMD.AddCommand(updateUserCMD)
	updateUserCMD.AddCommand(lockUserCMD)
	updateUserCMD.AddCommand(changeUsernameCMD)
	updateUserCMD.AddCommand(changePasswordCMD)
	updateUserCMD.AddCommand(clearFailedLoginsCMD)
}