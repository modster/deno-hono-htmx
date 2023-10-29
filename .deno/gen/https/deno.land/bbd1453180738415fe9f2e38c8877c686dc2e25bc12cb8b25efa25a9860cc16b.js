import { serialize } from './utils/cookie.ts';
import { StreamingApi } from './utils/stream.ts';
const TEXT_PLAIN = 'text/plain; charset=UTF-8';
export class Context {
    req;
    env = {};
    _var = {};
    finalized = false;
    error = undefined;
    _status = 200;
    _exCtx;
    _h = undefined //  _headers
    ;
    _pH = undefined // _preparedHeaders
    ;
    _res;
    _init = true;
    _renderer = (content)=>this.html(content);
    notFoundHandler = ()=>new Response();
    constructor(req, options){
        this.req = req;
        if (options) {
            this._exCtx = options.executionCtx;
            this.env = options.env;
            if (options.notFoundHandler) {
                this.notFoundHandler = options.notFoundHandler;
            }
        }
    }
    get event() {
        if (this._exCtx && 'respondWith' in this._exCtx) {
            return this._exCtx;
        } else {
            throw Error('This context has no FetchEvent');
        }
    }
    get executionCtx() {
        if (this._exCtx) {
            return this._exCtx;
        } else {
            throw Error('This context has no ExecutionContext');
        }
    }
    get res() {
        this._init = false;
        return this._res ||= new Response('404 Not Found', {
            status: 404
        });
    }
    set res(_res) {
        this._init = false;
        if (this._res && _res) {
            this._res.headers.delete('content-type');
            this._res.headers.forEach((v, k)=>{
                _res.headers.set(k, v);
            });
        }
        this._res = _res;
        this.finalized = true;
    }
    /**
   * @experimental
   * `c.render()` is an experimental feature.
   * The API might be changed.
   */ // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render = (...args)=>this._renderer(...args);
    /**
   * @experimental
   * `c.setRenderer()` is an experimental feature.
   * The API might be changed.
   */ setRenderer = (renderer)=>{
        this._renderer = renderer;
    };
    header = (name, value, options)=>{
        // Clear the header
        if (value === undefined) {
            if (this._h) {
                this._h.delete(name);
            } else if (this._pH) {
                delete this._pH[name.toLocaleLowerCase()];
            }
            if (this.finalized) {
                this.res.headers.delete(name);
            }
            return;
        }
        if (options?.append) {
            if (!this._h) {
                this._init = false;
                this._h = new Headers(this._pH);
                this._pH = {};
            }
            this._h.append(name, value);
        } else {
            if (this._h) {
                this._h.set(name, value);
            } else {
                this._pH ??= {};
                this._pH[name.toLowerCase()] = value;
            }
        }
        if (this.finalized) {
            if (options?.append) {
                this.res.headers.append(name, value);
            } else {
                this.res.headers.set(name, value);
            }
        }
    };
    status = (status)=>{
        this._status = status;
    };
    set = (key, value)=>{
        this._var ??= {};
        this._var[key] = value;
    };
    get = (key)=>{
        return this._var ? this._var[key] : undefined;
    };
    // c.var.propName is a read-only
    get var() {
        return {
            ...this._var
        };
    }
    newResponse = (data, arg, headers)=>{
        // Optimized
        if (this._init && !headers && !arg && this._status === 200) {
            return new Response(data, {
                headers: this._pH
            });
        }
        // Return Response immediately if arg is ResponseInit.
        if (arg && typeof arg !== 'number') {
            const res = new Response(data, arg);
            const contentType = this._pH?.['content-type'];
            if (contentType) {
                res.headers.set('content-type', contentType);
            }
            return res;
        }
        const status = arg ?? this._status;
        this._pH ??= {};
        this._h ??= new Headers();
        for (const [k, v] of Object.entries(this._pH)){
            this._h.set(k, v);
        }
        if (this._res) {
            this._res.headers.forEach((v, k)=>{
                this._h?.set(k, v);
            });
            for (const [k, v] of Object.entries(this._pH)){
                this._h.set(k, v);
            }
        }
        headers ??= {};
        for (const [k, v] of Object.entries(headers)){
            if (typeof v === 'string') {
                this._h.set(k, v);
            } else {
                this._h.delete(k);
                for (const v2 of v){
                    this._h.append(k, v2);
                }
            }
        }
        return new Response(data, {
            status,
            headers: this._h
        });
    };
    body = (data, arg, headers)=>{
        return typeof arg === 'number' ? this.newResponse(data, arg, headers) : this.newResponse(data, arg);
    };
    text = (text, arg, headers)=>{
        // If the header is empty, return Response immediately.
        // Content-Type will be added automatically as `text/plain`.
        if (!this._pH) {
            if (this._init && !headers && !arg) {
                return new Response(text);
            }
            this._pH = {};
        }
        // If Content-Type is not set, we don't have to set `text/plain`.
        // Fewer the header values, it will be faster.
        if (this._pH['content-type']) {
            this._pH['content-type'] = TEXT_PLAIN;
        }
        return typeof arg === 'number' ? this.newResponse(text, arg, headers) : this.newResponse(text, arg);
    };
    json = (object, arg, headers)=>{
        const body = JSON.stringify(object);
        this._pH ??= {};
        this._pH['content-type'] = 'application/json; charset=UTF-8';
        return typeof arg === 'number' ? this.newResponse(body, arg, headers) : this.newResponse(body, arg);
    };
    jsonT = (object, arg, headers)=>{
        const response = typeof arg === 'number' ? this.json(object, arg, headers) : this.json(object, arg);
        return {
            response,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data: object,
            format: 'json',
            status: response.status
        };
    };
    html = (html, arg, headers)=>{
        this._pH ??= {};
        this._pH['content-type'] = 'text/html; charset=UTF-8';
        return typeof arg === 'number' ? this.newResponse(html, arg, headers) : this.newResponse(html, arg);
    };
    redirect = (location, status = 302)=>{
        this._h ??= new Headers();
        this._h.set('Location', location);
        return this.newResponse(null, status);
    };
    streamText = (cb, arg, headers)=>{
        headers ??= {};
        this.header('content-type', TEXT_PLAIN);
        this.header('x-content-type-options', 'nosniff');
        this.header('transfer-encoding', 'chunked');
        return this.stream(cb, arg, headers);
    };
    stream = (cb, arg, headers)=>{
        const { readable , writable  } = new TransformStream();
        const stream = new StreamingApi(writable);
        cb(stream).finally(()=>stream.close());
        return typeof arg === 'number' ? this.newResponse(readable, arg, headers) : this.newResponse(readable, arg);
    };
    /** @deprecated
   * Use Cookie Middleware instead of `c.cookie()`. The `c.cookie()` will be removed in v4.
   *
   * @example
   *
   * import { setCookie } from 'hono/cookie'
   * // ...
   * app.get('/', (c) => {
   *   setCookie(c, 'key', 'value')
   *   //...
   * })
   */ cookie = (name, value, opt)=>{
        const cookie = serialize(name, value, opt);
        this.header('set-cookie', cookie, {
            append: true
        });
    };
    notFound = ()=>{
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return this.notFoundHandler(this);
    };
    /** @deprecated
   * Use `getRuntimeKey()` exported from `hono/adapter` instead of `c.runtime()`. The `c.runtime()` will be removed in v4.
   *
   * @example
   *
   * import { getRuntimeKey } from 'hono/adapter'
   * // ...
   * app.get('/', (c) => {
   *   const key = getRuntimeKey()
   *   //...
   * })
   */ get runtime() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const global = globalThis;
        if (global?.Deno !== undefined) {
            return 'deno';
        }
        if (global?.Bun !== undefined) {
            return 'bun';
        }
        if (typeof global?.WebSocketPair === 'function') {
            return 'workerd';
        }
        if (typeof global?.EdgeRuntime === 'string') {
            return 'edge-light';
        }
        if (global?.fastly !== undefined) {
            return 'fastly';
        }
        if (global?.__lagon__ !== undefined) {
            return 'lagon';
        }
        if (global?.process?.release?.name === 'node') {
            return 'node';
        }
        return 'other';
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My44LjIvY29udGV4dC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IEhvbm9SZXF1ZXN0IH0gZnJvbSAnLi9yZXF1ZXN0LnRzJ1xuaW1wb3J0IHR5cGUgeyBFbnYsIEZldGNoRXZlbnRMaWtlLCBOb3RGb3VuZEhhbmRsZXIsIElucHV0LCBUeXBlZFJlc3BvbnNlIH0gZnJvbSAnLi90eXBlcy50cydcbmltcG9ydCB0eXBlIHsgQ29va2llT3B0aW9ucyB9IGZyb20gJy4vdXRpbHMvY29va2llLnRzJ1xuaW1wb3J0IHsgc2VyaWFsaXplIH0gZnJvbSAnLi91dGlscy9jb29raWUudHMnXG5pbXBvcnQgdHlwZSB7IFN0YXR1c0NvZGUgfSBmcm9tICcuL3V0aWxzL2h0dHAtc3RhdHVzLnRzJ1xuaW1wb3J0IHsgU3RyZWFtaW5nQXBpIH0gZnJvbSAnLi91dGlscy9zdHJlYW0udHMnXG5pbXBvcnQgdHlwZSB7IEpTT05WYWx1ZSwgSW50ZXJmYWNlVG9UeXBlIH0gZnJvbSAnLi91dGlscy90eXBlcy50cydcblxudHlwZSBSdW50aW1lID0gJ25vZGUnIHwgJ2Rlbm8nIHwgJ2J1bicgfCAnd29ya2VyZCcgfCAnZmFzdGx5JyB8ICdlZGdlLWxpZ2h0JyB8ICdsYWdvbicgfCAnb3RoZXInXG50eXBlIEhlYWRlclJlY29yZCA9IFJlY29yZDxzdHJpbmcsIHN0cmluZyB8IHN0cmluZ1tdPlxudHlwZSBEYXRhID0gc3RyaW5nIHwgQXJyYXlCdWZmZXIgfCBSZWFkYWJsZVN0cmVhbVxuXG5leHBvcnQgaW50ZXJmYWNlIEV4ZWN1dGlvbkNvbnRleHQge1xuICB3YWl0VW50aWwocHJvbWlzZTogUHJvbWlzZTx1bmtub3duPik6IHZvaWRcbiAgcGFzc1Rocm91Z2hPbkV4Y2VwdGlvbigpOiB2b2lkXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29udGV4dFZhcmlhYmxlTWFwIHt9XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29udGV4dFJlbmRlcmVyIHt9XG5pbnRlcmZhY2UgRGVmYXVsdFJlbmRlcmVyIHtcbiAgKGNvbnRlbnQ6IHN0cmluZyk6IFJlc3BvbnNlIHwgUHJvbWlzZTxSZXNwb25zZT5cbn1cbmV4cG9ydCB0eXBlIFJlbmRlcmVyID0gQ29udGV4dFJlbmRlcmVyIGV4dGVuZHMgRnVuY3Rpb24gPyBDb250ZXh0UmVuZGVyZXIgOiBEZWZhdWx0UmVuZGVyZXJcblxuaW50ZXJmYWNlIEdldDxFIGV4dGVuZHMgRW52PiB7XG4gIDxLZXkgZXh0ZW5kcyBrZXlvZiBDb250ZXh0VmFyaWFibGVNYXA+KGtleTogS2V5KTogQ29udGV4dFZhcmlhYmxlTWFwW0tleV1cbiAgPEtleSBleHRlbmRzIGtleW9mIEVbJ1ZhcmlhYmxlcyddPihrZXk6IEtleSk6IEVbJ1ZhcmlhYmxlcyddW0tleV1cbn1cblxuaW50ZXJmYWNlIFNldDxFIGV4dGVuZHMgRW52PiB7XG4gIDxLZXkgZXh0ZW5kcyBrZXlvZiBDb250ZXh0VmFyaWFibGVNYXA+KGtleTogS2V5LCB2YWx1ZTogQ29udGV4dFZhcmlhYmxlTWFwW0tleV0pOiB2b2lkXG4gIDxLZXkgZXh0ZW5kcyBrZXlvZiBFWydWYXJpYWJsZXMnXT4oa2V5OiBLZXksIHZhbHVlOiBFWydWYXJpYWJsZXMnXVtLZXldKTogdm9pZFxufVxuXG5pbnRlcmZhY2UgTmV3UmVzcG9uc2Uge1xuICAoZGF0YTogRGF0YSB8IG51bGwsIHN0YXR1cz86IFN0YXR1c0NvZGUsIGhlYWRlcnM/OiBIZWFkZXJSZWNvcmQpOiBSZXNwb25zZVxuICAoZGF0YTogRGF0YSB8IG51bGwsIGluaXQ/OiBSZXNwb25zZUluaXQpOiBSZXNwb25zZVxufVxuXG5pbnRlcmZhY2UgQm9keVJlc3BvbmQgZXh0ZW5kcyBOZXdSZXNwb25zZSB7fVxuXG5pbnRlcmZhY2UgVGV4dFJlc3BvbmQge1xuICAodGV4dDogc3RyaW5nLCBzdGF0dXM/OiBTdGF0dXNDb2RlLCBoZWFkZXJzPzogSGVhZGVyUmVjb3JkKTogUmVzcG9uc2VcbiAgKHRleHQ6IHN0cmluZywgaW5pdD86IFJlc3BvbnNlSW5pdCk6IFJlc3BvbnNlXG59XG5cbmludGVyZmFjZSBKU09OUmVzcG9uZCB7XG4gIDxUID0gSlNPTlZhbHVlPihvYmplY3Q6IFQsIHN0YXR1cz86IFN0YXR1c0NvZGUsIGhlYWRlcnM/OiBIZWFkZXJSZWNvcmQpOiBSZXNwb25zZVxuICA8VCA9IEpTT05WYWx1ZT4ob2JqZWN0OiBULCBpbml0PzogUmVzcG9uc2VJbml0KTogUmVzcG9uc2Vcbn1cblxuaW50ZXJmYWNlIEpTT05UUmVzcG9uZCB7XG4gIDxUPihcbiAgICBvYmplY3Q6IEludGVyZmFjZVRvVHlwZTxUPiBleHRlbmRzIEpTT05WYWx1ZSA/IFQgOiBKU09OVmFsdWUsXG4gICAgc3RhdHVzPzogU3RhdHVzQ29kZSxcbiAgICBoZWFkZXJzPzogSGVhZGVyUmVjb3JkXG4gICk6IFR5cGVkUmVzcG9uc2U8XG4gICAgSW50ZXJmYWNlVG9UeXBlPFQ+IGV4dGVuZHMgSlNPTlZhbHVlXG4gICAgICA/IEpTT05WYWx1ZSBleHRlbmRzIEludGVyZmFjZVRvVHlwZTxUPlxuICAgICAgICA/IG5ldmVyXG4gICAgICAgIDogVFxuICAgICAgOiBuZXZlclxuICA+XG4gIDxUPihcbiAgICBvYmplY3Q6IEludGVyZmFjZVRvVHlwZTxUPiBleHRlbmRzIEpTT05WYWx1ZSA/IFQgOiBKU09OVmFsdWUsXG4gICAgaW5pdD86IFJlc3BvbnNlSW5pdFxuICApOiBUeXBlZFJlc3BvbnNlPFxuICAgIEludGVyZmFjZVRvVHlwZTxUPiBleHRlbmRzIEpTT05WYWx1ZVxuICAgICAgPyBKU09OVmFsdWUgZXh0ZW5kcyBJbnRlcmZhY2VUb1R5cGU8VD5cbiAgICAgICAgPyBuZXZlclxuICAgICAgICA6IFRcbiAgICAgIDogbmV2ZXJcbiAgPlxufVxuXG5pbnRlcmZhY2UgSFRNTFJlc3BvbmQge1xuICAoaHRtbDogc3RyaW5nLCBzdGF0dXM/OiBTdGF0dXNDb2RlLCBoZWFkZXJzPzogSGVhZGVyUmVjb3JkKTogUmVzcG9uc2VcbiAgKGh0bWw6IHN0cmluZywgaW5pdD86IFJlc3BvbnNlSW5pdCk6IFJlc3BvbnNlXG59XG5cbnR5cGUgQ29udGV4dE9wdGlvbnM8RSBleHRlbmRzIEVudj4gPSB7XG4gIGVudjogRVsnQmluZGluZ3MnXVxuICBleGVjdXRpb25DdHg/OiBGZXRjaEV2ZW50TGlrZSB8IEV4ZWN1dGlvbkNvbnRleHQgfCB1bmRlZmluZWRcbiAgbm90Rm91bmRIYW5kbGVyPzogTm90Rm91bmRIYW5kbGVyPEU+XG59XG5cbmNvbnN0IFRFWFRfUExBSU4gPSAndGV4dC9wbGFpbjsgY2hhcnNldD1VVEYtOCdcblxuZXhwb3J0IGNsYXNzIENvbnRleHQ8XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gIEUgZXh0ZW5kcyBFbnYgPSBhbnksXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gIFAgZXh0ZW5kcyBzdHJpbmcgPSBhbnksXG4gIEkgZXh0ZW5kcyBJbnB1dCA9IHt9XG4+IHtcbiAgcmVxOiBIb25vUmVxdWVzdDxQLCBJWydvdXQnXT5cbiAgZW52OiBFWydCaW5kaW5ncyddID0ge31cbiAgcHJpdmF0ZSBfdmFyOiBFWydWYXJpYWJsZXMnXSA9IHt9XG4gIGZpbmFsaXplZDogYm9vbGVhbiA9IGZhbHNlXG4gIGVycm9yOiBFcnJvciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZFxuXG4gIHByaXZhdGUgX3N0YXR1czogU3RhdHVzQ29kZSA9IDIwMFxuICBwcml2YXRlIF9leEN0eDogRmV0Y2hFdmVudExpa2UgfCBFeGVjdXRpb25Db250ZXh0IHwgdW5kZWZpbmVkIC8vIF9leGVjdXRpb25DdHhcbiAgcHJpdmF0ZSBfaDogSGVhZGVycyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZCAvLyAgX2hlYWRlcnNcbiAgcHJpdmF0ZSBfcEg6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQgLy8gX3ByZXBhcmVkSGVhZGVyc1xuICBwcml2YXRlIF9yZXM6IFJlc3BvbnNlIHwgdW5kZWZpbmVkXG4gIHByaXZhdGUgX2luaXQgPSB0cnVlXG4gIHByaXZhdGUgX3JlbmRlcmVyOiBSZW5kZXJlciA9IChjb250ZW50OiBzdHJpbmcpID0+IHRoaXMuaHRtbChjb250ZW50KVxuICBwcml2YXRlIG5vdEZvdW5kSGFuZGxlcjogTm90Rm91bmRIYW5kbGVyPEU+ID0gKCkgPT4gbmV3IFJlc3BvbnNlKClcblxuICBjb25zdHJ1Y3RvcihyZXE6IEhvbm9SZXF1ZXN0PFAsIElbJ291dCddPiwgb3B0aW9ucz86IENvbnRleHRPcHRpb25zPEU+KSB7XG4gICAgdGhpcy5yZXEgPSByZXFcbiAgICBpZiAob3B0aW9ucykge1xuICAgICAgdGhpcy5fZXhDdHggPSBvcHRpb25zLmV4ZWN1dGlvbkN0eFxuICAgICAgdGhpcy5lbnYgPSBvcHRpb25zLmVudlxuICAgICAgaWYgKG9wdGlvbnMubm90Rm91bmRIYW5kbGVyKSB7XG4gICAgICAgIHRoaXMubm90Rm91bmRIYW5kbGVyID0gb3B0aW9ucy5ub3RGb3VuZEhhbmRsZXJcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnZXQgZXZlbnQoKTogRmV0Y2hFdmVudExpa2Uge1xuICAgIGlmICh0aGlzLl9leEN0eCAmJiAncmVzcG9uZFdpdGgnIGluIHRoaXMuX2V4Q3R4KSB7XG4gICAgICByZXR1cm4gdGhpcy5fZXhDdHhcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgRXJyb3IoJ1RoaXMgY29udGV4dCBoYXMgbm8gRmV0Y2hFdmVudCcpXG4gICAgfVxuICB9XG5cbiAgZ2V0IGV4ZWN1dGlvbkN0eCgpOiBFeGVjdXRpb25Db250ZXh0IHtcbiAgICBpZiAodGhpcy5fZXhDdHgpIHtcbiAgICAgIHJldHVybiB0aGlzLl9leEN0eCBhcyBFeGVjdXRpb25Db250ZXh0XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IEVycm9yKCdUaGlzIGNvbnRleHQgaGFzIG5vIEV4ZWN1dGlvbkNvbnRleHQnKVxuICAgIH1cbiAgfVxuXG4gIGdldCByZXMoKTogUmVzcG9uc2Uge1xuICAgIHRoaXMuX2luaXQgPSBmYWxzZVxuICAgIHJldHVybiAodGhpcy5fcmVzIHx8PSBuZXcgUmVzcG9uc2UoJzQwNCBOb3QgRm91bmQnLCB7IHN0YXR1czogNDA0IH0pKVxuICB9XG5cbiAgc2V0IHJlcyhfcmVzOiBSZXNwb25zZSB8IHVuZGVmaW5lZCkge1xuICAgIHRoaXMuX2luaXQgPSBmYWxzZVxuICAgIGlmICh0aGlzLl9yZXMgJiYgX3Jlcykge1xuICAgICAgdGhpcy5fcmVzLmhlYWRlcnMuZGVsZXRlKCdjb250ZW50LXR5cGUnKVxuICAgICAgdGhpcy5fcmVzLmhlYWRlcnMuZm9yRWFjaCgodiwgaykgPT4ge1xuICAgICAgICBfcmVzLmhlYWRlcnMuc2V0KGssIHYpXG4gICAgICB9KVxuICAgIH1cbiAgICB0aGlzLl9yZXMgPSBfcmVzXG4gICAgdGhpcy5maW5hbGl6ZWQgPSB0cnVlXG4gIH1cblxuICAvKipcbiAgICogQGV4cGVyaW1lbnRhbFxuICAgKiBgYy5yZW5kZXIoKWAgaXMgYW4gZXhwZXJpbWVudGFsIGZlYXR1cmUuXG4gICAqIFRoZSBBUEkgbWlnaHQgYmUgY2hhbmdlZC5cbiAgICovXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcbiAgLy8gQHRzLWlnbm9yZVxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICByZW5kZXI6IFJlbmRlcmVyID0gKC4uLmFyZ3M6IGFueVtdKSA9PiB0aGlzLl9yZW5kZXJlciguLi5hcmdzKVxuXG4gIC8qKlxuICAgKiBAZXhwZXJpbWVudGFsXG4gICAqIGBjLnNldFJlbmRlcmVyKClgIGlzIGFuIGV4cGVyaW1lbnRhbCBmZWF0dXJlLlxuICAgKiBUaGUgQVBJIG1pZ2h0IGJlIGNoYW5nZWQuXG4gICAqL1xuICBzZXRSZW5kZXJlciA9IChyZW5kZXJlcjogUmVuZGVyZXIpID0+IHtcbiAgICB0aGlzLl9yZW5kZXJlciA9IHJlbmRlcmVyXG4gIH1cblxuICBoZWFkZXIgPSAobmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nIHwgdW5kZWZpbmVkLCBvcHRpb25zPzogeyBhcHBlbmQ/OiBib29sZWFuIH0pOiB2b2lkID0+IHtcbiAgICAvLyBDbGVhciB0aGUgaGVhZGVyXG4gICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmICh0aGlzLl9oKSB7XG4gICAgICAgIHRoaXMuX2guZGVsZXRlKG5hbWUpXG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX3BIKSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLl9wSFtuYW1lLnRvTG9jYWxlTG93ZXJDYXNlKCldXG4gICAgICB9XG4gICAgICBpZiAodGhpcy5maW5hbGl6ZWQpIHtcbiAgICAgICAgdGhpcy5yZXMuaGVhZGVycy5kZWxldGUobmFtZSlcbiAgICAgIH1cbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGlmIChvcHRpb25zPy5hcHBlbmQpIHtcbiAgICAgIGlmICghdGhpcy5faCkge1xuICAgICAgICB0aGlzLl9pbml0ID0gZmFsc2VcbiAgICAgICAgdGhpcy5faCA9IG5ldyBIZWFkZXJzKHRoaXMuX3BIKVxuICAgICAgICB0aGlzLl9wSCA9IHt9XG4gICAgICB9XG4gICAgICB0aGlzLl9oLmFwcGVuZChuYW1lLCB2YWx1ZSlcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHRoaXMuX2gpIHtcbiAgICAgICAgdGhpcy5faC5zZXQobmFtZSwgdmFsdWUpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9wSCA/Pz0ge31cbiAgICAgICAgdGhpcy5fcEhbbmFtZS50b0xvd2VyQ2FzZSgpXSA9IHZhbHVlXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZmluYWxpemVkKSB7XG4gICAgICBpZiAob3B0aW9ucz8uYXBwZW5kKSB7XG4gICAgICAgIHRoaXMucmVzLmhlYWRlcnMuYXBwZW5kKG5hbWUsIHZhbHVlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yZXMuaGVhZGVycy5zZXQobmFtZSwgdmFsdWUpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc3RhdHVzID0gKHN0YXR1czogU3RhdHVzQ29kZSk6IHZvaWQgPT4ge1xuICAgIHRoaXMuX3N0YXR1cyA9IHN0YXR1c1xuICB9XG5cbiAgc2V0OiBTZXQ8RT4gPSAoa2V5OiBzdHJpbmcsIHZhbHVlOiB1bmtub3duKSA9PiB7XG4gICAgdGhpcy5fdmFyID8/PSB7fVxuICAgIHRoaXMuX3ZhcltrZXkgYXMgc3RyaW5nXSA9IHZhbHVlXG4gIH1cblxuICBnZXQ6IEdldDxFPiA9IChrZXk6IHN0cmluZykgPT4ge1xuICAgIHJldHVybiB0aGlzLl92YXIgPyB0aGlzLl92YXJba2V5XSA6IHVuZGVmaW5lZFxuICB9XG5cbiAgLy8gYy52YXIucHJvcE5hbWUgaXMgYSByZWFkLW9ubHlcbiAgZ2V0IHZhcigpOiBSZWFkb25seTxFWydWYXJpYWJsZXMnXT4ge1xuICAgIHJldHVybiB7IC4uLnRoaXMuX3ZhciB9XG4gIH1cblxuICBuZXdSZXNwb25zZTogTmV3UmVzcG9uc2UgPSAoXG4gICAgZGF0YTogRGF0YSB8IG51bGwsXG4gICAgYXJnPzogU3RhdHVzQ29kZSB8IFJlc3BvbnNlSW5pdCxcbiAgICBoZWFkZXJzPzogSGVhZGVyUmVjb3JkXG4gICk6IFJlc3BvbnNlID0+IHtcbiAgICAvLyBPcHRpbWl6ZWRcbiAgICBpZiAodGhpcy5faW5pdCAmJiAhaGVhZGVycyAmJiAhYXJnICYmIHRoaXMuX3N0YXR1cyA9PT0gMjAwKSB7XG4gICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKGRhdGEsIHtcbiAgICAgICAgaGVhZGVyczogdGhpcy5fcEgsXG4gICAgICB9KVxuICAgIH1cblxuICAgIC8vIFJldHVybiBSZXNwb25zZSBpbW1lZGlhdGVseSBpZiBhcmcgaXMgUmVzcG9uc2VJbml0LlxuICAgIGlmIChhcmcgJiYgdHlwZW9mIGFyZyAhPT0gJ251bWJlcicpIHtcbiAgICAgIGNvbnN0IHJlcyA9IG5ldyBSZXNwb25zZShkYXRhLCBhcmcpXG4gICAgICBjb25zdCBjb250ZW50VHlwZSA9IHRoaXMuX3BIPy5bJ2NvbnRlbnQtdHlwZSddXG4gICAgICBpZiAoY29udGVudFR5cGUpIHtcbiAgICAgICAgcmVzLmhlYWRlcnMuc2V0KCdjb250ZW50LXR5cGUnLCBjb250ZW50VHlwZSlcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXNcbiAgICB9XG5cbiAgICBjb25zdCBzdGF0dXMgPSBhcmcgPz8gdGhpcy5fc3RhdHVzXG4gICAgdGhpcy5fcEggPz89IHt9XG5cbiAgICB0aGlzLl9oID8/PSBuZXcgSGVhZGVycygpXG4gICAgZm9yIChjb25zdCBbaywgdl0gb2YgT2JqZWN0LmVudHJpZXModGhpcy5fcEgpKSB7XG4gICAgICB0aGlzLl9oLnNldChrLCB2KVxuICAgIH1cblxuICAgIGlmICh0aGlzLl9yZXMpIHtcbiAgICAgIHRoaXMuX3Jlcy5oZWFkZXJzLmZvckVhY2goKHYsIGspID0+IHtcbiAgICAgICAgdGhpcy5faD8uc2V0KGssIHYpXG4gICAgICB9KVxuICAgICAgZm9yIChjb25zdCBbaywgdl0gb2YgT2JqZWN0LmVudHJpZXModGhpcy5fcEgpKSB7XG4gICAgICAgIHRoaXMuX2guc2V0KGssIHYpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaGVhZGVycyA/Pz0ge31cbiAgICBmb3IgKGNvbnN0IFtrLCB2XSBvZiBPYmplY3QuZW50cmllcyhoZWFkZXJzKSkge1xuICAgICAgaWYgKHR5cGVvZiB2ID09PSAnc3RyaW5nJykge1xuICAgICAgICB0aGlzLl9oLnNldChrLCB2KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5faC5kZWxldGUoaylcbiAgICAgICAgZm9yIChjb25zdCB2MiBvZiB2KSB7XG4gICAgICAgICAgdGhpcy5faC5hcHBlbmQoaywgdjIpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKGRhdGEsIHtcbiAgICAgIHN0YXR1cyxcbiAgICAgIGhlYWRlcnM6IHRoaXMuX2gsXG4gICAgfSlcbiAgfVxuXG4gIGJvZHk6IEJvZHlSZXNwb25kID0gKFxuICAgIGRhdGE6IERhdGEgfCBudWxsLFxuICAgIGFyZz86IFN0YXR1c0NvZGUgfCBSZXNwb25zZUluaXQsXG4gICAgaGVhZGVycz86IEhlYWRlclJlY29yZFxuICApOiBSZXNwb25zZSA9PiB7XG4gICAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInXG4gICAgICA/IHRoaXMubmV3UmVzcG9uc2UoZGF0YSwgYXJnLCBoZWFkZXJzKVxuICAgICAgOiB0aGlzLm5ld1Jlc3BvbnNlKGRhdGEsIGFyZylcbiAgfVxuXG4gIHRleHQ6IFRleHRSZXNwb25kID0gKFxuICAgIHRleHQ6IHN0cmluZyxcbiAgICBhcmc/OiBTdGF0dXNDb2RlIHwgUmVzcG9uc2VJbml0LFxuICAgIGhlYWRlcnM/OiBIZWFkZXJSZWNvcmRcbiAgKTogUmVzcG9uc2UgPT4ge1xuICAgIC8vIElmIHRoZSBoZWFkZXIgaXMgZW1wdHksIHJldHVybiBSZXNwb25zZSBpbW1lZGlhdGVseS5cbiAgICAvLyBDb250ZW50LVR5cGUgd2lsbCBiZSBhZGRlZCBhdXRvbWF0aWNhbGx5IGFzIGB0ZXh0L3BsYWluYC5cbiAgICBpZiAoIXRoaXMuX3BIKSB7XG4gICAgICBpZiAodGhpcy5faW5pdCAmJiAhaGVhZGVycyAmJiAhYXJnKSB7XG4gICAgICAgIHJldHVybiBuZXcgUmVzcG9uc2UodGV4dClcbiAgICAgIH1cbiAgICAgIHRoaXMuX3BIID0ge31cbiAgICB9XG4gICAgLy8gSWYgQ29udGVudC1UeXBlIGlzIG5vdCBzZXQsIHdlIGRvbid0IGhhdmUgdG8gc2V0IGB0ZXh0L3BsYWluYC5cbiAgICAvLyBGZXdlciB0aGUgaGVhZGVyIHZhbHVlcywgaXQgd2lsbCBiZSBmYXN0ZXIuXG4gICAgaWYgKHRoaXMuX3BIWydjb250ZW50LXR5cGUnXSkge1xuICAgICAgdGhpcy5fcEhbJ2NvbnRlbnQtdHlwZSddID0gVEVYVF9QTEFJTlxuICAgIH1cbiAgICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcidcbiAgICAgID8gdGhpcy5uZXdSZXNwb25zZSh0ZXh0LCBhcmcsIGhlYWRlcnMpXG4gICAgICA6IHRoaXMubmV3UmVzcG9uc2UodGV4dCwgYXJnKVxuICB9XG5cbiAganNvbjogSlNPTlJlc3BvbmQgPSA8VCA9IHt9PihcbiAgICBvYmplY3Q6IFQsXG4gICAgYXJnPzogU3RhdHVzQ29kZSB8IFJlc3BvbnNlSW5pdCxcbiAgICBoZWFkZXJzPzogSGVhZGVyUmVjb3JkXG4gICkgPT4ge1xuICAgIGNvbnN0IGJvZHkgPSBKU09OLnN0cmluZ2lmeShvYmplY3QpXG4gICAgdGhpcy5fcEggPz89IHt9XG4gICAgdGhpcy5fcEhbJ2NvbnRlbnQtdHlwZSddID0gJ2FwcGxpY2F0aW9uL2pzb247IGNoYXJzZXQ9VVRGLTgnXG4gICAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInXG4gICAgICA/IHRoaXMubmV3UmVzcG9uc2UoYm9keSwgYXJnLCBoZWFkZXJzKVxuICAgICAgOiB0aGlzLm5ld1Jlc3BvbnNlKGJvZHksIGFyZylcbiAgfVxuXG4gIGpzb25UOiBKU09OVFJlc3BvbmQgPSA8VD4oXG4gICAgb2JqZWN0OiBJbnRlcmZhY2VUb1R5cGU8VD4gZXh0ZW5kcyBKU09OVmFsdWUgPyBUIDogSlNPTlZhbHVlLFxuICAgIGFyZz86IFN0YXR1c0NvZGUgfCBSZXNwb25zZUluaXQsXG4gICAgaGVhZGVycz86IEhlYWRlclJlY29yZFxuICApOiBUeXBlZFJlc3BvbnNlPFxuICAgIEludGVyZmFjZVRvVHlwZTxUPiBleHRlbmRzIEpTT05WYWx1ZVxuICAgICAgPyBKU09OVmFsdWUgZXh0ZW5kcyBJbnRlcmZhY2VUb1R5cGU8VD5cbiAgICAgICAgPyBuZXZlclxuICAgICAgICA6IFRcbiAgICAgIDogbmV2ZXJcbiAgPiA9PiB7XG4gICAgY29uc3QgcmVzcG9uc2UgPVxuICAgICAgdHlwZW9mIGFyZyA9PT0gJ251bWJlcicgPyB0aGlzLmpzb24ob2JqZWN0LCBhcmcsIGhlYWRlcnMpIDogdGhpcy5qc29uKG9iamVjdCwgYXJnKVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3BvbnNlLFxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgICAgIGRhdGE6IG9iamVjdCBhcyBhbnksXG4gICAgICBmb3JtYXQ6ICdqc29uJyxcbiAgICAgIHN0YXR1czogcmVzcG9uc2Uuc3RhdHVzLFxuICAgIH1cbiAgfVxuXG4gIGh0bWw6IEhUTUxSZXNwb25kID0gKFxuICAgIGh0bWw6IHN0cmluZyxcbiAgICBhcmc/OiBTdGF0dXNDb2RlIHwgUmVzcG9uc2VJbml0LFxuICAgIGhlYWRlcnM/OiBIZWFkZXJSZWNvcmRcbiAgKTogUmVzcG9uc2UgPT4ge1xuICAgIHRoaXMuX3BIID8/PSB7fVxuICAgIHRoaXMuX3BIWydjb250ZW50LXR5cGUnXSA9ICd0ZXh0L2h0bWw7IGNoYXJzZXQ9VVRGLTgnXG4gICAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInXG4gICAgICA/IHRoaXMubmV3UmVzcG9uc2UoaHRtbCwgYXJnLCBoZWFkZXJzKVxuICAgICAgOiB0aGlzLm5ld1Jlc3BvbnNlKGh0bWwsIGFyZylcbiAgfVxuXG4gIHJlZGlyZWN0ID0gKGxvY2F0aW9uOiBzdHJpbmcsIHN0YXR1czogU3RhdHVzQ29kZSA9IDMwMik6IFJlc3BvbnNlID0+IHtcbiAgICB0aGlzLl9oID8/PSBuZXcgSGVhZGVycygpXG4gICAgdGhpcy5faC5zZXQoJ0xvY2F0aW9uJywgbG9jYXRpb24pXG4gICAgcmV0dXJuIHRoaXMubmV3UmVzcG9uc2UobnVsbCwgc3RhdHVzKVxuICB9XG5cbiAgc3RyZWFtVGV4dCA9IChcbiAgICBjYjogKHN0cmVhbTogU3RyZWFtaW5nQXBpKSA9PiBQcm9taXNlPHZvaWQ+LFxuICAgIGFyZz86IFN0YXR1c0NvZGUgfCBSZXNwb25zZUluaXQsXG4gICAgaGVhZGVycz86IEhlYWRlclJlY29yZFxuICApOiBSZXNwb25zZSA9PiB7XG4gICAgaGVhZGVycyA/Pz0ge31cbiAgICB0aGlzLmhlYWRlcignY29udGVudC10eXBlJywgVEVYVF9QTEFJTilcbiAgICB0aGlzLmhlYWRlcigneC1jb250ZW50LXR5cGUtb3B0aW9ucycsICdub3NuaWZmJylcbiAgICB0aGlzLmhlYWRlcigndHJhbnNmZXItZW5jb2RpbmcnLCAnY2h1bmtlZCcpXG4gICAgcmV0dXJuIHRoaXMuc3RyZWFtKGNiLCBhcmcsIGhlYWRlcnMpXG4gIH1cblxuICBzdHJlYW0gPSAoXG4gICAgY2I6IChzdHJlYW06IFN0cmVhbWluZ0FwaSkgPT4gUHJvbWlzZTx2b2lkPixcbiAgICBhcmc/OiBTdGF0dXNDb2RlIHwgUmVzcG9uc2VJbml0LFxuICAgIGhlYWRlcnM/OiBIZWFkZXJSZWNvcmRcbiAgKTogUmVzcG9uc2UgPT4ge1xuICAgIGNvbnN0IHsgcmVhZGFibGUsIHdyaXRhYmxlIH0gPSBuZXcgVHJhbnNmb3JtU3RyZWFtKClcbiAgICBjb25zdCBzdHJlYW0gPSBuZXcgU3RyZWFtaW5nQXBpKHdyaXRhYmxlKVxuICAgIGNiKHN0cmVhbSkuZmluYWxseSgoKSA9PiBzdHJlYW0uY2xvc2UoKSlcblxuICAgIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJ1xuICAgICAgPyB0aGlzLm5ld1Jlc3BvbnNlKHJlYWRhYmxlLCBhcmcsIGhlYWRlcnMpXG4gICAgICA6IHRoaXMubmV3UmVzcG9uc2UocmVhZGFibGUsIGFyZylcbiAgfVxuXG4gIC8qKiBAZGVwcmVjYXRlZFxuICAgKiBVc2UgQ29va2llIE1pZGRsZXdhcmUgaW5zdGVhZCBvZiBgYy5jb29raWUoKWAuIFRoZSBgYy5jb29raWUoKWAgd2lsbCBiZSByZW1vdmVkIGluIHY0LlxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKlxuICAgKiBpbXBvcnQgeyBzZXRDb29raWUgfSBmcm9tICdob25vL2Nvb2tpZSdcbiAgICogLy8gLi4uXG4gICAqIGFwcC5nZXQoJy8nLCAoYykgPT4ge1xuICAgKiAgIHNldENvb2tpZShjLCAna2V5JywgJ3ZhbHVlJylcbiAgICogICAvLy4uLlxuICAgKiB9KVxuICAgKi9cbiAgY29va2llID0gKG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZywgb3B0PzogQ29va2llT3B0aW9ucyk6IHZvaWQgPT4ge1xuICAgIGNvbnN0IGNvb2tpZSA9IHNlcmlhbGl6ZShuYW1lLCB2YWx1ZSwgb3B0KVxuICAgIHRoaXMuaGVhZGVyKCdzZXQtY29va2llJywgY29va2llLCB7IGFwcGVuZDogdHJ1ZSB9KVxuICB9XG5cbiAgbm90Rm91bmQgPSAoKTogUmVzcG9uc2UgfCBQcm9taXNlPFJlc3BvbnNlPiA9PiB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHMtY29tbWVudFxuICAgIC8vIEB0cy1pZ25vcmVcbiAgICByZXR1cm4gdGhpcy5ub3RGb3VuZEhhbmRsZXIodGhpcylcbiAgfVxuXG4gIC8qKiBAZGVwcmVjYXRlZFxuICAgKiBVc2UgYGdldFJ1bnRpbWVLZXkoKWAgZXhwb3J0ZWQgZnJvbSBgaG9uby9hZGFwdGVyYCBpbnN0ZWFkIG9mIGBjLnJ1bnRpbWUoKWAuIFRoZSBgYy5ydW50aW1lKClgIHdpbGwgYmUgcmVtb3ZlZCBpbiB2NC5cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICpcbiAgICogaW1wb3J0IHsgZ2V0UnVudGltZUtleSB9IGZyb20gJ2hvbm8vYWRhcHRlcidcbiAgICogLy8gLi4uXG4gICAqIGFwcC5nZXQoJy8nLCAoYykgPT4ge1xuICAgKiAgIGNvbnN0IGtleSA9IGdldFJ1bnRpbWVLZXkoKVxuICAgKiAgIC8vLi4uXG4gICAqIH0pXG4gICAqL1xuICBnZXQgcnVudGltZSgpOiBSdW50aW1lIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgIGNvbnN0IGdsb2JhbCA9IGdsb2JhbFRoaXMgYXMgYW55XG5cbiAgICBpZiAoZ2xvYmFsPy5EZW5vICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiAnZGVubydcbiAgICB9XG5cbiAgICBpZiAoZ2xvYmFsPy5CdW4gIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuICdidW4nXG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBnbG9iYWw/LldlYlNvY2tldFBhaXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiAnd29ya2VyZCdcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGdsb2JhbD8uRWRnZVJ1bnRpbWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gJ2VkZ2UtbGlnaHQnXG4gICAgfVxuXG4gICAgaWYgKGdsb2JhbD8uZmFzdGx5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiAnZmFzdGx5J1xuICAgIH1cblxuICAgIGlmIChnbG9iYWw/Ll9fbGFnb25fXyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gJ2xhZ29uJ1xuICAgIH1cblxuICAgIGlmIChnbG9iYWw/LnByb2Nlc3M/LnJlbGVhc2U/Lm5hbWUgPT09ICdub2RlJykge1xuICAgICAgcmV0dXJuICdub2RlJ1xuICAgIH1cblxuICAgIHJldHVybiAnb3RoZXInXG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFHQSxTQUFTLFNBQVMsUUFBUSxvQkFBbUI7QUFFN0MsU0FBUyxZQUFZLFFBQVEsb0JBQW1CO0FBa0ZoRCxNQUFNLGFBQWE7QUFFbkIsT0FBTyxNQUFNO0lBT1gsSUFBNkI7SUFDN0IsTUFBcUIsQ0FBQyxFQUFDO0lBQ2YsT0FBdUIsQ0FBQyxFQUFDO0lBQ2pDLFlBQXFCLEtBQUssQ0FBQTtJQUMxQixRQUEyQixVQUFTO0lBRTVCLFVBQXNCLElBQUc7SUFDekIsT0FBcUQ7SUFDckQsS0FBMEIsVUFBVSxZQUFZO0tBQWI7SUFDbkMsTUFBMEMsVUFBVSxtQkFBbUI7S0FBcEI7SUFDbkQsS0FBMEI7SUFDMUIsUUFBUSxJQUFJLENBQUE7SUFDWixZQUFzQixDQUFDLFVBQW9CLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUTtJQUM3RCxrQkFBc0MsSUFBTSxJQUFJLFdBQVU7SUFFbEUsWUFBWSxHQUE2QixFQUFFLE9BQTJCLENBQUU7UUFDdEUsSUFBSSxDQUFDLEdBQUcsR0FBRztRQUNYLElBQUksU0FBUztZQUNYLElBQUksQ0FBQyxNQUFNLEdBQUcsUUFBUSxZQUFZO1lBQ2xDLElBQUksQ0FBQyxHQUFHLEdBQUcsUUFBUSxHQUFHO1lBQ3RCLElBQUksUUFBUSxlQUFlLEVBQUU7Z0JBQzNCLElBQUksQ0FBQyxlQUFlLEdBQUcsUUFBUSxlQUFlO1lBQ2hELENBQUM7UUFDSCxDQUFDO0lBQ0g7SUFFQSxJQUFJLFFBQXdCO1FBQzFCLElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxpQkFBaUIsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUMvQyxPQUFPLElBQUksQ0FBQyxNQUFNO1FBQ3BCLE9BQU87WUFDTCxNQUFNLE1BQU0sa0NBQWlDO1FBQy9DLENBQUM7SUFDSDtJQUVBLElBQUksZUFBaUM7UUFDbkMsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ2YsT0FBTyxJQUFJLENBQUMsTUFBTTtRQUNwQixPQUFPO1lBQ0wsTUFBTSxNQUFNLHdDQUF1QztRQUNyRCxDQUFDO0lBQ0g7SUFFQSxJQUFJLE1BQWdCO1FBQ2xCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSztRQUNsQixPQUFRLElBQUksQ0FBQyxJQUFJLEtBQUssSUFBSSxTQUFTLGlCQUFpQjtZQUFFLFFBQVE7UUFBSTtJQUNwRTtJQUVBLElBQUksSUFBSSxJQUEwQixFQUFFO1FBQ2xDLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSztRQUNsQixJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksTUFBTTtZQUNyQixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7WUFDekIsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxJQUFNO2dCQUNsQyxLQUFLLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRztZQUN0QjtRQUNGLENBQUM7UUFDRCxJQUFJLENBQUMsSUFBSSxHQUFHO1FBQ1osSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJO0lBQ3ZCO0lBRUE7Ozs7R0FJQyxHQUNELDZEQUE2RDtJQUM3RCxhQUFhO0lBQ2IsOERBQThEO0lBQzlELFNBQW1CLENBQUMsR0FBRyxPQUFnQixJQUFJLENBQUMsU0FBUyxJQUFJLE1BQUs7SUFFOUQ7Ozs7R0FJQyxHQUNELGNBQWMsQ0FBQyxXQUF1QjtRQUNwQyxJQUFJLENBQUMsU0FBUyxHQUFHO0lBQ25CLEVBQUM7SUFFRCxTQUFTLENBQUMsTUFBYyxPQUEyQixVQUF5QztRQUMxRixtQkFBbUI7UUFDbkIsSUFBSSxVQUFVLFdBQVc7WUFDdkIsSUFBSSxJQUFJLENBQUMsRUFBRSxFQUFFO2dCQUNYLElBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDO1lBQ2pCLE9BQU8sSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFO2dCQUNuQixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxpQkFBaUIsR0FBRztZQUMzQyxDQUFDO1lBQ0QsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUNsQixJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7WUFDMUIsQ0FBQztZQUNEO1FBQ0YsQ0FBQztRQUVELElBQUksU0FBUyxRQUFRO1lBQ25CLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFO2dCQUNaLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSztnQkFDbEIsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLFFBQVEsSUFBSSxDQUFDLEdBQUc7Z0JBQzlCLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQztZQUNkLENBQUM7WUFDRCxJQUFJLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNO1FBQ3ZCLE9BQU87WUFDTCxJQUFJLElBQUksQ0FBQyxFQUFFLEVBQUU7Z0JBQ1gsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsTUFBTTtZQUNwQixPQUFPO2dCQUNMLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQztnQkFDZCxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssV0FBVyxHQUFHLEdBQUc7WUFDakMsQ0FBQztRQUNILENBQUM7UUFFRCxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDbEIsSUFBSSxTQUFTLFFBQVE7Z0JBQ25CLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNO1lBQ2hDLE9BQU87Z0JBQ0wsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU07WUFDN0IsQ0FBQztRQUNILENBQUM7SUFDSCxFQUFDO0lBRUQsU0FBUyxDQUFDLFNBQTZCO1FBQ3JDLElBQUksQ0FBQyxPQUFPLEdBQUc7SUFDakIsRUFBQztJQUVELE1BQWMsQ0FBQyxLQUFhLFFBQW1CO1FBQzdDLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQztRQUNmLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBYyxHQUFHO0lBQzdCLEVBQUM7SUFFRCxNQUFjLENBQUMsTUFBZ0I7UUFDN0IsT0FBTyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLFNBQVM7SUFDL0MsRUFBQztJQUVELGdDQUFnQztJQUNoQyxJQUFJLE1BQWdDO1FBQ2xDLE9BQU87WUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJO1FBQUM7SUFDeEI7SUFFQSxjQUEyQixDQUN6QixNQUNBLEtBQ0EsVUFDYTtRQUNiLFlBQVk7UUFDWixJQUFJLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxJQUFJLENBQUMsT0FBTyxLQUFLLEtBQUs7WUFDMUQsT0FBTyxJQUFJLFNBQVMsTUFBTTtnQkFDeEIsU0FBUyxJQUFJLENBQUMsR0FBRztZQUNuQjtRQUNGLENBQUM7UUFFRCxzREFBc0Q7UUFDdEQsSUFBSSxPQUFPLE9BQU8sUUFBUSxVQUFVO1lBQ2xDLE1BQU0sTUFBTSxJQUFJLFNBQVMsTUFBTTtZQUMvQixNQUFNLGNBQWMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLGVBQWU7WUFDOUMsSUFBSSxhQUFhO2dCQUNmLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0I7WUFDbEMsQ0FBQztZQUNELE9BQU87UUFDVCxDQUFDO1FBRUQsTUFBTSxTQUFTLE9BQU8sSUFBSSxDQUFDLE9BQU87UUFDbEMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDO1FBRWQsSUFBSSxDQUFDLEVBQUUsS0FBSyxJQUFJO1FBQ2hCLEtBQUssTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUc7WUFDN0MsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRztRQUNqQjtRQUVBLElBQUksSUFBSSxDQUFDLElBQUksRUFBRTtZQUNiLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsSUFBTTtnQkFDbEMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLEdBQUc7WUFDbEI7WUFDQSxLQUFLLE1BQU0sQ0FBQyxHQUFHLEVBQUUsSUFBSSxPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFHO2dCQUM3QyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHO1lBQ2pCO1FBQ0YsQ0FBQztRQUVELFlBQVksQ0FBQztRQUNiLEtBQUssTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLE9BQU8sT0FBTyxDQUFDLFNBQVU7WUFDNUMsSUFBSSxPQUFPLE1BQU0sVUFBVTtnQkFDekIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRztZQUNqQixPQUFPO2dCQUNMLElBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDO2dCQUNmLEtBQUssTUFBTSxNQUFNLEVBQUc7b0JBQ2xCLElBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEdBQUc7Z0JBQ3BCO1lBQ0YsQ0FBQztRQUNIO1FBRUEsT0FBTyxJQUFJLFNBQVMsTUFBTTtZQUN4QjtZQUNBLFNBQVMsSUFBSSxDQUFDLEVBQUU7UUFDbEI7SUFDRixFQUFDO0lBRUQsT0FBb0IsQ0FDbEIsTUFDQSxLQUNBLFVBQ2E7UUFDYixPQUFPLE9BQU8sUUFBUSxXQUNsQixJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sS0FBSyxXQUM1QixJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sSUFBSTtJQUNqQyxFQUFDO0lBRUQsT0FBb0IsQ0FDbEIsTUFDQSxLQUNBLFVBQ2E7UUFDYix1REFBdUQ7UUFDdkQsNERBQTREO1FBQzVELElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO1lBQ2IsSUFBSSxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUs7Z0JBQ2xDLE9BQU8sSUFBSSxTQUFTO1lBQ3RCLENBQUM7WUFDRCxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUM7UUFDZCxDQUFDO1FBQ0QsaUVBQWlFO1FBQ2pFLDhDQUE4QztRQUM5QyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsZUFBZSxFQUFFO1lBQzVCLElBQUksQ0FBQyxHQUFHLENBQUMsZUFBZSxHQUFHO1FBQzdCLENBQUM7UUFDRCxPQUFPLE9BQU8sUUFBUSxXQUNsQixJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sS0FBSyxXQUM1QixJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sSUFBSTtJQUNqQyxFQUFDO0lBRUQsT0FBb0IsQ0FDbEIsUUFDQSxLQUNBLFVBQ0c7UUFDSCxNQUFNLE9BQU8sS0FBSyxTQUFTLENBQUM7UUFDNUIsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDO1FBQ2QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxlQUFlLEdBQUc7UUFDM0IsT0FBTyxPQUFPLFFBQVEsV0FDbEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEtBQUssV0FDNUIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLElBQUk7SUFDakMsRUFBQztJQUVELFFBQXNCLENBQ3BCLFFBQ0EsS0FDQSxVQU9HO1FBQ0gsTUFBTSxXQUNKLE9BQU8sUUFBUSxXQUFXLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxLQUFLLFdBQVcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUk7UUFFcEYsT0FBTztZQUNMO1lBQ0EsOERBQThEO1lBQzlELE1BQU07WUFDTixRQUFRO1lBQ1IsUUFBUSxTQUFTLE1BQU07UUFDekI7SUFDRixFQUFDO0lBRUQsT0FBb0IsQ0FDbEIsTUFDQSxLQUNBLFVBQ2E7UUFDYixJQUFJLENBQUMsR0FBRyxLQUFLLENBQUM7UUFDZCxJQUFJLENBQUMsR0FBRyxDQUFDLGVBQWUsR0FBRztRQUMzQixPQUFPLE9BQU8sUUFBUSxXQUNsQixJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sS0FBSyxXQUM1QixJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sSUFBSTtJQUNqQyxFQUFDO0lBRUQsV0FBVyxDQUFDLFVBQWtCLFNBQXFCLEdBQUcsR0FBZTtRQUNuRSxJQUFJLENBQUMsRUFBRSxLQUFLLElBQUk7UUFDaEIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsWUFBWTtRQUN4QixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFO0lBQ2hDLEVBQUM7SUFFRCxhQUFhLENBQ1gsSUFDQSxLQUNBLFVBQ2E7UUFDYixZQUFZLENBQUM7UUFDYixJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQjtRQUM1QixJQUFJLENBQUMsTUFBTSxDQUFDLDBCQUEwQjtRQUN0QyxJQUFJLENBQUMsTUFBTSxDQUFDLHFCQUFxQjtRQUNqQyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLO0lBQzlCLEVBQUM7SUFFRCxTQUFTLENBQ1AsSUFDQSxLQUNBLFVBQ2E7UUFDYixNQUFNLEVBQUUsU0FBUSxFQUFFLFNBQVEsRUFBRSxHQUFHLElBQUk7UUFDbkMsTUFBTSxTQUFTLElBQUksYUFBYTtRQUNoQyxHQUFHLFFBQVEsT0FBTyxDQUFDLElBQU0sT0FBTyxLQUFLO1FBRXJDLE9BQU8sT0FBTyxRQUFRLFdBQ2xCLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxLQUFLLFdBQ2hDLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxJQUFJO0lBQ3JDLEVBQUM7SUFFRDs7Ozs7Ozs7Ozs7R0FXQyxHQUNELFNBQVMsQ0FBQyxNQUFjLE9BQWUsTUFBOEI7UUFDbkUsTUFBTSxTQUFTLFVBQVUsTUFBTSxPQUFPO1FBQ3RDLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxRQUFRO1lBQUUsUUFBUSxJQUFJO1FBQUM7SUFDbkQsRUFBQztJQUVELFdBQVcsSUFBb0M7UUFDN0MsNkRBQTZEO1FBQzdELGFBQWE7UUFDYixPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSTtJQUNsQyxFQUFDO0lBRUQ7Ozs7Ozs7Ozs7O0dBV0MsR0FDRCxJQUFJLFVBQW1CO1FBQ3JCLDhEQUE4RDtRQUM5RCxNQUFNLFNBQVM7UUFFZixJQUFJLFFBQVEsU0FBUyxXQUFXO1lBQzlCLE9BQU87UUFDVCxDQUFDO1FBRUQsSUFBSSxRQUFRLFFBQVEsV0FBVztZQUM3QixPQUFPO1FBQ1QsQ0FBQztRQUVELElBQUksT0FBTyxRQUFRLGtCQUFrQixZQUFZO1lBQy9DLE9BQU87UUFDVCxDQUFDO1FBRUQsSUFBSSxPQUFPLFFBQVEsZ0JBQWdCLFVBQVU7WUFDM0MsT0FBTztRQUNULENBQUM7UUFFRCxJQUFJLFFBQVEsV0FBVyxXQUFXO1lBQ2hDLE9BQU87UUFDVCxDQUFDO1FBRUQsSUFBSSxRQUFRLGNBQWMsV0FBVztZQUNuQyxPQUFPO1FBQ1QsQ0FBQztRQUVELElBQUksUUFBUSxTQUFTLFNBQVMsU0FBUyxRQUFRO1lBQzdDLE9BQU87UUFDVCxDQUFDO1FBRUQsT0FBTztJQUNUO0FBQ0YsQ0FBQyJ9