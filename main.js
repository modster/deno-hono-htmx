import { serve } from "https://deno.land/std@0.204.0/http/server.ts";
import { Hono } from "https://deno.land/x/hono@v3.4.1/mod.ts";
import { serveStatic } from "https://deno.land/x/hono@v3.4.1/middleware.ts";
import { html } from "./html.js";
// const title = "Hono HTMX Demo";

const app = new Hono();
app.all("/", serveStatic({ path: "./static/index.html" }));
app.all("/favicon.ico", serveStatic({ path: "./static/favicon.ico" }));
app.all("/style.css", serveStatic({ path: "./static/style.css" }));

app.use("/content", async (c, next) => {
  if (c.req.method === "POST") {
    return c.html(`
      <div id="response-div">
         <h1>Hono HTMX Demo</h1>
         <button hx-post="/" hx-target="#response-div" hx-swap="outerHTML">
         </button>
       </div>
       `);
  }
  await next();
});
app.get("/", (c) => {
  return c.html(html);
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

serve(app.fetch);
