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

var aclsCMD = &cobra.Command{
	Use:   "acls",
	Short: "(admin) manage ACLs",
	Long:  "(admin) manage ACLs on a folderharbor server",
}
var listACLsCMD = &cobra.Command{
	Use:   "list",
	Short: "get a list of ACLs",
	Long:  "get a list of the server's ACLs",
	Run: func(cmd *cobra.Command, args []string) {
		acls := routes.ListACLs()
		if len(acls) == 0 { fmt.Println("No ACLs found!") }
		sort.Slice(acls, func(i, j int) bool { return acls[i].ACLID < acls[j].ACLID })
		for acl := range acls { fmt.Printf("• %s (ID %d)\n", acls[acl].Name, acls[acl].ACLID) }
	},
}
var getACLCMD = &cobra.Command{
	Use: "get <id>",
	Short: "get info on an ACL",
	Long: "get information about a specific ACL",
	Args: cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		aclID, err := strconv.Atoi(args[0])
		if err != nil { panic (err) }
		info := routes.GetACL(aclID)
		fmt.Println("Information for ACL " + info.Name + " (ID " + fmt.Sprint(aclID) + ")")
		fmt.Println("----------------------------")
		fmt.Printf("Allowed Paths: ")
		if len(info.Allow) == 0 { 
			fmt.Println("None") 
		} else {
			fmt.Println()
			slices.Sort(info.Allow)
			for allowed := range info.Allow { fmt.Println("• " + info.Allow[allowed]) }
		}
		fmt.Printf("Denied Paths: ")
		if len(info.Deny) == 0 { 
			fmt.Println("None") 
		} else {
			fmt.Println()
			slices.Sort(info.Deny)
			for denied := range info.Deny { fmt.Println("• " + info.Deny[denied]) }
		}
	},
}
var createACLCMD = &cobra.Command{
	Use:   "create",
	Short: "create an ACL",
	Long:  "create a new ACL",
	Run: func(cmd *cobra.Command, args []string) {
		reader := bufio.NewReader(os.Stdin)
		fmt.Print("Enter the new ACL's name: ")
		name, _ := reader.ReadString('\n')
		aclID := routes.CreateACL(strings.TrimSpace(name))
		fmt.Println("New ACL created! (ID: #" + fmt.Sprint(aclID) + ")")
	},
}
var deleteACLCMD = &cobra.Command{
	Use: "delete <id>",
	Short: "delete an ACL",
	Long: "permanently delete a specific ACL",
	Args: cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		aclID, err := strconv.Atoi(args[0])
		if err != nil { panic (err) }
		routes.DeleteACL(aclID)
		fmt.Println("Successfully deleted the ACL (ID: #" + fmt.Sprint(aclID) + ").")
	},
}
var updateACLCMD = &cobra.Command{
	Use: "update",
	Short: "update an ACL's info",
	Long: "update information for an ACL",
}
var changeACLNameCMD = &cobra.Command{
	Use: "name <id>",
	Short: "change an ACL's name",
	Long: "change the name of an ACL",
	Args: cobra.ExactArgs(1),
  Run: func(cmd *cobra.Command, args []string) {
		aclID, err := strconv.Atoi(args[0])
		if err != nil { panic (err) }
		reader := bufio.NewReader(os.Stdin)
		fmt.Print("Enter the ACL's new name: ")
		name, _ := reader.ReadString('\n')
		routes.UpdateACL(aclID, routes.ACLInfoWrite{ Name: strings.TrimSpace(name) })
		fmt.Println("Successfully changed ACL #" + fmt.Sprint(aclID) + "'s name to " + strings.TrimSpace(name) + ".")
	},
}
func init() {
  rootCMD.AddCommand(aclsCMD)
	aclsCMD.AddCommand(listACLsCMD)
	aclsCMD.AddCommand(getACLCMD)
	aclsCMD.AddCommand(createACLCMD)
	aclsCMD.AddCommand(deleteACLCMD)
	aclsCMD.AddCommand(updateACLCMD)
	updateACLCMD.AddCommand(changeACLNameCMD)
}