function fmtUptime(secs) {
    const d = Math.floor(secs / 86400);
    const h = Math.floor((secs % 86400) / 3600);
    const m = Math.floor((secs % 3600) / 60);
    if (d > 0) return `${d}d${h}h`;
    if (h > 0) return `${h}h${m}m`;
    return `${m}m`;
}

function renderServers(items) {
    const el = document.getElementById('servers-list');
    el.innerHTML = '';
    for (const s of items) {
        const up = s.status === 'up';
        const div = document.createElement('div');
        div.className = 'server-item';
        div.innerHTML = `<div class="server-row1"><span class="server-dot ${up ? 'up' : 'down'}"></span><span class="server-name">${s.name}</span><span class="server-up">${fmtUptime(s.info.u)}</span></div><div class="server-row2"><span>cpu <b>${s.info.cpu.toFixed(0)}%</b></span><span>mem <b>${s.info.mp.toFixed(0)}%</b></span><span>dsk <b>${s.info.dp.toFixed(0)}%</b></span><span>tmp <b>${s.info.dt.toFixed(0)}°</b></span></div>`;
        el.appendChild(div);
    }
}

async function fetchServers() {
    const el = document.getElementById('servers-list');
    try {
        const res = await fetch('https://beszel-proxy.prigoana.com/');
        if (!res.ok) throw new Error(res.status);
        const data = await res.json();
        renderServers(data.items);
    } catch {
        el.textContent = 'unavailable';
    }
}

fetchServers();
