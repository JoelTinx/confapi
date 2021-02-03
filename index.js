import Koa from "koa";
import cors from "@koa/cors";
import Router from "@koa/router";
import debug from "debug";
import Knex from "knex";

const log = debug("api");
const app = new Koa();
const router = new Router();
const db = Knex({
  client: "mysql2",
  connection: {
    host: "confapi_db_server",
    port: 3306,
    user: "root",
    password: "",
    database: "chinook"
  }
});

router.get("/artists", async (ctx) => {
  ctx.body = await db("artists").select().limit(10);
});

app.use(cors());
app.use(router.routes());

app.listen(3000, () => {
  log("ready");
});
