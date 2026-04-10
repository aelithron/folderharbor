package cmd

import (
	"fmt"
	"folderharbor-cli/routes"

	"github.com/spf13/cobra"
)

var configCMD = &cobra.Command{
	Use:   "config",
	Short: "(admin) manage the config",
	Long:  "(admin) manage the configuration of a folderharbor server",
}
var readConfigCMD = &cobra.Command{
	Use:   "read",
	Short: "read the config",
	Long:  "read the server configuration",
	Aliases: []string{"get"},
	Run: func(cmd *cobra.Command, args []string) {
		config := routes.ReadConfig()
		fmt.Println("Server Config")
		fmt.Println("-------------")
		for setting, value := range config {
			fmt.Printf("• %s: %v\n", setting, value)
		}
	},
}
var editConfigCMD = &cobra.Command{
	Use:   "edit <setting> <value>",
	Short: "edit the config",
	Long:  "modify the server configuration",
	Args: cobra.ExactArgs(2),
	Run: func(cmd *cobra.Command, args []string) {
		routes.EditConfig(routes.ConfigEdit{ Setting: args[0], Value: args[1] })
		fmt.Println("Applied config changes successfully.")
	},
}

func init() {
	rootCMD.AddCommand(configCMD)
	configCMD.AddCommand(readConfigCMD)
	configCMD.AddCommand(editConfigCMD)
}