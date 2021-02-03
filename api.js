import fs from "fs";
import Router from "@koa/router";
import debug from "debug";

const log = debug("api:endpoints");
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
  post: ({ db, endpointName, tableName, propertiesToFields }) => {
    router.post(`/${endpointName}`, async (ctx) => {
      const record = propertiesToFields.map(
        ([property, field]) => ({ [field]: ctx.request.body[property] })
      ).reduce(
        (row, keyValue) => ({ ...row, ...keyValue })
      );

      await db(tableName).insert(record);

      ctx.status = 201;
    });
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
    methods.forEach(method => {
      log("building middleware for %s /%s", method.toUpperCase(), endpointName);
      buildMethodMiddleware[method]({ db, endpointName, tableName, propertiesToFields, primaryKey });
    });
  });
  return router.routes();
};

export { endpoints };
