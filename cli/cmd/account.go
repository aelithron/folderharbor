package cmd

import (
	"fmt"
	"folderharbor-cli/routes"
	"time"

	"github.com/spf13/cobra"
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
	},
}
func init() {
	rootCMD.AddCommand(accountCMD)
	accountCMD.AddCommand(ownInfoCMD)
}