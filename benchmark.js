let Client;
if (process.argv[1] === 'native') {
  console.log("Using native client.");
  Client = require('pg').native.Client;
}
else {
  console.log("Using JS client.");
  Client = require('pg').Client;
}

const stats = require('stats-lite');

const CONNECTION_CONFIG = {
  user: 'postgres',
  database: 'postgres',
  password: 'pass',
};

const client = new Client(CONNECTION_CONFIG);

(async () => {
  await client.connect();

  const queries = [
    `
      SELECT * FROM posts
    `,
    `
      SELECT to_json(posts) FROM posts
    `,
    `
      SELECT to_jsonb(posts) FROM posts
    `,
    `
      SELECT * FROM comments
    `,
    `
      SELECT to_json(comments) FROM comments
    `,
    `
      SELECT to_jsonb(comments) FROM comments
    `,
    `
      SELECT
        posts."_id" AS "postId",
        posts."createdAt" AS "postCreatedAt",
        posts."body" AS "postBody",
        comments."_id" AS "commentId",
        comments."createdAt" AS "commentCreatedAt",
        comments."body" AS "commentBody"
      FROM posts LEFT JOIN comments ON (posts."_id"=comments."postId")
    `,
    `
      SELECT to_json(t) FROM
      (
        SELECT
          posts."_id" AS "postId",
          posts."createdAt" AS "postCreatedAt",
          posts."body" AS "postBody",
          comments."_id" AS "commentId",
          comments."createdAt" AS "commentCreatedAt",
          comments."body" AS "commentBody"
        FROM posts LEFT JOIN comments ON (posts."_id"=comments."postId")
      ) AS t
    `,
    `
      SELECT to_jsonb(t) FROM
      (
        SELECT
          posts."_id" AS "postId",
          posts."createdAt" AS "postCreatedAt",
          posts."body" AS "postBody",
          comments."_id" AS "commentId",
          comments."createdAt" AS "commentCreatedAt",
          comments."body" AS "commentBody"
        FROM posts LEFT JOIN comments ON (posts."_id"=comments."postId")
      ) AS t
    `,
    `
      SELECT
        posts.*,
        array_agg(comments) AS "comments"
      FROM posts LEFT JOIN comments ON (posts."_id"=comments."postId")
      GROUP BY posts."_id"
    `,
    `
      SELECT to_json(t) FROM
      (
        SELECT
          posts.*,
          array_agg(comments) AS "comments"
        FROM posts LEFT JOIN comments ON (posts."_id"=comments."postId")
        GROUP BY posts."_id"
      ) AS t
    `,
    `
      SELECT to_jsonb(t) FROM
      (
        SELECT
          posts.*,
          array_agg(comments) AS "comments"
        FROM posts LEFT JOIN comments ON (posts."_id"=comments."postId")
        GROUP BY posts."_id"
      ) AS t
    `,
    `
      SELECT
        posts.*,
        to_json(array_agg(comments)) AS "comments"
      FROM posts LEFT JOIN comments ON (posts."_id"=comments."postId")
      GROUP BY posts."_id"
    `,
    `
      SELECT to_json(t) FROM
      (
        SELECT
          posts.*,
          to_json(array_agg(comments)) AS "comments"
        FROM posts LEFT JOIN comments ON (posts."_id"=comments."postId")
        GROUP BY posts."_id"
      ) AS t
    `,
    `
      SELECT
        posts.*,
        to_jsonb(array_agg(comments)) AS "comments"
      FROM posts LEFT JOIN comments ON (posts."_id"=comments."postId")
      GROUP BY posts."_id"
    `,
    `
      SELECT to_jsonb(t) FROM
      (
        SELECT
          posts.*,
          to_jsonb(array_agg(comments)) AS "comments"
        FROM posts LEFT JOIN comments ON (posts."_id"=comments."postId")
        GROUP BY posts."_id"
      ) AS t
    `,
    `
      SELECT
        posts.*,
        (
          SELECT
            array_agg(comments)
          FROM comments WHERE posts."_id"=comments."postId"
        ) AS "comments"
      FROM posts
    `,
    `
      SELECT to_json(t) FROM
      (
        SELECT
          posts.*,
          (
            SELECT
              array_agg(comments)
            FROM comments WHERE posts."_id"=comments."postId"
          ) AS "comments"
        FROM posts      
      ) AS t
    `,
    `
      SELECT to_jsonb(t) FROM
      (
        SELECT
          posts.*,
          (
            SELECT
              array_agg(comments)
            FROM comments WHERE posts."_id"=comments."postId"
          ) AS "comments"
        FROM posts      
      ) AS t
    `,
    `
      SELECT
        posts.*,
        (
          SELECT
            to_json(array_agg(comments))
          FROM comments WHERE posts."_id"=comments."postId"
        ) AS "comments"
      FROM posts
    `,
    `
      SELECT to_json(t) FROM
      (
        SELECT
          posts.*,
          (
            SELECT
              to_json(array_agg(comments))
            FROM comments WHERE posts."_id"=comments."postId"
          ) AS "comments"
        FROM posts      
      )
    `,
    `
      SELECT
        posts.*,
        (
          SELECT
            to_jsonb(array_agg(comments))
          FROM comments WHERE posts."_id"=comments."postId"
        ) AS "comments"
      FROM posts
    `,
    `
      SELECT to_jsonb(t) FROM
      (
        SELECT
          posts.*,
          (
            SELECT
              to_jsonb(array_agg(comments))
            FROM comments WHERE posts."_id"=comments."postId"
          ) AS "comments"
        FROM posts
      ) AS t
    `,
  ];

  for (const query of queries) {
    console.log(query);
    const measurements = [];
    for (let i = 0; i < 10; i++) {
      const start = Date.now();
      await client.query(query);
      const end = Date.now();
      measurements.push(end - start);
    }
    console.log("Mean: %s", stats.mean(measurements));
    console.log("Stddev: %s", stats.stdev(measurements));
    console.log("\n---");
  }

  await client.end();
})();
