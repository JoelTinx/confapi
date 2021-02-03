import fs from "fs";
import Router from "@koa/router";

const endpoints = (db) => {
  const router = new Router();
  const models = JSON.parse(fs.readFileSync("./models.json").toString());
  Object.keys(models).forEach(model => {
    const endpointName = model;
    const endpointOptions = models[model];
    const { tableName, properties } = endpointOptions;
    const propertiesToFields = Object.entries(properties);
    router.get(`/${endpointName}`, async (ctx) => {
      ctx.body = await db(tableName).select(propertiesToFields.map(([property, field]) => db.ref(field).as(property))).limit(10);
    });
  });
  return router.routes();
};

export { endpoints };
