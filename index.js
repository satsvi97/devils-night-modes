/*
 * Devil's Night Modes — переключатель книжных режимов темы.
 * Ставит body[data-dn-mode="…"], запоминает выбор в настройках расширения.
 * Команды: /dn corrupt | hideaway | killswitch | nightfall | conclave | punk57 | off
 */

const MODES = [
    { id: 'corrupt',    label: 'Corrupt',     hint: "Devil's Night · кровь, маска, витраж, ливень" },
    { id: 'hideaway',   label: 'Hideaway',    hint: 'лес, кладбище, туман' },
    { id: 'killswitch', label: 'Kill Switch', hint: 'кованые ворота, свечи' },
    { id: 'punk57',     label: 'Punk 57',     hint: 'граффити, спрей, письма' },
    { id: 'conclave',   label: 'Conclave',    hint: 'палуба корабля в океане, гроза' },
    { id: 'nightfall',  label: 'Nightfall',   hint: 'карусель в снегу, свечи' },
];

const NS = 'devils_night_modes';
const ATTR = 'data-dn-mode';

function ctx() {
    return (typeof SillyTavern !== 'undefined' && SillyTavern.getContext) ? SillyTavern.getContext() : null;
}

function settings() {
    const c = ctx();
    if (!c) return null;
    return c.extensionSettings ?? null;
}

function savedMode() {
    const s = settings();
    const v = s?.[NS]?.mode;
    return typeof v === 'string' ? v : 'corrupt';
}

function saveMode(mode) {
    const s = settings();
    if (!s) return;
    s[NS] = s[NS] || {};
    s[NS].mode = mode;
    if (typeof ctx()?.saveSettingsDebounced === 'function') {
        ctx().saveSettingsDebounced();
    }
}

function applyMode(mode, persist = true) {
    const body = document.body;
    if (!mode || mode === 'off') {
        body.removeAttribute(ATTR);
    } else {
        body.setAttribute(ATTR, mode);
    }
    document.querySelectorAll('.dnm-btn').forEach((b) => {
        b.classList.toggle('dnm-active', b.dataset.mode === mode);
    });
    const pill = document.querySelector('.dnm-current');
    const found = MODES.find((m) => m.id === mode);
    if (pill) pill.textContent = found ? found.label : '—';
    if (persist) saveMode(mode);
}

function buildPanel() {
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
        b.addEventListener('click', () => applyMode(m.id));
        list.append(b);
    }

    const off = document.createElement('button');
    off.type = 'button';
    off.className = 'dnm-btn dnm-off';
    off.dataset.mode = 'off';
    off.innerHTML = '<b>Выключить</b><i>вернуть базовое оформление</i>';
    off.addEventListener('click', () => applyMode('off'));
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
    const named = c?.SlashCommandNamedArgument;
    const types = c?.ARGUMENT_TYPE;
    if (!parser || !command || !types) return;

    try {
        parser.addCommandObject(command.fromProps({
            name: 'dn',
            helpString: "Переключить книжный режим темы Devil's Night.",
            returns: 'mode name',
            namedArgumentList: [
                named.fromProps({ name: 'mode', description: 'corrupt|hideaway|killswitch|nightfall|conclave|punk57|off', typeList: [types.STRING], isRequired: false }),
            ],
            unnamedArgumentList: [
                arg.fromProps({ description: 'Режим', typeList: [types.STRING], isRequired: false }),
            ],
            callback: (_named, value) => {
                const mode = String(value || _named?.mode || '').trim().toLowerCase();
                if (!mode) return 'Доступно: ' + MODES.map((m) => m.id).join(', ');
                applyMode(mode);
                return `Режим: ${mode}`;
            },
        }));
    } catch (e) {
        console.warn('[dnm] slash command failed', e);
    }
}

function boot() {
    buildPanel();
    applyMode(savedMode(), false);
    registerCommand();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 1200));
} else {
    setTimeout(boot, 1200);
}

// на случай перерисовки настроек
try {
    const c = ctx();
    if (c?.eventSource && c?.event_types?.APP_READY) {
        c.eventSource.on(c.event_types.APP_READY, () => setTimeout(boot, 300));
    }
} catch { /* ignore */ }
