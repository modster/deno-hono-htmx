export const parseBody = async (r)=>{
    let body = {};
    const contentType = r.headers.get('Content-Type');
    if (contentType && (contentType.startsWith('multipart/form-data') || contentType.startsWith('application/x-www-form-urlencoded'))) {
        const form = {};
        (await r.formData()).forEach((value, key)=>{
            form[key] = value;
        });
        body = form;
    }
    return body;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My40LjEvdXRpbHMvYm9keS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgdHlwZSBCb2R5RGF0YSA9IFJlY29yZDxzdHJpbmcsIHN0cmluZyB8IEZpbGU+XG5cbmV4cG9ydCBjb25zdCBwYXJzZUJvZHkgPSBhc3luYyA8VCBleHRlbmRzIEJvZHlEYXRhID0gQm9keURhdGE+KFxuICByOiBSZXF1ZXN0IHwgUmVzcG9uc2Vcbik6IFByb21pc2U8VD4gPT4ge1xuICBsZXQgYm9keTogQm9keURhdGEgPSB7fVxuICBjb25zdCBjb250ZW50VHlwZSA9IHIuaGVhZGVycy5nZXQoJ0NvbnRlbnQtVHlwZScpXG4gIGlmIChcbiAgICBjb250ZW50VHlwZSAmJlxuICAgIChjb250ZW50VHlwZS5zdGFydHNXaXRoKCdtdWx0aXBhcnQvZm9ybS1kYXRhJykgfHxcbiAgICAgIGNvbnRlbnRUeXBlLnN0YXJ0c1dpdGgoJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcpKVxuICApIHtcbiAgICBjb25zdCBmb3JtOiBCb2R5RGF0YSA9IHt9XG4gICAgOyhhd2FpdCByLmZvcm1EYXRhKCkpLmZvckVhY2goKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgIGZvcm1ba2V5XSA9IHZhbHVlXG4gICAgfSlcbiAgICBib2R5ID0gZm9ybVxuICB9XG4gIHJldHVybiBib2R5IGFzIFRcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLE1BQU0sWUFBWSxPQUN2QixJQUNlO0lBQ2YsSUFBSSxPQUFpQixDQUFDO0lBQ3RCLE1BQU0sY0FBYyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUM7SUFDbEMsSUFDRSxlQUNBLENBQUMsWUFBWSxVQUFVLENBQUMsMEJBQ3RCLFlBQVksVUFBVSxDQUFDLG9DQUFvQyxHQUM3RDtRQUNBLE1BQU0sT0FBaUIsQ0FBQztRQUN2QixDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQyxPQUFPLE1BQVE7WUFDNUMsSUFBSSxDQUFDLElBQUksR0FBRztRQUNkO1FBQ0EsT0FBTztJQUNULENBQUM7SUFDRCxPQUFPO0FBQ1QsRUFBQyJ9