export const poweredBy = ()=>{
    return async (c, next)=>{
        await next();
        c.res.headers.set('X-Powered-By', 'Hono');
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My45LjAvbWlkZGxld2FyZS9wb3dlcmVkLWJ5L2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgTWlkZGxld2FyZUhhbmRsZXIgfSBmcm9tICcuLi8uLi90eXBlcy50cydcblxuZXhwb3J0IGNvbnN0IHBvd2VyZWRCeSA9ICgpOiBNaWRkbGV3YXJlSGFuZGxlciA9PiB7XG4gIHJldHVybiBhc3luYyAoYywgbmV4dCkgPT4ge1xuICAgIGF3YWl0IG5leHQoKVxuICAgIGMucmVzLmhlYWRlcnMuc2V0KCdYLVBvd2VyZWQtQnknLCAnSG9ubycpXG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLE1BQU0sWUFBWSxJQUF5QjtJQUNoRCxPQUFPLE9BQU8sR0FBRyxPQUFTO1FBQ3hCLE1BQU07UUFDTixFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQjtJQUNwQztBQUNGLEVBQUMifQ==