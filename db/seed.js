const { client, getAllUsers, createUser } = require("./index");

async function createInitialUsers() {
  try {
    console.log("Starting to create users...");

    const albert = await createUser({
      username: "albert",
      password: "bertie99",
    });

    const sandra = await createUser({
      username: "sandra",
      password: "glamgal",
    });

    console.log(albert, sandra);

    console.log("Finished creating users!");
  } catch (error) {
    console.error("Error creating users!");
    throw error;
  }
}

async function testDB() {
  try {
    console.log("Starting to test database...");

    // client.connect();

    const users = await getAllUsers();

    console.log("getAllUsers", users);

    console.log("Finished database tests!");
  } catch (error) {
    console.error("Error testing databse!");

    console.error(error);
  }
}

testDB();

async function dropTables() {
  try {
    console.log("Starting to drop tables...");

    await client.query(`
        DROP TABLE IF EXISTS users;
        `);

    console.log("Finished dropping tables!");
  } catch (error) {
    console.error("Error dropping tables!");
    throw error;
  }
}

async function createTables() {
  try {
    console.log("Starting to drop tables...");

    await client.query(`
    CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username varchar(255) UNIQUE NOT NULL,
        password varchar(255) NOT NULL
      );
        `);

    console.log("Finished building tables!");
  } catch (error) {
    console.error("Error building tables!");

    throw error;
  }
}

async function rebuildDB() {
  try {
    client.connect();

    await dropTables();
    await createTables();
    await createInitialUsers();
  } catch (error) {
    console.error(error);
  } finally {
    client.end();
  }
}

rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end());
