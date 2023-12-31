export const cache = (options)=>{
    if (options.wait === undefined) {
        options.wait = false;
    }
    const addHeader = (response)=>{
        if (options.cacheControl) response.headers.set('Cache-Control', options.cacheControl);
    };
    return async (c, next)=>{
        const key = c.req.url;
        const cache = await caches.open(options.cacheName);
        const response = await cache.match(key);
        if (!response) {
            await next();
            if (!c.res.ok) {
                return;
            }
            addHeader(c.res);
            const response = c.res.clone();
            if (options.wait) {
                await cache.put(key, response);
            } else {
                c.executionCtx.waitUntil(cache.put(key, response));
            }
        } else {
            return new Response(response.body, response);
        }
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My40LjEvbWlkZGxld2FyZS9jYWNoZS9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IE1pZGRsZXdhcmVIYW5kbGVyIH0gZnJvbSAnLi4vLi4vdHlwZXMudHMnXG5cbmV4cG9ydCBjb25zdCBjYWNoZSA9IChvcHRpb25zOiB7XG4gIGNhY2hlTmFtZTogc3RyaW5nXG4gIHdhaXQ/OiBib29sZWFuXG4gIGNhY2hlQ29udHJvbD86IHN0cmluZ1xufSk6IE1pZGRsZXdhcmVIYW5kbGVyID0+IHtcbiAgaWYgKG9wdGlvbnMud2FpdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgb3B0aW9ucy53YWl0ID0gZmFsc2VcbiAgfVxuXG4gIGNvbnN0IGFkZEhlYWRlciA9IChyZXNwb25zZTogUmVzcG9uc2UpID0+IHtcbiAgICBpZiAob3B0aW9ucy5jYWNoZUNvbnRyb2wpIHJlc3BvbnNlLmhlYWRlcnMuc2V0KCdDYWNoZS1Db250cm9sJywgb3B0aW9ucy5jYWNoZUNvbnRyb2wpXG4gIH1cblxuICByZXR1cm4gYXN5bmMgKGMsIG5leHQpID0+IHtcbiAgICBjb25zdCBrZXkgPSBjLnJlcS51cmxcbiAgICBjb25zdCBjYWNoZSA9IGF3YWl0IGNhY2hlcy5vcGVuKG9wdGlvbnMuY2FjaGVOYW1lKVxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgY2FjaGUubWF0Y2goa2V5KVxuICAgIGlmICghcmVzcG9uc2UpIHtcbiAgICAgIGF3YWl0IG5leHQoKVxuICAgICAgaWYgKCFjLnJlcy5vaykge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGFkZEhlYWRlcihjLnJlcylcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYy5yZXMuY2xvbmUoKVxuICAgICAgaWYgKG9wdGlvbnMud2FpdCkge1xuICAgICAgICBhd2FpdCBjYWNoZS5wdXQoa2V5LCByZXNwb25zZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGMuZXhlY3V0aW9uQ3R4LndhaXRVbnRpbChjYWNoZS5wdXQoa2V5LCByZXNwb25zZSkpXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBuZXcgUmVzcG9uc2UocmVzcG9uc2UuYm9keSwgcmVzcG9uc2UpXG4gICAgfVxuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxNQUFNLFFBQVEsQ0FBQyxVQUlHO0lBQ3ZCLElBQUksUUFBUSxJQUFJLEtBQUssV0FBVztRQUM5QixRQUFRLElBQUksR0FBRyxLQUFLO0lBQ3RCLENBQUM7SUFFRCxNQUFNLFlBQVksQ0FBQyxXQUF1QjtRQUN4QyxJQUFJLFFBQVEsWUFBWSxFQUFFLFNBQVMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsUUFBUSxZQUFZO0lBQ3RGO0lBRUEsT0FBTyxPQUFPLEdBQUcsT0FBUztRQUN4QixNQUFNLE1BQU0sRUFBRSxHQUFHLENBQUMsR0FBRztRQUNyQixNQUFNLFFBQVEsTUFBTSxPQUFPLElBQUksQ0FBQyxRQUFRLFNBQVM7UUFDakQsTUFBTSxXQUFXLE1BQU0sTUFBTSxLQUFLLENBQUM7UUFDbkMsSUFBSSxDQUFDLFVBQVU7WUFDYixNQUFNO1lBQ04sSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRTtnQkFDYjtZQUNGLENBQUM7WUFDRCxVQUFVLEVBQUUsR0FBRztZQUNmLE1BQU0sV0FBVyxFQUFFLEdBQUcsQ0FBQyxLQUFLO1lBQzVCLElBQUksUUFBUSxJQUFJLEVBQUU7Z0JBQ2hCLE1BQU0sTUFBTSxHQUFHLENBQUMsS0FBSztZQUN2QixPQUFPO2dCQUNMLEVBQUUsWUFBWSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxLQUFLO1lBQzFDLENBQUM7UUFDSCxPQUFPO1lBQ0wsT0FBTyxJQUFJLFNBQVMsU0FBUyxJQUFJLEVBQUU7UUFDckMsQ0FBQztJQUNIO0FBQ0YsRUFBQyJ9