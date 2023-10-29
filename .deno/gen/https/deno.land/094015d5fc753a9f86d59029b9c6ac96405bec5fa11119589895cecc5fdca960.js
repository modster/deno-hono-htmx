export const getFilePath = (options)=>{
    let filename = options.filename;
    if (/(?:^|\/)\.\.(?:$|\/)/.test(filename)) return;
    let root = options.root || '';
    const defaultDocument = options.defaultDocument || 'index.html';
    if (filename.endsWith('/')) {
        // /top/ => /top/index.html
        filename = filename.concat(defaultDocument);
    } else if (!filename.match(/\.[a-zA-Z0-9]+$/)) {
        // /top => /top/index.html
        filename = filename.concat('/' + defaultDocument);
    }
    // /foo.html => foo.html
    filename = filename.replace(/^\.?\//, '');
    // assets/ => assets
    root = root.replace(/\/$/, '');
    // ./assets/foo.html => assets/foo.html
    let path = root ? root + '/' + filename : filename;
    path = path.replace(/^\.?\//, '');
    return path;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My45LjAvdXRpbHMvZmlsZXBhdGgudHMiXSwic291cmNlc0NvbnRlbnQiOlsidHlwZSBGaWxlUGF0aE9wdGlvbnMgPSB7XG4gIGZpbGVuYW1lOiBzdHJpbmdcbiAgcm9vdD86IHN0cmluZ1xuICBkZWZhdWx0RG9jdW1lbnQ/OiBzdHJpbmdcbn1cblxuZXhwb3J0IGNvbnN0IGdldEZpbGVQYXRoID0gKG9wdGlvbnM6IEZpbGVQYXRoT3B0aW9ucyk6IHN0cmluZyB8IHVuZGVmaW5lZCA9PiB7XG4gIGxldCBmaWxlbmFtZSA9IG9wdGlvbnMuZmlsZW5hbWVcbiAgaWYgKC8oPzpefFxcLylcXC5cXC4oPzokfFxcLykvLnRlc3QoZmlsZW5hbWUpKSByZXR1cm5cblxuICBsZXQgcm9vdCA9IG9wdGlvbnMucm9vdCB8fCAnJ1xuICBjb25zdCBkZWZhdWx0RG9jdW1lbnQgPSBvcHRpb25zLmRlZmF1bHREb2N1bWVudCB8fCAnaW5kZXguaHRtbCdcblxuICBpZiAoZmlsZW5hbWUuZW5kc1dpdGgoJy8nKSkge1xuICAgIC8vIC90b3AvID0+IC90b3AvaW5kZXguaHRtbFxuICAgIGZpbGVuYW1lID0gZmlsZW5hbWUuY29uY2F0KGRlZmF1bHREb2N1bWVudClcbiAgfSBlbHNlIGlmICghZmlsZW5hbWUubWF0Y2goL1xcLlthLXpBLVowLTldKyQvKSkge1xuICAgIC8vIC90b3AgPT4gL3RvcC9pbmRleC5odG1sXG4gICAgZmlsZW5hbWUgPSBmaWxlbmFtZS5jb25jYXQoJy8nICsgZGVmYXVsdERvY3VtZW50KVxuICB9XG5cbiAgLy8gL2Zvby5odG1sID0+IGZvby5odG1sXG4gIGZpbGVuYW1lID0gZmlsZW5hbWUucmVwbGFjZSgvXlxcLj9cXC8vLCAnJylcblxuICAvLyBhc3NldHMvID0+IGFzc2V0c1xuICByb290ID0gcm9vdC5yZXBsYWNlKC9cXC8kLywgJycpXG5cbiAgLy8gLi9hc3NldHMvZm9vLmh0bWwgPT4gYXNzZXRzL2Zvby5odG1sXG4gIGxldCBwYXRoID0gcm9vdCA/IHJvb3QgKyAnLycgKyBmaWxlbmFtZSA6IGZpbGVuYW1lXG4gIHBhdGggPSBwYXRoLnJlcGxhY2UoL15cXC4/XFwvLywgJycpXG5cbiAgcmV0dXJuIHBhdGhcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFNQSxPQUFPLE1BQU0sY0FBYyxDQUFDLFVBQWlEO0lBQzNFLElBQUksV0FBVyxRQUFRLFFBQVE7SUFDL0IsSUFBSSx1QkFBdUIsSUFBSSxDQUFDLFdBQVc7SUFFM0MsSUFBSSxPQUFPLFFBQVEsSUFBSSxJQUFJO0lBQzNCLE1BQU0sa0JBQWtCLFFBQVEsZUFBZSxJQUFJO0lBRW5ELElBQUksU0FBUyxRQUFRLENBQUMsTUFBTTtRQUMxQiwyQkFBMkI7UUFDM0IsV0FBVyxTQUFTLE1BQU0sQ0FBQztJQUM3QixPQUFPLElBQUksQ0FBQyxTQUFTLEtBQUssQ0FBQyxvQkFBb0I7UUFDN0MsMEJBQTBCO1FBQzFCLFdBQVcsU0FBUyxNQUFNLENBQUMsTUFBTTtJQUNuQyxDQUFDO0lBRUQsd0JBQXdCO0lBQ3hCLFdBQVcsU0FBUyxPQUFPLENBQUMsVUFBVTtJQUV0QyxvQkFBb0I7SUFDcEIsT0FBTyxLQUFLLE9BQU8sQ0FBQyxPQUFPO0lBRTNCLHVDQUF1QztJQUN2QyxJQUFJLE9BQU8sT0FBTyxPQUFPLE1BQU0sV0FBVyxRQUFRO0lBQ2xELE9BQU8sS0FBSyxPQUFPLENBQUMsVUFBVTtJQUU5QixPQUFPO0FBQ1QsRUFBQyJ9