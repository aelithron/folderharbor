package cmd

import "github.com/spf13/cobra"

var usersCMD = &cobra.Command{
	Use:   "users",
	Short: "(admin) manage users in folderharbor",
	Long:  "(admin) manage users and sessions on a folderharbor server",
}
var getUserCMD = &cobra.Command{
	Use: "list",
	Short: "get a list of users",
	Long: "get a list of all users on the server",
	Run: func(cmd *cobra.Command, args []string) {
		
	},
}
func init() {
	rootCMD.AddCommand(usersCMD)
	usersCMD.AddCommand(getUserCMD)
}