# FolderHarbor Landing
An information-filled landing page to describe what FolderHarbor is, with download links and videos.
> NOTE: This isn't part of the standard FolderHarbor "stack"! You do not need to run this to run a FolderHarbor server.
## Deploying
### Docker Compose
Save the following compose file to your system, naming it `compose.yml`:
```yaml
services:
  folderharbor-web:
    image: ghcr.io/aelithron/folderharbor/landing:latest
    container_name: folderharbor-landing
    ports:
      - "3000:3000"
    environment:
      GITHUB_PAT: "(add your PAT here)"
    restart: unless-stopped

```
You are required to set a GitHub Personal Access Token (`GITHUB_PAT`) for rate limiting reasons, it doesn't need any scopes or private repo access. Once you have applied any customizations you want and saved the file, run `docker compose up -d` and wait for it to complete. Then, go to the port you have set in the file!
### Docker (non-Compose)
Customize this command as you want to, then run it! I'd suggest changing the port (change the front number, leave the second as `3000`). You are required to set a GitHub Personal Access Token (`GITHUB_PAT`) for rate limiting reasons, it doesn't need any scopes or private repo access.
```sh
docker run -d \
  --name folderharbor-landing \
  -p 3000:3000 \
  -e GITHUB_PAT="(add your PAT here)" \
  --restart unless-stopped \
  ghcr.io/aelithron/folderharbor/landing:latest
```
Once you've done this and the container is running, go to the port you have set in the command.