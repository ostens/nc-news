# Northcoders News API

## About

Welcome to ncnews. This repository mimics a real world backend service (such as reddit) which should provide this information to the front end architecture. It uses PSQL and interacts with it using [node-postgres](https://node-postgres.com/).

Data is posted in `articles` which have `votes` and can have related `comments`. Articles can also be categorised by `topics`. Both comments and articles are linked to `users`.

Visit ncnews at [https://frantic-erin-ant.cyclic.app/](https://frantic-erin-ant.cyclic.app/) and access a comprehensive list of endpoints with descriptions at [https://frantic-erin-ant.cyclic.app/api](https://frantic-erin-ant.cyclic.app/api).

## Set up

To set up locally, you will need to:

- Clone the repository
- Install dependencies using `npm i`
- Configure `.env` files for development and test (see below for more detail)
- Setup your local databases using `npm run setup-dbs`
- Seed your local databases using `npm run seed`
- Run tests using `npm t`
- Finally, you can run the app using `npm start`

**_To run this on your local machine you will need to set up `.env.test` and `.env.development` files to configure your postgres database for development and test to be `nc_news_test` and `nc_news` respectively. An example is provided in `.env-example`._**

You can now access the app in your local environment by sending requests to `localhost:9090/api/*`. A good place to start is `localhost:9090/api` which returns a json list of available endpoints.

> **Minimum versions**: Please use `Node.js` version 18 or above and `Postgres` version 14 or above.
