FROM hayd/deno:1.0.0

EXPOSE 4321

WORKDIR /app

# Cache the dependencies as a layer (this is re-run only when deps.ts is modified).
# Ideally this will download and compile _all_ external files used in main.ts.
COPY deps.ts /app
RUN deno cache deps.ts

# These steps will be re-run upon each file change in your working directory:
ADD . /app
# Compile the main app so that it doesn't need to be compiled each startup/entry.
RUN deno cache main.ts

#prepare volume for db
RUN mkdir db
VOLUME /app/db


# These are passed as deno arguments when run with docker:
CMD ["run", "--allow-all", "main.ts"]
