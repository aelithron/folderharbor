# FolderHarbor Web
A powerful web client for FolderHarbor administration! This requires an operational [FolderHarbor server](https://fh.novatea.dev/server), and you must be able to edit the config on said server.

<img src="/landing/public/shots/web.webp" height="125" />

## Highlights
- Powerful and robust administration panels
- User self-service panels
- Support for multiple active sessions at once
- Designed for the [FolderHarbor Server](https://fh.novatea.dev/server)
- Fully free and open source under the MIT license
## Setup
I recommend running this in Docker! You can theoretically run it without Docker, but it isn't supported, and you will need to manually build from the source code to do so.
### Docker Compose
Save the following compose file to your system, naming it `compose.yml`:
```yaml
services:
  folderharbor-web:
    image: ghcr.io/aelithron/folderharbor/web:latest
    container_name: folderharbor-web
    ports:
      - "3000:3000"
    environment:
      #NEXT_PUBLIC_DEFAULT_URL: ""
    restart: unless-stopped

```
From there, customize it if you want to! I'd suggest changing the port (change the front number, leave the second as `3000`), as well as setting the `NEXT_PUBLIC_DEFAULT_URL` to your FolderHarbor server's URL. This is in the format of `http(s)://[domain]:[port]`.
Once you have applied any customizations you want and saved the file, run `docker compose up -d` and wait for it to complete. Then, go to the port you have set in the file, and you should see the "Welcome to FolderHarbor" page! \
Continue to [Post-Install](https://github.com/aelithron/folderharbor/blob/main/web/README.md#L34) below.
### Docker (non-Compose)
Customize this command as you want to, then run it! I'd suggest changing the port (change the front number, leave the second as `3000`), as well as setting the `NEXT_PUBLIC_DEFAULT_URL` to your FolderHarbor server's URL. This is in the format of `http(s)://[domain]:[port]`.
```sh
docker run -d \
  --name folderharbor-web \
  -p 3000:3000 \
  #-e NEXT_PUBLIC_DEFAULT_URL="" \
  --restart unless-stopped \
  ghcr.io/aelithron/folderharbor/web:latest
```
Once you've done this and the container is running, go to the port you have set in the command. You should see the "Welcome to FolderHarbor" page! \
Now, continue to [Post-Install](https://github.com/aelithron/folderharbor/blob/main/web/README.md#L34) below.
## Post-Install
Go to your FolderHarbor server's `config.json` file (likely located at `/etc/folderharbor/config.json` unless you have changed it) and add the public URL of your web panel instance to the `api.allowedOrigins` array, then restart the server! This is required for now because of CORS (though I may add a CORS proxy in the future). The web panel will tell you during sign-in if this isn't set correctly, as it can't sign you in if the CORS settings are not correct.