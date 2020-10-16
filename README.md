# DBirb - SQLite API
This is database API written in Deno + Typescript for SQLite. Name is simply combination of acronym DB and my love of birbs. Goal of this is to be modular API that can be set up and modified via command line or config file and updated dynamically during runtime. Also bundled in Docker image.

If you want to use this localy, just run `deno run -A main.ts`

If you want to use it in docker you can build your own image with `docker build -t api-name .` command.

Modifications to it should be fairly simple and all of those follow Deno SQLite library documentation.
