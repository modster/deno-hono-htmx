import { parse, parseSigned, serialize, serializeSigned } from '../../utils/cookie.ts';
export const getCookie = (c, key)=>{
    const cookie = c.req.raw.headers.get('Cookie');
    if (typeof key === 'string') {
        if (!cookie) return undefined;
        const obj = parse(cookie);
        return obj[key];
    }
    if (!cookie) return {};
    const obj = parse(cookie);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return obj;
};
export const getSignedCookie = async (c, secret, key)=>{
    const cookie = c.req.raw.headers.get('Cookie');
    if (typeof key === 'string') {
        if (!cookie) return undefined;
        const obj = await parseSigned(cookie, secret, key);
        return obj[key];
    }
    if (!cookie) return {};
    const obj = await parseSigned(cookie, secret);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return obj;
};
export const setCookie = (c, name, value, opt)=>{
    const cookie = serialize(name, value, opt);
    c.header('set-cookie', cookie, {
        append: true
    });
};
export const setSignedCookie = async (c, name, value, secret, opt)=>{
    const cookie = await serializeSigned(name, value, secret, opt);
    c.header('set-cookie', cookie, {
        append: true
    });
};
export const deleteCookie = (c, name, opt)=>{
    setCookie(c, name, '', {
        ...opt,
        maxAge: 0
    });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My40LjEvbWlkZGxld2FyZS9jb29raWUvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBDb250ZXh0IH0gZnJvbSAnLi4vLi4vY29udGV4dC50cydcbmltcG9ydCB7IHBhcnNlLCBwYXJzZVNpZ25lZCwgc2VyaWFsaXplLCBzZXJpYWxpemVTaWduZWQgfSBmcm9tICcuLi8uLi91dGlscy9jb29raWUudHMnXG5pbXBvcnQgdHlwZSB7IENvb2tpZU9wdGlvbnMsIENvb2tpZSwgU2lnbmVkQ29va2llIH0gZnJvbSAnLi4vLi4vdXRpbHMvY29va2llLnRzJ1xuXG5pbnRlcmZhY2UgR2V0Q29va2llIHtcbiAgKGM6IENvbnRleHQsIGtleTogc3RyaW5nKTogc3RyaW5nIHwgdW5kZWZpbmVkXG4gIChjOiBDb250ZXh0KTogQ29va2llXG59XG5cbmludGVyZmFjZSBHZXRTaWduZWRDb29raWUge1xuICAoYzogQ29udGV4dCwgc2VyY2V0OiBzdHJpbmcsIGtleTogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmcgfCB1bmRlZmluZWQgfCBmYWxzZT5cbiAgKGM6IENvbnRleHQsIHNlY3JldDogc3RyaW5nKTogUHJvbWlzZTxTaWduZWRDb29raWU+XG59XG5cbmV4cG9ydCBjb25zdCBnZXRDb29raWU6IEdldENvb2tpZSA9IChjLCBrZXk/KSA9PiB7XG4gIGNvbnN0IGNvb2tpZSA9IGMucmVxLnJhdy5oZWFkZXJzLmdldCgnQ29va2llJylcbiAgaWYgKHR5cGVvZiBrZXkgPT09ICdzdHJpbmcnKSB7XG4gICAgaWYgKCFjb29raWUpIHJldHVybiB1bmRlZmluZWRcbiAgICBjb25zdCBvYmogPSBwYXJzZShjb29raWUpXG4gICAgcmV0dXJuIG9ialtrZXldXG4gIH1cbiAgaWYgKCFjb29raWUpIHJldHVybiB7fVxuICBjb25zdCBvYmogPSBwYXJzZShjb29raWUpXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gIHJldHVybiBvYmogYXMgYW55XG59XG5cbmV4cG9ydCBjb25zdCBnZXRTaWduZWRDb29raWU6IEdldFNpZ25lZENvb2tpZSA9IGFzeW5jIChjLCBzZWNyZXQsIGtleT8pID0+IHtcbiAgY29uc3QgY29va2llID0gYy5yZXEucmF3LmhlYWRlcnMuZ2V0KCdDb29raWUnKVxuICBpZiAodHlwZW9mIGtleSA9PT0gJ3N0cmluZycpIHtcbiAgICBpZiAoIWNvb2tpZSkgcmV0dXJuIHVuZGVmaW5lZFxuICAgIGNvbnN0IG9iaiA9IGF3YWl0IHBhcnNlU2lnbmVkKGNvb2tpZSwgc2VjcmV0LCBrZXkpXG4gICAgcmV0dXJuIG9ialtrZXldXG4gIH1cbiAgaWYgKCFjb29raWUpIHJldHVybiB7fVxuICBjb25zdCBvYmogPSBhd2FpdCBwYXJzZVNpZ25lZChjb29raWUsIHNlY3JldClcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgcmV0dXJuIG9iaiBhcyBhbnlcbn1cblxuZXhwb3J0IGNvbnN0IHNldENvb2tpZSA9IChjOiBDb250ZXh0LCBuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcsIG9wdD86IENvb2tpZU9wdGlvbnMpOiB2b2lkID0+IHtcbiAgY29uc3QgY29va2llID0gc2VyaWFsaXplKG5hbWUsIHZhbHVlLCBvcHQpXG4gIGMuaGVhZGVyKCdzZXQtY29va2llJywgY29va2llLCB7IGFwcGVuZDogdHJ1ZSB9KVxufVxuXG5leHBvcnQgY29uc3Qgc2V0U2lnbmVkQ29va2llID0gYXN5bmMgKFxuICBjOiBDb250ZXh0LFxuICBuYW1lOiBzdHJpbmcsXG4gIHZhbHVlOiBzdHJpbmcsXG4gIHNlY3JldDogc3RyaW5nLFxuICBvcHQ/OiBDb29raWVPcHRpb25zXG4pOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgY29uc3QgY29va2llID0gYXdhaXQgc2VyaWFsaXplU2lnbmVkKG5hbWUsIHZhbHVlLCBzZWNyZXQsIG9wdClcbiAgYy5oZWFkZXIoJ3NldC1jb29raWUnLCBjb29raWUsIHsgYXBwZW5kOiB0cnVlIH0pXG59XG5cbmV4cG9ydCBjb25zdCBkZWxldGVDb29raWUgPSAoYzogQ29udGV4dCwgbmFtZTogc3RyaW5nLCBvcHQ/OiBDb29raWVPcHRpb25zKTogdm9pZCA9PiB7XG4gIHNldENvb2tpZShjLCBuYW1lLCAnJywgeyAuLi5vcHQsIG1heEFnZTogMCB9KVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLFNBQVMsS0FBSyxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsZUFBZSxRQUFRLHdCQUF1QjtBQWF0RixPQUFPLE1BQU0sWUFBdUIsQ0FBQyxHQUFHLE1BQVM7SUFDL0MsTUFBTSxTQUFTLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDO0lBQ3JDLElBQUksT0FBTyxRQUFRLFVBQVU7UUFDM0IsSUFBSSxDQUFDLFFBQVEsT0FBTztRQUNwQixNQUFNLE1BQU0sTUFBTTtRQUNsQixPQUFPLEdBQUcsQ0FBQyxJQUFJO0lBQ2pCLENBQUM7SUFDRCxJQUFJLENBQUMsUUFBUSxPQUFPLENBQUM7SUFDckIsTUFBTSxNQUFNLE1BQU07SUFDbEIsOERBQThEO0lBQzlELE9BQU87QUFDVCxFQUFDO0FBRUQsT0FBTyxNQUFNLGtCQUFtQyxPQUFPLEdBQUcsUUFBUSxNQUFTO0lBQ3pFLE1BQU0sU0FBUyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQztJQUNyQyxJQUFJLE9BQU8sUUFBUSxVQUFVO1FBQzNCLElBQUksQ0FBQyxRQUFRLE9BQU87UUFDcEIsTUFBTSxNQUFNLE1BQU0sWUFBWSxRQUFRLFFBQVE7UUFDOUMsT0FBTyxHQUFHLENBQUMsSUFBSTtJQUNqQixDQUFDO0lBQ0QsSUFBSSxDQUFDLFFBQVEsT0FBTyxDQUFDO0lBQ3JCLE1BQU0sTUFBTSxNQUFNLFlBQVksUUFBUTtJQUN0Qyw4REFBOEQ7SUFDOUQsT0FBTztBQUNULEVBQUM7QUFFRCxPQUFPLE1BQU0sWUFBWSxDQUFDLEdBQVksTUFBYyxPQUFlLE1BQThCO0lBQy9GLE1BQU0sU0FBUyxVQUFVLE1BQU0sT0FBTztJQUN0QyxFQUFFLE1BQU0sQ0FBQyxjQUFjLFFBQVE7UUFBRSxRQUFRLElBQUk7SUFBQztBQUNoRCxFQUFDO0FBRUQsT0FBTyxNQUFNLGtCQUFrQixPQUM3QixHQUNBLE1BQ0EsT0FDQSxRQUNBLE1BQ2tCO0lBQ2xCLE1BQU0sU0FBUyxNQUFNLGdCQUFnQixNQUFNLE9BQU8sUUFBUTtJQUMxRCxFQUFFLE1BQU0sQ0FBQyxjQUFjLFFBQVE7UUFBRSxRQUFRLElBQUk7SUFBQztBQUNoRCxFQUFDO0FBRUQsT0FBTyxNQUFNLGVBQWUsQ0FBQyxHQUFZLE1BQWMsTUFBOEI7SUFDbkYsVUFBVSxHQUFHLE1BQU0sSUFBSTtRQUFFLEdBQUcsR0FBRztRQUFFLFFBQVE7SUFBRTtBQUM3QyxFQUFDIn0=