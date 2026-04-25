# FolderHarbor CLI
A cross-platform administration CLI for FolderHarbor, written in Go! This requires an operational [FolderHarbor server](https://fh.novatea.dev/server) to use.

<img src="/landing/public/shots/cli.webp" height="250" />

### [Download](https://fh.novatea.dev/cli)
## Highlights
- Easy-to-use syntax with help menus
- Information-dense outputs
- Speed (the CLI is built to work fast!)
- Designed for the [FolderHarbor Server](https://fh.novatea.dev/server)
- Fully free and open source under the MIT license
## Installing
You have a few choices on how to install the CLI! Note that, if you are installing the server, you can select to install the CLI as well during the installation script!
### Debian-based or Fedora-based Linux
Download the `.deb` (for Debian/Ubuntu/Mint) or `.rpm` (for Fedora/RHEL/OpenSUSE) file for your CPU architecture from [fh.novatea.dev/cli](https://fh.novatea.dev/cli), and open it! Install it through the Software Center. Then, open a terminal and run `folderharbor --help`! If you see a help prompt, the installation was successful! Go on to running `folderharbor auth login` or `folderharbor auth register` :3
### Other Linux
Download the "Linux x86_64" or "Linux ARM64" file from [fh.novatea.dev/cli](https://fh.novatea.dev/cli). Open a terminal and run the following command, filling in the version and architecture placeholders first: `sudo mv ~/Downloads/folderharbor-cli-<version>-linux-<arch> /usr/bin/folderharbor && chmod +x /usr/bin/folderharbor`. Then, open a terminal and run `folderharbor --help`! If you see a help prompt, the installation was successful! Go on to running `folderharbor auth login` or `folderharbor auth register` :3
### macOS
Download the `Apple Silicon` or `Intel Macs` version (depending on which type of Mac you have) from [fh.novatea.dev/cli](https://fh.novatea.dev/cli)! Open a terminal and run the following command, filling in the version and architecture placeholders first: `sudo mv ~/Downloads/folderharbor-cli-<version>-macos-<arch> /usr/bin/folderharbor && chmod +x /usr/bin/folderharbor`. Then, open a terminal and run `folderharbor --help`! If you see a help prompt, the installation was successful! Go on to running `folderharbor auth login` or `folderharbor auth register` :3
### Windows
Download the `Windows` file from [fh.novatea.dev/cli](https://fh.novatea.dev/cli)! Open PowerShell and run the following command, filling in the blank for version: `Move-Item -Path "$env:USERPROFILE\Downloads\folderharbor-cli-<version>-windows-amd64.exe" -Destination "C:\Program Files\folderharbor.exe"`. Restart PowerShell, then run `folderharbor --help`! If you see a help prompt, the installation was successful! Go on to running `folderharbor auth login` or `folderharbor auth register` :3
## Commands
I might add more commands in the future, but here's a guide to some key commands:
- `folderharbor --help`: Get a list of commands! You can add `--help` to any command to see information about it.
- `folderharbor auth login`: Log in to a FolderHarbor server! You can use `https://demo.fh.novatea.dev` as your server URL to use my public demo, or [run your own server](https://fh.novatea.dev/server) to get full control.
- `folderharbor auth register`: Create an account on a FolderHarbor server, if it supports it! If you haven't already created an account on my demo server, you should use this one to register for one!
- `folderharbor account get`: See information about your own account.
- `folderharbor tools protocols`: See the WebDAV and FTP connection strings.
---
- `folderharbor users get <userID>`: See information about another user.
- `folderharbor users <grant|revoke> <userID> <role|acl|permission>`: Grant or revoke a role, Access Control List, or direct permission from a user.

<img src="/cli/commands.png" height="250" />