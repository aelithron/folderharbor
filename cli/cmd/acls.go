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
		if err != nil {
			fmt.Println("Error: This ACL ID (" + args[0] + ") is not a number!")
			os.Exit(1)
		}
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
		if err != nil {
			fmt.Println("Error: This ACL ID (" + args[0] + ") is not a number!")
			os.Exit(1)
		}
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
		if err != nil {
			fmt.Println("Error: This ACL ID (" + args[0] + ") is not a number!")
			os.Exit(1)
		}
		reader := bufio.NewReader(os.Stdin)
		fmt.Print("Enter the ACL's new name: ")
		name, _ := reader.ReadString('\n')
		routes.UpdateACL(aclID, routes.ACLInfoWrite{ Name: strings.TrimSpace(name) })
		fmt.Println("Successfully changed ACL #" + fmt.Sprint(aclID) + "'s name to " + strings.TrimSpace(name) + ".")
	},
}
var addPathCMD = &cobra.Command{
	Use: "addpath <id> <type>",
	Short: "add a path to an ACL",
	Long: "add a glob pattern to an ACL",
	Args: cobra.ExactArgs(2),
	Run: func(cmd *cobra.Command, args []string) {
		aclID, err := strconv.Atoi(args[0])
		if err != nil {
			fmt.Println("Error: This ACL ID (" + args[0] + ") is not a number!")
			os.Exit(1)
		}
		var itemInfo string
		var body []routes.ACLPath
		reader := bufio.NewReader(os.Stdin)
		switch args[1] {
			case "allow": {
				fmt.Print("Enter the allowed Glob pattern to add: ")
				glob, _ := reader.ReadString('\n')
				body = append(body, routes.ACLPath{ Path: strings.TrimSpace(glob), Type: "allow", Delete: false })
				itemInfo = `allowed Glob pattern "` + strings.TrimSpace(glob) + `"`
				break
			}
			case "deny": {
				fmt.Print("Enter the denied Glob pattern to add: ")
				glob, _ := reader.ReadString('\n')
				body = append(body, routes.ACLPath{ Path: strings.TrimSpace(glob), Type: "deny", Delete: false })
				itemInfo = `denied Glob pattern "` + strings.TrimSpace(glob) + `"`
				break
			}
			default: {
				fmt.Println(`Error: Type "` + args[1] + `" isn't a valid item type! Try "allow" or "deny".`);
				os.Exit(1)
			}
		}
		routes.UpdateACLPath(aclID, body)
		fmt.Println("Successfully added the " + itemInfo + " to the ACL!")
	},
}
var removePathCMD = &cobra.Command{
	Use: "removepath <id> <type>",
	Short: "remove a path from an ACL",
	Long: "remove a glob pattern from an ACL",
	Args: cobra.ExactArgs(2),
	Run: func(cmd *cobra.Command, args []string) {
		aclID, err := strconv.Atoi(args[0])
		if err != nil {
			fmt.Println("Error: This ACL ID (" + args[0] + ") is not a number!")
			os.Exit(1)
		}
		var itemInfo string
		var body []routes.ACLPath
		reader := bufio.NewReader(os.Stdin)
		switch args[1] {
			case "allow": {
				fmt.Print("Enter the allowed Glob pattern to remove: ")
				glob, _ := reader.ReadString('\n')
				body = append(body, routes.ACLPath{ Path: strings.TrimSpace(glob), Type: "allow", Delete: true })
				itemInfo = `allowed Glob pattern "` + strings.TrimSpace(glob) + `"`
				break
			}
			case "deny": {
				fmt.Print("Enter the denied Glob pattern to remove: ")
				glob, _ := reader.ReadString('\n')
				body = append(body, routes.ACLPath{ Path: strings.TrimSpace(glob), Type: "deny", Delete: true })
				itemInfo = `denied Glob pattern "` + strings.TrimSpace(glob) + `"`
				break
			}
			default: {
				fmt.Println(`Error: Type "` + args[1] + `" isn't a valid item type! Try "allow" or "deny".`);
				os.Exit(1)
			}
		}
		routes.UpdateACLPath(aclID, body)
		fmt.Println("Successfully removed the " + itemInfo + " from the ACL!")
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
	updateACLCMD.AddCommand(addPathCMD)
	updateACLCMD.AddCommand(removePathCMD)
}