import fs from "fs";
import Router from "@koa/router";

const router = new Router();
const models = JSON.parse(fs.readFileSync("./models.json").toString());

const buildMethodMiddleware = {
  get: ({ db, endpointName, tableName, propertiesToFields, primaryKey }) => {
    router.get(`/${endpointName}`, async (ctx) => {
      ctx.body = await db(tableName).select(propertiesToFields.map(([property, field]) => db.ref(field).as(property))).limit(10);
    });
    router.get(`/${endpointName}/:id`, async (ctx) => {
      [ctx.body] = await db(tableName).select(propertiesToFields.map(([property, field]) => db.ref(field).as(property))).where({ [primaryKey]: ctx.params.id });
    });
  },
  post: (db, endpointName, tableName, propertiesToFields) => {

  },
  put: (db, endpointName, tableName, propertiesToFields) => {

  },
  delete: (db, endpointName, tableName, propertiesToFields) => {

  }
}

const endpoints = (db) => {
  Object.keys(models).forEach(model => {
    const endpointName = model;
    const endpointOptions = models[model];
    const { tableName, properties, primaryKey, methods = ["get"] } = endpointOptions;
    const propertiesToFields = Object.entries(properties);
    methods.forEach(method => buildMethodMiddleware[method]({ db, router, endpointName, tableName, propertiesToFields, primaryKey }));
  });
  return router.routes();
};

export { endpoints };
