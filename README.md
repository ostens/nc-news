# Northcoders News API

## Background

This repository mimics a real world backend service (such as reddit) which should provide this information to the front end architecture. It uses PSQL and interacts with it using [node-postgres](https://node-postgres.com/).

## Set up

To run this on your local machine you will need to set up `.env.test` and `.env.development` files to configure your postgres database for development and test to be `nc_news_test` and `nc_news` respectively. An example is provided in `.env-example`.
