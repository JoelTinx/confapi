import Koa from "koa";
import cors from "@koa/cors";
import Router from "@koa/router";
import debug from "debug";
import Knex from "knex";

const { DB_HOST, DB_PORT, DB_USER, DB_PWD, DB_NAME } = process.env;

const log = debug("api");
const app = new Koa();
const router = new Router();
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

router.get("/artists", async (ctx) => {
  ctx.body = await db("Artist").select().limit(10);
});

router.get("/tracks", async (ctx) => {
  ctx.body = await db("Track").select().limit(10);
});

app.use(cors());
app.use(router.routes());

app.listen(3000, () => {
  log("ready");
});
