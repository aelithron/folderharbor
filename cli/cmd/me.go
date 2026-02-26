package cmd

import (
	"fmt"
	"folderharbor-cli/routes"

	"github.com/spf13/cobra"
)
var meCMD = &cobra.Command{
	Use:   "me",
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
		fmt.Println("Sessions:")
		if len(info.Sessions) == 0 { fmt.Println("No sessions found!") }
		for session := range info.Sessions {
			fmt.Println("Session " + fmt.Sprint(info.Sessions[session].ID) + " (Created at " + info.Sessions[session].CreatedAt + " - Expires at " + info.Sessions[session].Expiry + ")")
		}
		fmt.Println("Active Session: " + fmt.Sprint(info.ActiveSession))
	},
}
func init() {
	rootCMD.AddCommand(meCMD)
	meCMD.AddCommand(ownInfoCMD)
}