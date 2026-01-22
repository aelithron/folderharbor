# FolderHarbor Server
This is the server/core for FolderHarbor.
## Usage
Usage/setup info coming soon :3
### Configuration File
The configuration stores most options for the server. \
It is automatically copied to `/etc/folderharbor/config.json`.
### Environment Variables
Environment variables are used for secrets! They are:
- `DATABASE_URL`: A PostgreSQL connection string, formatted as `postgres://<user>:<password>@<host>:<port>/<database>`.