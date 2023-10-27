import { Hono } from "https://deno.land/x/hono@v3.4.1/mod.ts";
import {
  logger,
  poweredBy,
  serveStatic,
  // html,
} from 'https://deno.land/x/hono@v3.4.1/middleware.ts'
const app = new Hono()
app.use('*', logger(), poweredBy())
// app.use('/public/*', serveStatic({ root: './' }))
// app.use('/favicon.ico', serveStatic({ path: './public/favicon.ico' }))

// app.all('/favicon.ico', serveStatic({ path: './public/favicon.ico' }))
app.all('/favicon.ico', serveStatic({ path: './favicon.ico' }))

const title = 'temp title'

const layout = `<!DOCTYPE html>
  <html>
    <head>
      <title>${title}</title>
          <script src="https://unpkg.com/htmx.org@1.9.6"
      integrity="sha384-FhXw7b6AlE/jyjlZH5iHa/tTe9EpJ1Y55RjcgPbjeWMskSxZt1v9qkxLJWNJaGni"
      crossorigin="anonymous"></script>
    </head>
    <body>
      <h1>${title}</h1>
      <div>
          <div id="response-div">
            <button hx-get="/test" hx-target="#response-div" hx-swap="outerHTML">
                Register!
            </button>
          </div>
      </div>

    </body>
  </html>`

app.get('/', c => {
  return c.html(layout)
})

app.get('/test', c => {
  return c.html('<h1>Hello! Hono!</h1>')
})
app.notFound(c => {
  return c.text('Custom 404 Message', 404)
})
app.onError((err, c) => {
  console.error(`${err}`)
  return c.text('Error', 500)
})

Deno.serve(app.fetch)

/*
For Cloudflare Workers, you can use the following:

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return app.fetch(request, env, ctx)
  },
}
or just do:

ts
export default app
Bun:

ts
export default {
  port: 3000,
  fetch: app.fetch,
}
Lagon:

ts
export const handler = app.fetch
*/
