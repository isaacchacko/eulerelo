# goal

- [x] refocus prisma development database from prod to something spun up locally
- [x] make usernames have no spaces or special characters so its easy to have a profile/<name> url

# envisioned commits

- [x] make todo doc (this)
- [x] create `seed.ts` file so that other developers can also spin up a local server. change the `.env` file and send it over so that the database points locally
- [x] make better username checking, making sure that no spaces/special characters are allowed. (whatever restrictions we apply they have to be all focused on making the profile url work)

# notes

## how to spin up local db for local testing

the `docker-compose.yml` file is already provided in the `./prisma/` directory. this is the crux of the local database.

have docker installed and running. then, making sure that you're in the `./prisma/` directory and that the `docker-compose.yml` is in the same directory, run the following. you may need elevated perms if you aren't in the docker group already:

```
docker compose up -d
```

the command will take a long time if it's your first time firing it up and the required images aren't downloaded yet. subsequent runs (when locally testing) will be a lot faster. it doesn't have to be the same exact username/password/port (in the yml) but whatever you change make sure to change for the following

### side note: some useful commands

to check running docker containers:

```
docker ps
```

or to check all containers:

```
docker ps -a
```

now, make sure to update the db url in your `.env` file to:

```
DATABASE_URL="postgresql://postgres:examplepwd@localhost:5432/mydb"
```

then to make sure that your local database is ready for local use, run the following. make sure the database is spinning (with the `docker compose` command):

```
npx prisma migrate dev
npx prisma db seed
```

you only have to run the migrate and db commands once, and because of the `volumes` setting in the yml, the database records will persist, even if you remove the container with `docker rm`. if you get a `Invalid "prisma.user.findUnique()" invocation: The table "public.User" does not exist in the current database.` error while signing in, that means that the database hasn't been migrated or seeded.

although this change isn't something you have to do manually, it's good to know that it exists. now, with commit _1_, the 'npm run dev' commmand will spin up a third database, using the following command:

```
\"sudo docker compose -f ./prisma/docker-compose.yml up\"
```

its the same command you used to spin up the docker container originally, except that the yml file location is explictly stated. when the terminal is interrupted, `docker compose up` will automatically deactivate the container.

now, you should have the local db running! if you ever make accounts while testing the sign-up features, those accounts would stay. have fun!
