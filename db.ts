import { createConnection } from "typeorm";

createConnection()
  .then()
  .catch((e) => console.log(e));
