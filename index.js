/*
 * Devil's Night Modes — книжные режимы темы.
 * Всё управление — в меню расширений SillyTavern.
 * Команды: /dn corrupt | hideaway | killswitch | punk57 | conclave | nightfall | off
 */

const VERSION = '1.2.4';

const MODES = [
    { id: 'corrupt',    label: 'Corrupt',     hint: "Devil's Night · кровь, маска, витраж" },
    { id: 'hideaway',   label: 'Hideaway',    hint: 'отель «The Pope», лифт 12, ключ' },
    { id: 'killswitch', label: 'Kill Switch', hint: 'лабиринт, фонтан, маска' },
    { id: 'punk57',     label: 'Punk 57',     hint: 'коридор, шкафчики, пятна краски' },
    { id: 'conclave',   label: 'Conclave',    hint: 'яхта, луна, шампанское' },
    { id: 'nightfall',  label: 'Nightfall',   hint: 'маяк, шторм, карусель' },
];

const NS = 'devils_night_modes';
const ATTR = 'data-dn-mode';

function ctx() {
    return (typeof SillyTavern !== 'undefined' && SillyTavern.getContext) ? SillyTavern.getContext() : null;
}
function store() {
    const s = ctx()?.extensionSettings;
    if (!s) return null;
    if (!s[NS]) s[NS] = { mode: 'corrupt', enabled: true };
    return s[NS];
}
function save() {
    const c = ctx();
    if (c && typeof c.saveSettingsDebounced === 'function') c.saveSettingsDebounced();
}

function state() {
    const s = store();
    return { mode: s?.mode ?? 'corrupt', enabled: s?.enabled !== false };
}

function apply() {
    const { mode, enabled } = state();
    if (enabled && mode && mode !== 'off') {
        document.body.setAttribute(ATTR, mode);
    } else {
        document.body.removeAttribute(ATTR);
    }
    const pill = document.querySelector('.dnm-current');
    const found = MODES.find((m) => m.id === mode);
    if (pill) pill.textContent = enabled ? (found ? found.label : '—') : 'выкл';
    document.querySelectorAll('.dnm-btn').forEach((b) => {
        b.classList.toggle('dnm-active', b.dataset.mode === mode);
    });
    const toggle = document.getElementById('dnm-enabled');
    if (toggle) toggle.checked = enabled;
}

function setMode(mode) {
    const s = store();
    if (s) { s.mode = mode; s.enabled = mode !== 'off'; }
    save();
    apply();
}

function setEnabled(on) {
    const s = store();
    if (s) { s.enabled = !!on; }
    save();
    apply();
}

/* ---------- пылинки: каждая живёт сама ---------- */
function buildDust() {
    if (document.getElementById('dnm-dust')) return;
    const wrap = document.createElement('div');
    wrap.id = 'dnm-dust';
    const COUNT = 26;
    for (let i = 0; i < COUNT; i++) {
        const m = document.createElement('i');
        m.style.setProperty('--x', (Math.random() * 100).toFixed(2) + 'vw');
        m.style.setProperty('--d', (16 + Math.random() * 26).toFixed(1) + 's');
        m.style.setProperty('--dl', (-Math.random() * 40).toFixed(1) + 's');
        m.style.setProperty('--sz', (1.3 + Math.random() * 2.1).toFixed(2) + 'px');
        m.style.setProperty('--sw', (Math.random() < 0.5 ? -1 : 1) * (8 + Math.random() * 46).toFixed(1) + 'px');
        m.style.setProperty('--o', (0.16 + Math.random() * 0.45).toFixed(2));
        wrap.append(m);
    }
    document.body.append(wrap);
}

/* ---------- меню расширений ---------- */
function renderSettings() {
    const host = document.getElementById('extensions_settings');
    if (!host || document.getElementById('dnm-settings')) return;

    const wrap = document.createElement('div');
    wrap.className = 'dnm-settings';

    const rows = MODES.map((m) => `
        <label class="dnm-mode-row">
            <input type="radio" name="dnm-mode" value="${m.id}">
            <span><b>${m.label}</b><i>${m.hint}</i></span>
        </label>`).join('');

    wrap.innerHTML = `
        <div class="inline-drawer">
            <div class="inline-drawer-toggle inline-drawer-header">
                <b>✦ DEVIL'S NIGHT MODES ✦</b>
                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
            </div>
            <div class="inline-drawer-content">
                <label class="checkbox_label dnm-toggle-row">
                    <input id="dnm-enabled" type="checkbox">
                    <span>Включить тему</span>
                </label>
                <div class="dnm-modes">${rows}</div>
                <div class="dnm-footer">
                    <small>v${VERSION}</small>
                    <small>Сделано с любовью · ✦ Selena's Tavern ✦</small>
                </div>
            </div>
        </div>`;

    host.append(wrap);

    wrap.querySelector('#dnm-enabled').addEventListener('change', (e) => setEnabled(e.target.checked));
    wrap.querySelectorAll('input[name="dnm-mode"]').forEach((r) => {
        r.addEventListener('change', () => { if (r.checked) setMode(r.value); });
    });

    const { mode } = state();
    const checked = wrap.querySelector(`input[name="dnm-mode"][value="${mode}"]`);
    if (checked) checked.checked = true;
}

/* ---------- плавающая кнопка (быстрый доступ) ---------- */
function buildPill() {
    if (document.getElementById('dnm-panel')) return;

    const wrap = document.createElement('div');
    wrap.id = 'dnm-panel';

    const head = document.createElement('button');
    head.className = 'dnm-head';
    head.type = 'button';
    head.innerHTML = '<span class="dnm-dot"></span><span class="dnm-current">—</span><span class="dnm-caret">▾</span>';

    const list = document.createElement('div');
    list.className = 'dnm-list';

    for (const m of MODES) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'dnm-btn';
        b.dataset.mode = m.id;
        b.innerHTML = `<b>${m.label}</b><i>${m.hint}</i>`;
        b.addEventListener('click', () => setMode(m.id));
        list.append(b);
    }

    const off = document.createElement('button');
    off.type = 'button';
    off.className = 'dnm-btn dnm-off';
    off.dataset.mode = 'off';
    off.innerHTML = '<b>Выключить</b><i>вернуть базовое оформление</i>';
    off.addEventListener('click', () => setMode('off'));
    list.append(off);

    head.addEventListener('click', () => wrap.classList.toggle('dnm-open'));
    wrap.append(head, list);
    document.body.append(wrap);
}

function registerCommand() {
    const c = ctx();
    const parser = c?.SlashCommandParser;
    const command = c?.SlashCommand;
    const arg = c?.SlashCommandArgument;
    const types = c?.ARGUMENT_TYPE;
    if (!parser || !command || !types) return;

    try {
        parser.addCommandObject(command.fromProps({
            name: 'dn',
            helpString: "Переключить книжный режим темы Devil's Night.",
            returns: 'mode name',
            unnamedArgumentList: [arg.fromProps({ description: 'corrupt|hideaway|killswitch|punk57|conclave|nightfall|off', typeList: [types.STRING], isRequired: false })],
            callback: (_named, value) => {
                const mode = String(value || '').trim().toLowerCase();
                if (!mode) return 'Доступно: ' + MODES.map((m) => m.id).join(', ');
                setMode(mode);
                return `Режим: ${mode}`;
            },
        }));
    } catch (e) {
        console.warn('[dnm] slash command failed', e);
    }
}

function boot() {
    store();
    buildPill();
    buildDust();
    renderSettings();
    apply();
    registerCommand();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 1000));
} else {
    setTimeout(boot, 1000);
}

try {
    const c = ctx();
    if (c?.eventSource && c?.event_types?.APP_READY) {
        c.eventSource.on(c.event_types.APP_READY, () => setTimeout(boot, 400));
    }
    if (c?.eventSource && c?.event_types?.EXTENSIONS_FIRST_LOAD) {
        c.eventSource.on(c.event_types.EXTENSIONS_FIRST_LOAD, () => setTimeout(boot, 400));
    }
} catch { /* ignore */ }
