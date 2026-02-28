package cmd

import (
	"fmt"
	"folderharbor-cli/routes"
	"slices"
	"sort"
	"strconv"
	"time"

	"github.com/spf13/cobra"
)

var usersCMD = &cobra.Command{
	Use:   "users",
	Short: "(admin) manage users in folderharbor",
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
	Use: "get [id]",
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
	},
}
func init() {
	rootCMD.AddCommand(usersCMD)
	usersCMD.AddCommand(listUsersCMD)
	usersCMD.AddCommand(getUserCMD)
}