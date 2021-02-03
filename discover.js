import debug from "debug";
import inflected from "inflected";

const log = debug("api:discover");

const discover = async (db) => {
  log("discover enabled");

  const tableNames = await db("information_schema.tables").select(
    db.ref("table_name").as("tableName")
  ).where({
    table_schema: process.env.DB_NAME
  });

  log("detected %i tables", tableNames.length);

  const configurations = await Promise.all(tableNames.map(async ({tableName}) => {
    const endpointName = inflected.dasherize(
      inflected.underscore(
        inflected.camelize(
          inflected.pluralize(tableName), false
        )
      )
    );

    const columns = await db(tableName).columnInfo();

    const [{primaryKey}] = await db("information_schema.key_column_usage").select(
      db.ref("column_name").as("primaryKey")
    ).where({
      table_schema: process.env.DB_NAME,
      table_name: tableName
    });

    const properties = Object.keys(columns).map(
      column => ({ [inflected.camelize(column, false)]: column })
    ).reduce(
      (columns, column) => ({...columns, ...column})
    );

    return {
      [endpointName]: {
        tableName,
        primaryKey,
        properties,
        methods: ["get", "post", "put", "delete"]
      }
    }
  }));

  const endpoints = configurations.reduce((tables, table) => ({ ...tables, ...table }));

  log("discovery completed");

  return endpoints;
};

export { discover };
