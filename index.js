import Koa from "koa";
import cors from "@koa/cors";
import body from "koa-body";
import debug from "debug";
import Knex from "knex";

import { endpoints } from "./api.js";
import { discover } from "./discover.js";

const { DB_HOST, DB_PORT, DB_USER, DB_PWD, DB_NAME } = process.env;

const log = debug("api");
const app = new Koa();
const db = Knex({
  client: "mysql2",
  connection: {
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PWD,
    database: DB_NAME
  }
});

discover(db).then((models) => {
  app.use(cors());
  app.use(body({ json: true }));
  app.use(endpoints(db, models));
  app.listen(3000, () => {
    log("ready");
  });
});
