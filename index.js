/*
 * Devil's Night Modes — книжные режимы темы.
 * Управление в меню расширений. Языки: RU / EN / UK.
 * Команды: /dn corrupt | hideaway | killswitch | punk57 | conclave | nightfall | off
 */

const VERSION = '1.3.3';

const I18N = {
    ru: {
        title: "✦ DEVIL'S NIGHT MODES ✦",
        enable: 'Включить тему',
        language: 'Язык',
        off: 'Выключить',
        offHint: 'вернуть базовое оформление',
        made: "Сделано с любовью · ✦ Selena's Tavern ✦",
        hint: {
            corrupt: "школьный спортзал, красная маска, кровь",
            hideaway: 'отель «Понтифик», лифт 12, ключ',
            killswitch: 'лабиринт, фонтан, маска',
            punk57: 'коридор, шкафчики, пятна краски',
            conclave: 'яхта, луна, шампанское',
            nightfall: 'маяк, шторм, карусель',
        },
    },
    en: {
        title: "✦ DEVIL'S NIGHT MODES ✦",
        enable: 'Enable theme',
        language: 'Language',
        off: 'Turn off',
        offHint: 'restore default look',
        made: "Made with love · ✦ Selena's Tavern ✦",
        hint: {
            corrupt: 'school gym, red mask, blood',
            hideaway: 'the Pope Hotel, floor 12, a key',
            killswitch: 'hedge maze, fountain, mask',
            punk57: 'hallway, lockers, paint splats',
            conclave: 'yacht, moon, champagne',
            nightfall: 'lighthouse, storm, carousel',
        },
    },
    uk: {
        title: "✦ DEVIL'S NIGHT MODES ✦",
        enable: 'Увімкнути тему',
        language: 'Мова',
        off: 'Вимкнути',
        offHint: 'повернути базове оформлення',
        made: "Зроблено з любов'ю · ✦ Selena's Tavern ✦",
        hint: {
            corrupt: 'шкільний спортзал, червона маска, кров',
            hideaway: 'готель «Понтифік», ліфт 12, ключ',
            killswitch: 'лабіринт, фонтан, маска',
            punk57: 'коридор, шафки, плями фарби',
            conclave: 'яхта, місяць, шампанське',
            nightfall: 'маяк, шторм, карусель',
        },
    },
    sv: {
        title: "✦ DEVIL'S NIGHT MODES ✦",
        enable: 'Aktivera temat',
        language: 'Språk',
        off: 'Stäng av',
        offHint: 'återställ standardutseende',
        made: "Gjord med kärlek · ✦ Selena's Tavern ✦",
        hint: {
            corrupt: 'skolans gymnastiksal, röd mask, blod',
            hideaway: 'hotellet The Pope, våning 12, nyckel',
            killswitch: 'häcklabyrint, fontän, mask',
            punk57: 'korridor, skåp, färgstänk',
            conclave: 'yacht, måne, champagne',
            nightfall: 'fyr, storm, karusell',
        },
    },
};

const MODES = [    { id: 'corrupt',    label: 'Corrupt' },
    { id: 'hideaway',   label: 'Hideaway' },
    { id: 'killswitch', label: 'Kill Switch' },
    { id: 'punk57',     label: 'Punk 57' },
    { id: 'conclave',   label: 'Conclave' },
    { id: 'nightfall',  label: 'Nightfall' },
];

const NS = 'devils_night_modes';
const ATTR = 'data-dn-mode';

function ctx() {
    return (typeof SillyTavern !== 'undefined' && SillyTavern.getContext) ? SillyTavern.getContext() : null;
}
function store() {
    const s = ctx()?.extensionSettings;
    if (!s) return null;
    if (!s[NS]) s[NS] = { mode: 'corrupt', enabled: true, lang: 'ru' };
    if (!s[NS].lang) s[NS].lang = 'ru';
    return s[NS];
}
function save() {
    const c = ctx();
    if (c && typeof c.saveSettingsDebounced === 'function') c.saveSettingsDebounced();
}
function state() {
    const s = store();
    const lang = I18N[s?.lang] ? s.lang : 'ru';
    return { mode: s?.mode ?? 'corrupt', enabled: s?.enabled !== false, lang };
}
function t() {
    return I18N[state().lang];
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
    if (pill) pill.textContent = enabled ? (found ? found.label : '—') : t().off;
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
    if (s) s.enabled = !!on;
    save();
    apply();
}
function setLang(lang) {
    const s = store();
    if (s) s.lang = I18N[lang] ? lang : 'ru';
    save();
    renderSettings(true);
    renderPillList();
    apply();
}

/* ---------- плавающая кнопка ---------- */
function renderPillList() {
    const list = document.querySelector('.dnm-list');
    if (!list) return;
    const L = t();
    list.innerHTML = '';
    for (const m of MODES) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'dnm-btn';
        b.dataset.mode = m.id;
        b.innerHTML = `<b>${m.label}</b><i>${L.hint[m.id]}</i>`;
        b.addEventListener('click', () => setMode(m.id));
        list.append(b);
    }
    const off = document.createElement('button');
    off.type = 'button';
    off.className = 'dnm-btn dnm-off';
    off.dataset.mode = 'off';
    off.innerHTML = `<b>${L.off}</b><i>${L.offHint}</i>`;
    off.addEventListener('click', () => setMode('off'));
    list.append(off);
}

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

    head.addEventListener('click', () => wrap.classList.toggle('dnm-open'));
    wrap.append(head, list);
    document.body.append(wrap);
    renderPillList();
}

/* ---------- меню расширений ---------- */
function renderSettings(force = false) {
    const host = document.getElementById('extensions_settings');
    if (!host) return;

    let wrap = document.getElementById('dnm-settings');
    if (wrap && !force) return;
    if (wrap) wrap.remove();

    const L = t();
    const { mode, enabled, lang } = state();

    wrap = document.createElement('div');
    wrap.className = 'dnm-settings';
    wrap.id = 'dnm-settings';

    const rows = MODES.map((m) => `
        <label class="dnm-mode-row">
            <input type="radio" name="dnm-mode" value="${m.id}" ${m.id === mode ? 'checked' : ''}>
            <span><b>${m.label}</b><i>${L.hint[m.id]}</i></span>
        </label>`).join('');

    wrap.innerHTML = `
        <div class="inline-drawer">
            <div class="inline-drawer-toggle inline-drawer-header">
                <b>${L.title}</b>
                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
            </div>
            <div class="inline-drawer-content">
                <label class="checkbox_label dnm-toggle-row">
                    <input id="dnm-enabled" type="checkbox" ${enabled ? 'checked' : ''}>
                    <span>${L.enable}</span>
                </label>
                <label class="dnm-lang-row">
                    <span>${L.language}</span>
                    <select id="dnm-lang">
                        <option value="ru" ${lang === 'ru' ? 'selected' : ''}>Русский</option>
                        <option value="en" ${lang === 'en' ? 'selected' : ''}>English</option>
                        <option value="uk" ${lang === 'uk' ? 'selected' : ''}>Українська</option>
                        <option value="sv" ${lang === 'sv' ? 'selected' : ''}>Svenska</option>
                    </select>
                </label>
                <div class="dnm-modes">${rows}</div>
                <div class="dnm-footer">
                    <small>v${VERSION}</small>
                    <small>${L.made}</small>
                </div>
            </div>
        </div>`;

    host.append(wrap);

    wrap.querySelector('#dnm-enabled').addEventListener('change', (e) => setEnabled(e.target.checked));
    wrap.querySelector('#dnm-lang').addEventListener('change', (e) => setLang(e.target.value));
    wrap.querySelectorAll('input[name="dnm-mode"]').forEach((r) => {
        r.addEventListener('change', () => { if (r.checked) setMode(r.value); });
    });
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
            unnamedArgumentList: [arg.fromProps({
                description: 'corrupt|hideaway|killswitch|punk57|conclave|nightfall|off',
                typeList: [types.STRING],
                isRequired: false,
            })],
            callback: (_named, value) => {
                const v = String(value || '').trim().toLowerCase();
                if (!v) return 'Доступно: ' + MODES.map((m) => m.id).join(', ');
                if (I18N[v]) { setLang(v); return `Language: ${v}`; }
                setMode(v);
                return `Режим: ${v}`;
            },
        }));
    } catch (e) {
        console.warn('[dnm] slash command failed', e);
    }
}

/* ---------- пылинки ---------- */
function buildDust() {
    if (document.getElementById('dnm-dust')) return;
    const wrap = document.createElement('div');
    wrap.id = 'dnm-dust';
    for (let i = 0; i < 26; i++) {
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
