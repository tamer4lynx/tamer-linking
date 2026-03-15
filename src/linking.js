let urlSubscription = null;
export function createURL(path = '', options = {}) {
    const mod = NativeModules?.LinkingModule;
    if (!mod?.createURL) {
        const scheme = options.scheme ?? 'tamerdevapp';
        const p = options.path ?? path;
        const qs = options.queryParams
            ? '?' + Object.entries(options.queryParams).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')
            : '';
        return `${scheme}://${p}`.replace(/\/$/, '') + qs;
    }
    const opts = { scheme: options.scheme ?? 'tamerdevapp', path: options.path ?? path, queryParams: options.queryParams ?? {} };
    return mod.createURL(path, JSON.stringify(opts));
}
export function getInitialURL() {
    return new Promise((resolve) => {
        const mod = NativeModules?.LinkingModule;
        if (!mod?.getInitialURL) {
            resolve(null);
            return;
        }
        mod.getInitialURL((url) => resolve(url));
    });
}
export function addEventListener(type, listener) {
    if (type !== 'url')
        return { remove: () => { } };
    const bridge = typeof lynx !== 'undefined' ? lynx?.getJSModule?.('GlobalEventEmitter') : undefined;
    if (!bridge?.addListener)
        return { remove: () => { } };
    const handler = (ev) => {
        try {
            const data = ev?.payload ? JSON.parse(ev.payload) : ev;
            if (data?.url)
                listener({ url: data.url });
        }
        catch {
            /* ignore */
        }
    };
    bridge.addListener('tamer-linking:url', handler);
    const sub = {
        remove: () => {
            bridge?.removeListener?.('tamer-linking:url', handler);
            urlSubscription = null;
        },
    };
    urlSubscription = sub;
    return sub;
}
export function removeEventListener(type, listener) {
    urlSubscription?.remove?.();
}
