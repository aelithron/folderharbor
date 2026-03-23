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
var getRoleCMD = &cobra.Command{
	Use: "get <id>",
	Short: "get info on a role",
	Long: "get information about a specific role",
	Args: cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		roleID, err := strconv.Atoi(args[0])
		if err != nil { panic (err) }
		info := routes.GetRole(roleID)
		fmt.Println("Information for role " + info.Name + " (ID " + fmt.Sprint(roleID) + ")")
		fmt.Println("----------------------------")
		fmt.Printf("ACLs: ")
		if len(info.ACLs) == 0 { 
			fmt.Println("None") 
		} else {
			fmt.Println()
			for acl := range info.ACLs { fmt.Println("• #" + fmt.Sprint(info.ACLs[acl])) }
		}
		fmt.Printf("Permissions: ")
		if len(info.Permissions) == 0 { 
			fmt.Println("None") 
		} else {
			fmt.Println()
			slices.Sort(info.Permissions)
			for permission := range info.Permissions { fmt.Println("• " + info.Permissions[permission]) }
		}
	},
}
var createRoleCMD = &cobra.Command{
	Use:   "create",
	Short: "create a role",
	Long:  "create a new role",
	Run: func(cmd *cobra.Command, args []string) {
		reader := bufio.NewReader(os.Stdin)
		fmt.Print("Enter the new role's name: ")
		name, _ := reader.ReadString('\n')
		roleID := routes.CreateRole(strings.TrimSpace(name))
		fmt.Println("New role created! (ID: #" + fmt.Sprint(roleID) + ")")
	},
}
var deleteRoleCMD = &cobra.Command{
	Use: "delete <id>",
	Short: "delete a role",
	Long: "permanently delete a specific role",
	Args: cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		roleID, err := strconv.Atoi(args[0])
		if err != nil { panic (err) }
		routes.DeleteRole(roleID)
		fmt.Println("Successfully deleted the role (ID: #" + fmt.Sprint(roleID) + ").")
	},
}
var updateRoleCMD = &cobra.Command{
	Use: "update",
	Short: "update a role's info",
	Long: "update information for a role",
}
var changeRoleNameCMD = &cobra.Command{
	Use: "name <id>",
	Short: "change a role's name",
	Long: "change the name of a role",
	Args: cobra.ExactArgs(1),
  Run: func(cmd *cobra.Command, args []string) {
		roleID, err := strconv.Atoi(args[0])
		if err != nil { panic (err) }
		reader := bufio.NewReader(os.Stdin)
		fmt.Print("Enter the role's new name: ")
		name, _ := reader.ReadString('\n')
		routes.UpdateRole(roleID, routes.RoleInfoWrite{ Name: strings.TrimSpace(name) })
		fmt.Println("Successfully changed role #" + fmt.Sprint(roleID) + "'s name to " + strings.TrimSpace(name) + ".")
	},
}
func init() {
  rootCMD.AddCommand(rolesCMD)
	rolesCMD.AddCommand(listRolesCMD)
	rolesCMD.AddCommand(getRoleCMD)
	rolesCMD.AddCommand(createRoleCMD)
	rolesCMD.AddCommand(deleteRoleCMD)
	rolesCMD.AddCommand(updateRoleCMD)
	updateRoleCMD.AddCommand(changeRoleNameCMD)
}