import { serve } from "https://deno.land/std@0.204.0/http/server.ts";
import { Hono } from "https://deno.land/x/hono@v3.8.2/mod.ts";
import {
  logger,
  poweredBy,
  serveStatic,
} from "https://deno.land/x/hono@v3.4.1/middleware.ts";

const app = new Hono();
app.use("*", logger(), poweredBy());

// app.all("/", serveStatic({ path: "./static/index.html" }));
app.all("/favicon.ico", serveStatic({ path: "./favicon.ico" }));
app.all("/style.css", serveStatic({ path: "./style.css" }));

app.get("/", (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HTMX + Hono</title>
</head>
<body>
    <div id="response-div">
       <h1>HTMX Hono Demo</h1>
            <button hx-post="/" hx-target="#response-div" hx-swap="outerHTML">
            </button>
          </div>
</body>
</html>
  `);
});

app.post("/", (c) => {
  return c.html(`<div id="response-div">
             <h1>HTMX Hono Demo</h1>
                  <button hx-post="/" hx-target="#response-div" hx-swap="outerHTML">
                  </button>
                </div>
                `);
});
app.notFound((c) => {
  return c.text("Custom 404 Message", 404);
});

app.onError((err, c) => {
  console.error(`${err}`);
  return c.text("Error", 500);
});

Hono.serve(app.fetch);
