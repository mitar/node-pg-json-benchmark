// docker run -d --name postgres -e POSTGRES_PASSWORD=pass -p 5432:5432 postgres:11.1

const {Client} = require('pg');
const {UNMISTAKABLE_CHARS} = require('@tozd/random-id');

const CONNECTION_CONFIG = {
  user: 'postgres',
  database: 'postgres',
  password: 'pass',
};

const client = new Client(CONNECTION_CONFIG);

(async () => {
  await client.connect();

  await client.query(`
    CREATE OR REPLACE FUNCTION random_id() RETURNS TEXT LANGUAGE SQL AS $$
      SELECT array_to_string(
        array(
          SELECT SUBSTRING('${UNMISTAKABLE_CHARS}' FROM floor(random()*55)::int+1 FOR 1) FROM generate_series(1, 17)
        ),
        ''
      );
    $$;
    DROP TABLE IF EXISTS comments CASCADE;
    DROP TABLE IF EXISTS posts CASCADE;
    CREATE TABLE posts (
      "_id" CHAR(17) PRIMARY KEY DEFAULT random_id(),
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "body" JSONB NOT NULL DEFAULT '{}'::JSONB
    );
    CREATE TABLE comments (
      "_id" CHAR(17) PRIMARY KEY DEFAULT random_id(),
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "postId" CHAR(17) NOT NULL REFERENCES posts("_id"),
      "body" JSONB NOT NULL DEFAULT '{}'::JSONB
    );
    CREATE INDEX "postId_index" ON comments("postId");
  `);

  const start = Date.now();

  await client.query(`BEGIN TRANSACTION`);

  for (let i = 0; i < 10000; i++) {
    const result = await client.query({
      text: `
        INSERT INTO posts ("body") VALUES($1) RETURNING _id;
      `,
      values: [{'title': `Post title ${i}`}],
      name: 'insert-posts',
    });

    const postId = result.rows[0]._id;

    for (let j = 0; j < 100; j++) {
      await client.query({
        text: `
          INSERT INTO comments ("postId", "body") VALUES($1, $2);
        `,
        values: [postId, {'title': `Comment title ${j}`}],
        name: 'insert-comments',
      });
    }
  }

  await client.query(`COMMIT`);

  console.log(`Inserting took ${(Date.now() - start) / 1000} seconds.`);

  await client.end();
})();
