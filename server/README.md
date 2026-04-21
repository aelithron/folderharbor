# FolderHarbor Server
This is the server/core for FolderHarbor. It can run independently, and provides the protocols, file server, API, and much more.
## Setup
> Note: The FolderHarbor server is designed for Linux only! These instructions likely will not work on non-Linux platforms, or if your CPU architecture isn't x86_64 or AMD64.
### Automated
I'm working on an installation script, which will come later!
### Manual
1. Prepare a PostgreSQL database \
Set up a PostgreSQL database, then create a database under a name of your choice (I would suggest `folderharbor`).
2. Download the server \
Go to the [GitHub Releases]() tab and look for the latest server release. Download the bundle for your system architecture.
3. Install \
Create a folder at `/usr/lib/folderharbor`, then extract the bundle files there. Make sure they aren't in a sub-folder (the `/usr/lib/folderharbor` folder should directly have the `index.js` file, as well as the others). \
Then, move the file named `folderharbor-server` to `/usr/bin`.
4. Setup \
If you don't plan to run the server as root, create a user and group called `folderharbor`.
Then, move the `folderharbor.service` file to `/etc/systemd/system`. \
Next, create a folder at `/etc/folderharbor`, and copy the `example.config.json` file to `/etc/folderharbor/config.json`. Edit this to configure your server as needed. This includes adding the database connection string (formatted as `postgres://<user>:<password>@<host>:<port>/<database>`). \
Finally, run `sudo folderharbor-server --setup`. This will guide you through the last parts of setup :3
5. Start \
Run `sudo systemctl daemon-reload && sudo systemctl enable --now folderharbor.service`. This will start your server! \
From here, try accessing the server path through a web browser. If a welcome page appears, congrats! Your server is working.