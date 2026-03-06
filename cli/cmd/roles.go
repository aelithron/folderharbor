package cmd

import (
	"fmt"
	"folderharbor-cli/routes"
	"sort"

	"github.com/spf13/cobra"
)

var rolesCMD = &cobra.Command{
	Use:   "roles",
	Short: "(admin) manage roles",
	Long:  "(admin) manage roles on a folderharbor server",
}
var listRolesCMD = &cobra.Command{
	Use:   "list",
	Short: "get a list of roles",
	Long:  "get a list of the server's roles",
	Run: func(cmd *cobra.Command, args []string) {
		roles := routes.ListRoles()
		if len(roles) == 0 { fmt.Println("No roles found!") }
		sort.Slice(roles, func(i, j int) bool { return roles[i].RoleID < roles[j].RoleID })
		for role := range roles { fmt.Printf("• %s (ID %d)\n", roles[role].Name, roles[role].RoleID) }
	},
}
func init() {
  rootCMD.AddCommand(rolesCMD)
	rolesCMD.AddCommand(listRolesCMD)
}