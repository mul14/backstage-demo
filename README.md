# [Backstage](https://backstage.io)

This is your newly scaffolded Backstage App, Good Luck!

To start the app, run:

```sh
yarn install
yarn start
```

## Building TechDocs

All documentation sources live under `catalogs/docs/<entity>`. To build every TechDocs site at once:

```sh
yarn docs:build
```

To build a single documentation set, pass the source directory to the underlying CLI. For example, to build only the admin service docs:

```sh
techdocs-cli generate --source-dir catalogs/docs/admin-service --output-dir site/admin-service --no-docker
```

Remove `--no-docker` if you have Docker running and prefer the default containerized build.
