# Benchmark of JSON queries for PostgreSQL

```bash
$ docker run -d --name postgres -e POSTGRES_PASSWORD=pass -p 5432:5432 postgres:11.1
$ npm install
$ node populate.js
$ node benchmark.js
$ node benchmark.js native
```

## Results

Evaluated using node v11.6.0 on Linux and [PostgreSQL 11.1 Docker image](https://hub.docker.com/_/postgres/),
`postgres:11.1`, with default configuration.

See [`results-js.log`](./results-js.log) for JS driver and [`results-native.log`](./results-native.log) for native driver.
