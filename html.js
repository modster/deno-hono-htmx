export const html = `<!DOCTYPE html>
   <html>
     <head>
       <meta charset="utf-8">
       <meta name="viewport" content="width=device-width">
       <title>HTMX</title>
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
   </html>`;
