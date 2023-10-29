const LABEL_REG_EXP_STR = '[^/]+';
const ONLY_WILDCARD_REG_EXP_STR = '.*';
const TAIL_WILDCARD_REG_EXP_STR = '(?:|/.*)';
export const PATH_ERROR = Symbol();
/**
 * Sort order:
 * 1. literal
 * 2. special pattern (e.g. :label{[0-9]+})
 * 3. common label pattern (e.g. :label)
 * 4. wildcard
 */ function compareKey(a, b) {
    if (a.length === 1) {
        return b.length === 1 ? a < b ? -1 : 1 : -1;
    }
    if (b.length === 1) {
        return 1;
    }
    // wildcard
    if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
        return 1;
    } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
        return -1;
    }
    // label
    if (a === LABEL_REG_EXP_STR) {
        return 1;
    } else if (b === LABEL_REG_EXP_STR) {
        return -1;
    }
    return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
export class Node {
    index;
    varIndex;
    children = {};
    insert(tokens, index, paramMap, context, pathErrorCheckOnly) {
        if (tokens.length === 0) {
            if (this.index !== undefined) {
                throw PATH_ERROR;
            }
            if (pathErrorCheckOnly) {
                return;
            }
            this.index = index;
            return;
        }
        const [token, ...restTokens] = tokens;
        const pattern = token === '*' ? restTokens.length === 0 ? [
            '',
            '',
            ONLY_WILDCARD_REG_EXP_STR
        ] // '*' matches to all the trailing paths
         : [
            '',
            '',
            LABEL_REG_EXP_STR
        ] : token === '/*' ? [
            '',
            '',
            TAIL_WILDCARD_REG_EXP_STR
        ] // '/path/to/*' is /\/path\/to(?:|/.*)$
         : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
        let node;
        if (pattern) {
            const name = pattern[1];
            let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
            if (name && pattern[2]) {
                regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, '(?:') // (a|b) => (?:a|b)
                ;
                if (/\((?!\?:)/.test(regexpStr)) {
                    // prefix(?:a|b) is allowed, but prefix(a|b) is not
                    throw PATH_ERROR;
                }
            }
            node = this.children[regexpStr];
            if (!node) {
                if (Object.keys(this.children).some((k)=>k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR)) {
                    throw PATH_ERROR;
                }
                if (pathErrorCheckOnly) {
                    return;
                }
                node = this.children[regexpStr] = new Node();
                if (name !== '') {
                    node.varIndex = context.varIndex++;
                }
            }
            if (!pathErrorCheckOnly && name !== '') {
                paramMap.push([
                    name,
                    node.varIndex
                ]);
            }
        } else {
            node = this.children[token];
            if (!node) {
                if (Object.keys(this.children).some((k)=>k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR)) {
                    throw PATH_ERROR;
                }
                if (pathErrorCheckOnly) {
                    return;
                }
                node = this.children[token] = new Node();
            }
        }
        node.insert(restTokens, index, paramMap, context, pathErrorCheckOnly);
    }
    buildRegExpStr() {
        const childKeys = Object.keys(this.children).sort(compareKey);
        const strList = childKeys.map((k)=>{
            const c = this.children[k];
            return (typeof c.varIndex === 'number' ? `(${k})@${c.varIndex}` : k) + c.buildRegExpStr();
        });
        if (typeof this.index === 'number') {
            strList.unshift(`#${this.index}`);
        }
        if (strList.length === 0) {
            return '';
        }
        if (strList.length === 1) {
            return strList[0];
        }
        return '(?:' + strList.join('|') + ')';
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My44LjIvcm91dGVyL3JlZy1leHAtcm91dGVyL25vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgTEFCRUxfUkVHX0VYUF9TVFIgPSAnW14vXSsnXG5jb25zdCBPTkxZX1dJTERDQVJEX1JFR19FWFBfU1RSID0gJy4qJ1xuY29uc3QgVEFJTF9XSUxEQ0FSRF9SRUdfRVhQX1NUUiA9ICcoPzp8Ly4qKSdcbmV4cG9ydCBjb25zdCBQQVRIX0VSUk9SID0gU3ltYm9sKClcblxuZXhwb3J0IHR5cGUgUGFyYW1Bc3NvY0FycmF5ID0gW3N0cmluZywgbnVtYmVyXVtdXG5leHBvcnQgaW50ZXJmYWNlIENvbnRleHQge1xuICB2YXJJbmRleDogbnVtYmVyXG59XG5cbi8qKlxuICogU29ydCBvcmRlcjpcbiAqIDEuIGxpdGVyYWxcbiAqIDIuIHNwZWNpYWwgcGF0dGVybiAoZS5nLiA6bGFiZWx7WzAtOV0rfSlcbiAqIDMuIGNvbW1vbiBsYWJlbCBwYXR0ZXJuIChlLmcuIDpsYWJlbClcbiAqIDQuIHdpbGRjYXJkXG4gKi9cbmZ1bmN0aW9uIGNvbXBhcmVLZXkoYTogc3RyaW5nLCBiOiBzdHJpbmcpOiBudW1iZXIge1xuICBpZiAoYS5sZW5ndGggPT09IDEpIHtcbiAgICByZXR1cm4gYi5sZW5ndGggPT09IDEgPyAoYSA8IGIgPyAtMSA6IDEpIDogLTFcbiAgfVxuICBpZiAoYi5sZW5ndGggPT09IDEpIHtcbiAgICByZXR1cm4gMVxuICB9XG5cbiAgLy8gd2lsZGNhcmRcbiAgaWYgKGEgPT09IE9OTFlfV0lMRENBUkRfUkVHX0VYUF9TVFIgfHwgYSA9PT0gVEFJTF9XSUxEQ0FSRF9SRUdfRVhQX1NUUikge1xuICAgIHJldHVybiAxXG4gIH0gZWxzZSBpZiAoYiA9PT0gT05MWV9XSUxEQ0FSRF9SRUdfRVhQX1NUUiB8fCBiID09PSBUQUlMX1dJTERDQVJEX1JFR19FWFBfU1RSKSB7XG4gICAgcmV0dXJuIC0xXG4gIH1cblxuICAvLyBsYWJlbFxuICBpZiAoYSA9PT0gTEFCRUxfUkVHX0VYUF9TVFIpIHtcbiAgICByZXR1cm4gMVxuICB9IGVsc2UgaWYgKGIgPT09IExBQkVMX1JFR19FWFBfU1RSKSB7XG4gICAgcmV0dXJuIC0xXG4gIH1cblxuICByZXR1cm4gYS5sZW5ndGggPT09IGIubGVuZ3RoID8gKGEgPCBiID8gLTEgOiAxKSA6IGIubGVuZ3RoIC0gYS5sZW5ndGhcbn1cblxuZXhwb3J0IGNsYXNzIE5vZGUge1xuICBpbmRleD86IG51bWJlclxuICB2YXJJbmRleD86IG51bWJlclxuICBjaGlsZHJlbjogUmVjb3JkPHN0cmluZywgTm9kZT4gPSB7fVxuXG4gIGluc2VydChcbiAgICB0b2tlbnM6IHJlYWRvbmx5IHN0cmluZ1tdLFxuICAgIGluZGV4OiBudW1iZXIsXG4gICAgcGFyYW1NYXA6IFBhcmFtQXNzb2NBcnJheSxcbiAgICBjb250ZXh0OiBDb250ZXh0LFxuICAgIHBhdGhFcnJvckNoZWNrT25seTogYm9vbGVhblxuICApOiB2b2lkIHtcbiAgICBpZiAodG9rZW5zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgaWYgKHRoaXMuaW5kZXggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aHJvdyBQQVRIX0VSUk9SXG4gICAgICB9XG4gICAgICBpZiAocGF0aEVycm9yQ2hlY2tPbmx5KSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICB0aGlzLmluZGV4ID0gaW5kZXhcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IFt0b2tlbiwgLi4ucmVzdFRva2Vuc10gPSB0b2tlbnNcbiAgICBjb25zdCBwYXR0ZXJuID1cbiAgICAgIHRva2VuID09PSAnKidcbiAgICAgICAgPyByZXN0VG9rZW5zLmxlbmd0aCA9PT0gMFxuICAgICAgICAgID8gWycnLCAnJywgT05MWV9XSUxEQ0FSRF9SRUdfRVhQX1NUUl0gLy8gJyonIG1hdGNoZXMgdG8gYWxsIHRoZSB0cmFpbGluZyBwYXRoc1xuICAgICAgICAgIDogWycnLCAnJywgTEFCRUxfUkVHX0VYUF9TVFJdXG4gICAgICAgIDogdG9rZW4gPT09ICcvKidcbiAgICAgICAgPyBbJycsICcnLCBUQUlMX1dJTERDQVJEX1JFR19FWFBfU1RSXSAvLyAnL3BhdGgvdG8vKicgaXMgL1xcL3BhdGhcXC90byg/OnwvLiopJFxuICAgICAgICA6IHRva2VuLm1hdGNoKC9eXFw6KFteXFx7XFx9XSspKD86XFx7KC4rKVxcfSk/JC8pXG5cbiAgICBsZXQgbm9kZVxuICAgIGlmIChwYXR0ZXJuKSB7XG4gICAgICBjb25zdCBuYW1lID0gcGF0dGVyblsxXVxuICAgICAgbGV0IHJlZ2V4cFN0ciA9IHBhdHRlcm5bMl0gfHwgTEFCRUxfUkVHX0VYUF9TVFJcbiAgICAgIGlmIChuYW1lICYmIHBhdHRlcm5bMl0pIHtcbiAgICAgICAgcmVnZXhwU3RyID0gcmVnZXhwU3RyLnJlcGxhY2UoL15cXCgoPyFcXD86KSg/PVteKV0rXFwpJCkvLCAnKD86JykgLy8gKGF8YikgPT4gKD86YXxiKVxuICAgICAgICBpZiAoL1xcKCg/IVxcPzopLy50ZXN0KHJlZ2V4cFN0cikpIHtcbiAgICAgICAgICAvLyBwcmVmaXgoPzphfGIpIGlzIGFsbG93ZWQsIGJ1dCBwcmVmaXgoYXxiKSBpcyBub3RcbiAgICAgICAgICB0aHJvdyBQQVRIX0VSUk9SXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgbm9kZSA9IHRoaXMuY2hpbGRyZW5bcmVnZXhwU3RyXVxuICAgICAgaWYgKCFub2RlKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICBPYmplY3Qua2V5cyh0aGlzLmNoaWxkcmVuKS5zb21lKFxuICAgICAgICAgICAgKGspID0+IGsgIT09IE9OTFlfV0lMRENBUkRfUkVHX0VYUF9TVFIgJiYgayAhPT0gVEFJTF9XSUxEQ0FSRF9SRUdfRVhQX1NUUlxuICAgICAgICAgIClcbiAgICAgICAgKSB7XG4gICAgICAgICAgdGhyb3cgUEFUSF9FUlJPUlxuICAgICAgICB9XG4gICAgICAgIGlmIChwYXRoRXJyb3JDaGVja09ubHkpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBub2RlID0gdGhpcy5jaGlsZHJlbltyZWdleHBTdHJdID0gbmV3IE5vZGUoKVxuICAgICAgICBpZiAobmFtZSAhPT0gJycpIHtcbiAgICAgICAgICBub2RlLnZhckluZGV4ID0gY29udGV4dC52YXJJbmRleCsrXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICghcGF0aEVycm9yQ2hlY2tPbmx5ICYmIG5hbWUgIT09ICcnKSB7XG4gICAgICAgIHBhcmFtTWFwLnB1c2goW25hbWUsIG5vZGUudmFySW5kZXggYXMgbnVtYmVyXSlcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgbm9kZSA9IHRoaXMuY2hpbGRyZW5bdG9rZW5dXG4gICAgICBpZiAoIW5vZGUpIHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgIE9iamVjdC5rZXlzKHRoaXMuY2hpbGRyZW4pLnNvbWUoXG4gICAgICAgICAgICAoaykgPT5cbiAgICAgICAgICAgICAgay5sZW5ndGggPiAxICYmIGsgIT09IE9OTFlfV0lMRENBUkRfUkVHX0VYUF9TVFIgJiYgayAhPT0gVEFJTF9XSUxEQ0FSRF9SRUdfRVhQX1NUUlxuICAgICAgICAgIClcbiAgICAgICAgKSB7XG4gICAgICAgICAgdGhyb3cgUEFUSF9FUlJPUlxuICAgICAgICB9XG4gICAgICAgIGlmIChwYXRoRXJyb3JDaGVja09ubHkpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBub2RlID0gdGhpcy5jaGlsZHJlblt0b2tlbl0gPSBuZXcgTm9kZSgpXG4gICAgICB9XG4gICAgfVxuXG4gICAgbm9kZS5pbnNlcnQocmVzdFRva2VucywgaW5kZXgsIHBhcmFtTWFwLCBjb250ZXh0LCBwYXRoRXJyb3JDaGVja09ubHkpXG4gIH1cblxuICBidWlsZFJlZ0V4cFN0cigpOiBzdHJpbmcge1xuICAgIGNvbnN0IGNoaWxkS2V5cyA9IE9iamVjdC5rZXlzKHRoaXMuY2hpbGRyZW4pLnNvcnQoY29tcGFyZUtleSlcblxuICAgIGNvbnN0IHN0ckxpc3QgPSBjaGlsZEtleXMubWFwKChrKSA9PiB7XG4gICAgICBjb25zdCBjID0gdGhpcy5jaGlsZHJlbltrXVxuICAgICAgcmV0dXJuICh0eXBlb2YgYy52YXJJbmRleCA9PT0gJ251bWJlcicgPyBgKCR7a30pQCR7Yy52YXJJbmRleH1gIDogaykgKyBjLmJ1aWxkUmVnRXhwU3RyKClcbiAgICB9KVxuXG4gICAgaWYgKHR5cGVvZiB0aGlzLmluZGV4ID09PSAnbnVtYmVyJykge1xuICAgICAgc3RyTGlzdC51bnNoaWZ0KGAjJHt0aGlzLmluZGV4fWApXG4gICAgfVxuXG4gICAgaWYgKHN0ckxpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gJydcbiAgICB9XG4gICAgaWYgKHN0ckxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgICByZXR1cm4gc3RyTGlzdFswXVxuICAgIH1cblxuICAgIHJldHVybiAnKD86JyArIHN0ckxpc3Quam9pbignfCcpICsgJyknXG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLG9CQUFvQjtBQUMxQixNQUFNLDRCQUE0QjtBQUNsQyxNQUFNLDRCQUE0QjtBQUNsQyxPQUFPLE1BQU0sYUFBYSxTQUFRO0FBT2xDOzs7Ozs7Q0FNQyxHQUNELFNBQVMsV0FBVyxDQUFTLEVBQUUsQ0FBUyxFQUFVO0lBQ2hELElBQUksRUFBRSxNQUFNLEtBQUssR0FBRztRQUNsQixPQUFPLEVBQUUsTUFBTSxLQUFLLElBQUssSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUksQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFDRCxJQUFJLEVBQUUsTUFBTSxLQUFLLEdBQUc7UUFDbEIsT0FBTztJQUNULENBQUM7SUFFRCxXQUFXO0lBQ1gsSUFBSSxNQUFNLDZCQUE2QixNQUFNLDJCQUEyQjtRQUN0RSxPQUFPO0lBQ1QsT0FBTyxJQUFJLE1BQU0sNkJBQTZCLE1BQU0s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