package main

import (
	"errors"
	"fmt"
	"folderharbor-cli/cmd"
	"os"
	"path/filepath"

	"github.com/spf13/viper"
)

func main() {
	viper.SetConfigName("config")
	viper.SetConfigType("json")
	viper.AddConfigPath("$HOME/.folderharbor")
	var fileLookupErr viper.ConfigFileNotFoundError
	if err := viper.ReadInConfig(); err != nil {
		if errors.As(err, &fileLookupErr) {
			fmt.Println("Welcome to FolderHarbor CLI! Creating a config file...")
			homeDir, err := os.UserHomeDir()
			if err != nil { panic (err) }
			if err := os.Mkdir(filepath.Join(homeDir, ".folderharbor"), os.ModePerm); err != nil { panic (err) }
			if err := viper.SafeWriteConfig(); err != nil { panic (err) }
		} else { panic (err) }
	}
	cmd.Execute()
}