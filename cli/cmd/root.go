package cmd

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
	"golang.org/x/term"
)

var rootCMD = &cobra.Command{
	Use: "folderharbor",
	Short: "a cli for interacting with folderharbor servers",
	Long: "a powerful cli for file management and admin actions, used with folderharbor servers",
	Run: func(cmd *cobra.Command, args []string) {
		cmd.Help()
		if (term.IsTerminal(int(os.Stdin.Fd()))) {
			fmt.Println()
			fmt.Println("Press Enter to exit...")
			fmt.Scanln();
		}
	},
}
func Execute() {
	if err := rootCMD.Execute(); err != nil {
		fmt.Fprintf(os.Stderr, "An error occurred running FolderHarbor CLI - '%s'\n", err)
		os.Exit(1)
	}
}