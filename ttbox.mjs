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
await getToolbox();