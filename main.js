import { serve } from "https://deno.land/std@0.204.0/http/server.ts";
import { Hono } from "https://deno.land/x/hono@v3.9.0/mod.ts";
import {
  html,
  logger,
  poweredBy,
  serveStatic,
} from "https://deno.land/x/hono@v3.9.0/middleware.ts";

const app = new Hono();
app.use("*", logger(), poweredBy());
app.use("/public/*", serveStatic({ root: "./" }));
app.all("/favicon.ico", serveStatic({ path: "./favicon.ico" }));
app.all("/style.css", serveStatic({ path: "./style.css" }));

app.get("/", (c) => {
  return c.html(html`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HTMX + Hono</title>
           <script src="https://unpkg.com/htmx.org@1.9.6"
       integrity="sha384-FhXw7b6AlE/jyjlZH5iHa/tTe9EpJ1Y55RjcgPbjeWMskSxZt1v9qkxLJWNJaGni"
       crossorigin="anonymous"></script>
       <link href="style.css" rel="stylesheet" type="text/css" />
       </head>
     <body>
         
       <div style="text-align: center;">
           <div id="response-div">
             <h1>Hono HTMX Demo</h1>
               <button hx-post="/" hx-target="#response-div" hx-swap="outerHTML">
                    Click Me
                </button>
           </div>
       </div>

     </body>
   </html>
  `);
});

app.post("/", (c) => {
  return c.html(html`<div id="response-div">
        <h1>Blazingly Fast</h1>
      <button hx-post="/" hx-target="#response-div" hx-swap="outerHTML">
           Click Me
       </button>
           </div>
        </div>`);
});
app.notFound((c) => {
  return c.text("Custom 404 Message", 404);
});

serve(app.fetch);
