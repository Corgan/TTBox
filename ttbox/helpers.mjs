const getToolbox = async function() {
    let toolboxWindow = (await (new Promise(resolve => nw.Window.getAll(a => resolve(a))))).find(w => w.window.location.href.match("/mods/ttbox/ttbox.html"));

    if(toolboxWindow === undefined) {
        toolboxWindow = await (new Promise((resolve) => {
            nw.Window.open('/mods/ttbox/ttbox.html', { id: "ttbox", frame: false }, (w) => {
                w.on('loaded', () => resolve(w));
                w.on('close', () => { });
            });
        }));
    }

    return toolboxWindow;
}

let ttPromise = false;
const getTT = async () => {
    let tt = (await (new Promise(resolve => nw.Window.getAll(a => resolve(a))))).find(w => w.window.location.href.match("/mods/ttbox/tt.html"));

    if(tt === undefined) {
        if(!ttPromise) {
            ttPromise = new Promise((resolve) => {
                nw.Window.open('/mods/ttbox/tt.html', { frame: false, transparent: true, show: true }, (w) => {
                    w.moveTo(9999, 9999);
                    w.on('loaded', async () => {
                        resolve(w);
                    });
                });
            });
        }
        
        tt = await ttPromise;
        ttPromise = false;
    }

    return tt;
};

function createElement(tagName, options={}) {
    const elem = document.createElement(tagName);
    if (options.className !== undefined)
        elem.className = options.className;
    if (options.classList !== undefined)
        elem.classList.add(...options.classList);
    if (options.text !== undefined)
        elem.textContent = options.text;
    if (options.html !== undefined)
        elem.innerHTML = options.html;
    if (options.parent !== undefined)
        options.parent.appendChild(elem);
    if (options.children !== undefined)
        elem.append(...options.children);
    if (options.style !== undefined)
        options.style.forEach((entry) => {
            if(!Array.isArray(entry))
                entry = entry.split(':');

            let [name, value] = entry;
            return elem.style[name] = value;
        });
    if (options.attributes !== undefined)
        options.attributes.forEach(([name,value]) => elem.setAttribute(name, value));
    if (options.id !== undefined)
        elem.id = options.id;
    return elem;
};

function* chunks(arr, n) {
    for (let i = 0; i < arr.length; i += n) {
        yield arr.slice(i, i + n);
    }
}

export { createElement, chunks, getTT, getToolbox };