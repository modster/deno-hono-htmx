import { serve } from "https://deno.land/std@0.204.0/http/server.ts";
import { Hono } from "https://deno.land/x/hono@v3.4.1/mod.ts";
import { logger, poweredBy, serveStatic } from 'https://deno.land/x/hono@v3.4.1/middleware.ts';
const app = new Hono();
app.use('*', logger(), poweredBy());
// app.use('/public/*', serveStatic({ root: './' }))
// app.use('/favicon.ico', serveStatic({ path: './public/favicon.ico' }))
// app.all('/favicon.ico', serveStatic({ path: './public/favicon.ico' }))
app.all('/favicon.ico', serveStatic({
    path: './favicon.ico'
}));
const title = 'temp title';
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
  </html>`;
app.get('/', (c)=>{
    return c.html(layout);
});
app.get('/test', (c)=>{
    return c.html('<h1>Hello! Hono!</h1>');
});
app.notFound((c)=>{
    return c.text('Custom 404 Message', 404);
});
app.onError((err, c)=>{
    console.error(`${err}`);
    return c.text('Error', 500);
});
serve(app.fetch) /*
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
*/ ;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vaG9tZS9ydW5uZXIvZGVuby1ob25vLWh0bXgvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgc2VydmUgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQDAuMjA0LjAvaHR0cC9zZXJ2ZXIudHNcIjtcbmltcG9ydCB7IEhvbm8gfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQveC9ob25vQHYzLjQuMS9tb2QudHNcIjtcbmltcG9ydCB7XG4gIGxvZ2dlcixcbiAgcG93ZXJlZEJ5LFxuICBzZXJ2ZVN0YXRpYyxcbiAgLy8gaHRtbCxcbn0gZnJvbSAnaHR0cHM6Ly9kZW5vLmxhbmQveC9ob25vQHYzLjQuMS9taWRkbGV3YXJlLnRzJ1xuY29uc3QgYXBwID0gbmV3IEhvbm8oKVxuYXBwLnVzZSgnKicsIGxvZ2dlcigpLCBwb3dlcmVkQnkoKSlcbi8vIGFwcC51c2UoJy9wdWJsaWMvKicsIHNlcnZlU3RhdGljKHsgcm9vdDogJy4vJyB9KSlcbi8vIGFwcC51c2UoJy9mYXZpY29uLmljbycsIHNlcnZlU3RhdGljKHsgcGF0aDogJy4vcHVibGljL2Zhdmljb24uaWNvJyB9KSlcblxuLy8gYXBwLmFsbCgnL2Zhdmljb24uaWNvJywgc2VydmVTdGF0aWMoeyBwYXRoOiAnLi9wdWJsaWMvZmF2aWNvbi5pY28nIH0pKVxuYXBwLmFsbCgnL2Zhdmljb24uaWNvJywgc2VydmVTdGF0aWMoeyBwYXRoOiAnLi9mYXZpY29uLmljbycgfSkpXG5cbmNvbnN0IHRpdGxlID0gJ3RlbXAgdGl0bGUnXG5cbmNvbnN0IGxheW91dCA9IGA8IURPQ1RZUEUgaHRtbD5cbiAgPGh0bWw+XG4gICAgPGhlYWQ+XG4gICAgICA8dGl0bGU+JHt0aXRsZX08L3RpdGxlPlxuICAgICAgICAgIDxzY3JpcHQgc3JjPVwiaHR0cHM6Ly91bnBrZy5jb20vaHRteC5vcmdAMS45LjZcIlxuICAgICAgaW50ZWdyaXR5PVwic2hhMzg0LUZoWHc3YjZBbEUvanlqbFpINWlIYS90VGU5RXBKMVk1NVJqY2dQYmplV01za1N4WnQxdjlxa3hMSldOSmFHbmlcIlxuICAgICAgY3Jvc3NvcmlnaW49XCJhbm9ueW1vdXNcIj48L3NjcmlwdD5cbiAgICA8L2hlYWQ+XG4gICAgPGJvZHk+XG4gICAgICA8aDE+JHt0aXRsZX08L2gxPlxuICAgICAgPGRpdj5cbiAgICAgICAgICA8ZGl2IGlkPVwicmVzcG9uc2UtZGl2XCI+XG4gICAgICAgICAgICA8YnV0dG9uIGh4LWdldD1cIi90ZXN0XCIgaHgtdGFyZ2V0PVwiI3Jlc3BvbnNlLWRpdlwiIGh4LXN3YXA9XCJvdXRlckhUTUxcIj5cbiAgICAgICAgICAgICAgICBSZWdpc3RlciFcbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG5cbiAgICA8L2JvZHk+XG4gIDwvaHRtbD5gXG5cbmFwcC5nZXQoJy8nLCBjID0+IHtcbiAgcmV0dXJuIGMuaHRtbChsYXlvdXQpXG59KVxuXG5hcHAuZ2V0KCcvdGVzdCcsIGMgPT4ge1xuICByZXR1cm4gYy5odG1sKCc8aDE+SGVsbG8hIEhvbm8hPC9oMT4nKVxufSlcbmFwcC5ub3RGb3VuZChjID0+IHtcbiAgcmV0dXJuIGMudGV4dCgnQ3VzdG9tIDQwNCBNZXNzYWdlJywgNDA0KVxufSlcbmFwcC5vbkVycm9yKChlcnIsIGMpID0+IHtcbiAgY29uc29sZS5lcnJvcihgJHtlcnJ9YClcbiAgcmV0dXJuIGMudGV4dCgnRXJyb3InLCA1MDApXG59KVxuXG5zZXJ2ZShhcHAuZmV0Y2gpXG5cbi8qXG5Gb3IgQ2xvdWRmbGFyZSBXb3JrZXJzLCB5b3UgY2FuIHVzZSB0aGUgZm9sbG93aW5nOlxuXG5leHBvcnQgZGVmYXVsdCB7XG4gIGZldGNoKHJlcXVlc3Q6IFJlcXVlc3QsIGVudjogRW52LCBjdHg6IEV4ZWN1dGlvbkNvbnRleHQpIHtcbiAgICByZXR1cm4gYXBwLmZldGNoKHJlcXVlc3QsIGVudiwgY3R4KVxuICB9LFxufVxub3IganVzdCBkbzpcblxudHNcbmV4cG9ydCBkZWZhdWx0IGFwcFxuQnVuOlxuXG50c1xuZXhwb3J0IGRlZmF1bHQge1xuICBwb3J0OiAzMDAwLFxuICBmZXRjaDogYXBwLmZldGNoLFxufVxuTGFnb246XG5cbnRzXG5leHBvcnQgY29uc3QgaGFuZGxlciA9IGFwcC5mZXRjaFxuKi9cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTLEtBQUssUUFBUSwrQ0FBK0M7QUFDckUsU0FBUyxJQUFJLFFBQVEseUNBQXlDO0FBQzlELFNBQ0UsTUFBTSxFQUNOLFNBQVMsRUFDVCxXQUFXLFFBRU4sZ0RBQStDO0FBQ3RELE1BQU0sTUFBTSxJQUFJO0FBQ2hCLElBQUksR0FBRyxDQUFDLEtBQUssVUFBVTtBQUN2QixvREFBb0Q7QUFDcEQseUVBQXlFO0FBRXpFLHlFQUF5RTtBQUN6RSxJQUFJLEdBQUcsQ0FBQyxnQkFBZ0IsWUFBWTtJQUFFLE1BQU07QUFBZ0I7QUFFNUQsTUFBTSxRQUFRO0FBRWQsTUFBTSxTQUFTLENBQUM7OzthQUdILEVBQUUsTUFBTTs7Ozs7O1VBTVgsRUFBRSxNQUFNOzs7Ozs7Ozs7O1NBVVQsQ0FBQztBQUVWLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQSxJQUFLO0lBQ2hCLE9BQU8sRUFBRSxJQUFJLENBQUM7QUFDaEI7QUFFQSxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUEsSUFBSztJQUNwQixPQUFPLEVBQUUsSUFBSSxDQUFDO0FBQ2hCO0FBQ0EsSUFBSSxRQUFRLENBQUMsQ0FBQSxJQUFLO0lBQ2hCLE9BQU8sRUFBRSxJQUFJLENBQUMsc0JBQXNCO0FBQ3RDO0FBQ0EsSUFBSSxPQUFPLENBQUMsQ0FBQyxLQUFLLElBQU07SUFDdEIsUUFBUSxLQUFLLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQztJQUN0QixPQUFPLEVBQUUsSUFBSSxDQUFDLFNBQVM7QUFDekI7QUFFQSxNQUFNLElBQUksS0FBSyxFQUVmOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXVCQSJ9