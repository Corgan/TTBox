const getToolbox = async function() {
    let baseDir = document.getElementById('TTBox-Script').src;
    baseDir = baseDir.slice(0, baseDir.indexOf('/ttbox.mjs'));
    let toolboxWindow = (await (new Promise(resolve => nw.Window.getAll(a => resolve(a))))).find(w => w.window.location.href.match("/mods/ttbox.html"));

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

const updateData = function() {
    window.isSaving = true;
    global.game_data = JSON.parse(JSON.stringify(game));
    window.isSaving = false;
    requestAnimationFrame(updateData);
}

updateData();
await getToolbox();