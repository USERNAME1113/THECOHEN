/* DeKuki Enhanced Tools Layer - added by Manus, 2026-05-29.
   This file intentionally avoids touching the original obfuscated bundle. */
(function () {
    'use strict';

    function byId(id) { return document.getElementById(id); }

    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
        });
    }

    function evalAE(fnName, args, callback) {
        args = args || [];
        var code = fnName + '(' + args.map(function (a) { return JSON.stringify(a); }).join(',') + ')';
        try {
            if (window.__adobe_cep__ && typeof window.__adobe_cep__.evalScript === 'function') {
                window.__adobe_cep__.evalScript(code, function (res) {
                    if (callback) callback(String(res == null ? '' : res));
                });
                return;
            }
            if (window.csInterface && typeof window.csInterface.evalScript === 'function') {
                window.csInterface.evalScript(code, function (res) {
                    if (callback) callback(String(res == null ? '' : res));
                });
                return;
            }
            if (window.CSInterface) {
                var cs = new window.CSInterface();
                cs.evalScript(code, function (res) {
                    if (callback) callback(String(res == null ? '' : res));
                });
                return;
            }
            if (callback) callback('ERROR:CEP bridge is not available. Open this panel inside After Effects.');
        } catch (e) {
            if (callback) callback('ERROR:' + e.message);
        }
    }

    function setStatus(text, isError) {
        var el = byId('dekukiToolsStatus');
        if (!el) return;
        el.className = 'dekuki-tools-status' + (isError ? ' error' : '');
        el.textContent = text;
    }

    function showOutput(text) {
        var out = byId('dekukiToolsOutput');
        if (out) out.value = text || '';
        if (text && text.indexOf('ERROR:') === 0) setStatus(text, true);
    }

    function run(fn, args, label) {
        setStatus((label || fn) + ' ...', false);
        evalAE(fn, args || [], function (res) {
            showOutput(res);
            setStatus(res.indexOf('ERROR:') === 0 ? res : 'Done: ' + (label || fn), res.indexOf('ERROR:') === 0);
        });
    }

    function injectCSS() {
        var css = '' +
        '.dekuki-tools-tab{padding:8px 0 16px;direction:ltr;}' +
        '.dekuki-tools-card{background:rgba(255,255,255,.045);border:1px solid rgba(180,140,0,.22);border-radius:9px;padding:10px;margin-bottom:8px;box-shadow:0 1px 10px rgba(0,0,0,.22);}' +
        '.dekuki-tools-title{font-size:11px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:#ffd700;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;}' +
        '.dekuki-tools-title small{font-size:8px;color:rgba(255,255,255,.35);font-weight:600;}' +
        '.dekuki-tools-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;}' +
        '.dekuki-tools-grid.three{grid-template-columns:repeat(3,minmax(0,1fr));}' +
        '.dekuki-tools-btn{min-height:30px;border:1px solid rgba(255,255,255,.10);border-radius:6px;background:rgba(255,255,255,.07);color:#ddd;font-family:Rubik,Arial,sans-serif;font-size:10px;font-weight:800;cursor:pointer;transition:all .15s ease;text-transform:uppercase;letter-spacing:.03em;}' +
        '.dekuki-tools-btn:hover{background:rgba(180,140,0,.20);border-color:rgba(255,210,0,.45);color:#fff;transform:translateY(-1px);}' +
        '.dekuki-tools-btn.danger:hover{background:rgba(160,120,0,.35);}' +
        '.dekuki-tools-row{display:flex;gap:6px;align-items:center;margin-top:7px;}' +
        '.dekuki-tools-row label{font-size:10px;color:rgba(255,255,255,.48);min-width:62px;}' +
        '.dekuki-tools-input{flex:1;min-width:0;background:rgba(0,0,0,.38);border:1px solid rgba(255,255,255,.10);border-radius:5px;color:#fff;padding:6px 7px;font-size:10px;outline:none;}' +
        '.dekuki-tools-input:focus{border-color:#f5c200;}' +
        '.dekuki-tools-output{width:100%;height:115px;resize:vertical;background:rgba(0,0,0,.45);border:1px solid rgba(255,255,255,.10);border-radius:7px;color:#ddd;padding:8px;font-family:Consolas,monospace;font-size:10px;line-height:1.45;outline:none;}' +
        '.dekuki-tools-status{font-size:10px;color:rgba(255,255,255,.50);padding:5px 2px;min-height:20px;}' +
        '.dekuki-tools-status.error{color:#ff7777;}' +
        '.dekuki-tools-note{font-size:9px;line-height:1.45;color:rgba(255,255,255,.38);margin-top:6px;}' +
        '.dekuki-tools-copy{margin-left:auto;max-width:100px;}' +
        '@media(max-width:450px){.dekuki-tools-grid.three{grid-template-columns:repeat(2,minmax(0,1fr));}}';
        var style = document.createElement('style');
        style.id = 'dekukiEnhancedStyle';
        style.appendChild(document.createTextNode(css));
        document.head.appendChild(style);
    }

    function injectUI() {
        if (byId('dekukiToolsTab')) return;
        injectCSS();
        var nav = document.querySelector('.tab-navigation');
        var after = byId('animateTab') || byId('stylesTab') || byId('createTab');
        if (!nav || !after) return;

        var btn = document.createElement('button');
        btn.className = 'tab-btn';
        btn.setAttribute('data-tab', 'tools');
        btn.textContent = 'Tools+';
        nav.appendChild(btn);

        var panel = document.createElement('div');
        panel.id = 'dekukiToolsTab';
        panel.className = 'tab-content dekuki-tools-tab';
        panel.innerHTML = '' +
            '<div class="dekuki-tools-card">' +
                '<div class="dekuki-tools-title">Project Check <small>diagnostics</small></div>' +
                '<div class="dekuki-tools-grid">' +
                    '<button class="dekuki-tools-btn" data-dekuki-run="dekukiDiagnostics">Check Comp</button>' +
                    '<button class="dekuki-tools-btn" data-dekuki-run="dekukiSelectAllTextLayers">Select Text</button>' +
                    '<button class="dekuki-tools-btn danger" data-dekuki-run="dekukiDeleteEmptyTextLayers">Delete Empty</button>' +
                    '<button class="dekuki-tools-btn" data-dekuki-run="dekukiNormalizeTextLayers">Normalize Text</button>' +
                '</div>' +
                '<div class="dekuki-tools-note">Works on selected text layers. If nothing is selected, some tools use all text layers in the active composition.</div>' +
            '</div>' +
            '<div class="dekuki-tools-card">' +
                '<div class="dekuki-tools-title">Text Cleanup <small>subtitles</small></div>' +
                '<div class="dekuki-tools-grid three">' +
                    '<button class="dekuki-tools-btn" data-dekuki-case="upper">UPPER</button>' +
                    '<button class="dekuki-tools-btn" data-dekuki-case="lower">lower</button>' +
                    '<button class="dekuki-tools-btn" data-dekuki-case="title">Title</button>' +
                    '<button class="dekuki-tools-btn" data-dekuki-run="dekukiRemovePunctuation">No Punct.</button>' +
                    '<button class="dekuki-tools-btn" data-dekuki-align="bottom">Bottom</button>' +
                    '<button class="dekuki-tools-btn" data-dekuki-align="center">Center</button>' +
                '</div>' +
            '</div>' +
            '<div class="dekuki-tools-card">' +
                '<div class="dekuki-tools-title">Timing <small>layers</small></div>' +
                '<div class="dekuki-tools-row"><label>Shift sec</label><input id="dekukiShiftSeconds" class="dekuki-tools-input" type="number" step="0.05" value="0.10"><button id="dekukiShiftBtn" class="dekuki-tools-btn">Shift</button></div>' +
                '<div class="dekuki-tools-row"><label>Gap sec</label><input id="dekukiGapSeconds" class="dekuki-tools-input" type="number" step="0.01" value="0.03"><button id="dekukiDistributeBtn" class="dekuki-tools-btn">Sequence</button></div>' +
            '</div>' +
            '<div class="dekuki-tools-card">' +
                '<div class="dekuki-tools-title">Quick Style <small>selected text</small></div>' +
                '<div class="dekuki-tools-row"><label>Size</label><input id="dekukiStyleSize" class="dekuki-tools-input" type="number" min="6" max="400" value="72"><label>Color</label><input id="dekukiStyleColor" class="dekuki-tools-input" type="color" value="#ffffff"></div>' +
                '<div class="dekuki-tools-row"><label>Stroke</label><input id="dekukiStrokeColor" class="dekuki-tools-input" type="color" value="#000000"><input id="dekukiStrokeWidth" class="dekuki-tools-input" type="number" min="0" max="50" step="0.5" value="4"><button id="dekukiStyleBtn" class="dekuki-tools-btn">Apply</button></div>' +
            '</div>' +
            '<div class="dekuki-tools-card">' +
                '<div class="dekuki-tools-title">SRT Export <small>selected/all text</small></div>' +
                '<div class="dekuki-tools-grid"><button id="dekukiExportSrtEnhanced" class="dekuki-tools-btn">Build SRT</button><button id="dekukiCopyOutput" class="dekuki-tools-btn dekuki-tools-copy">Copy</button></div>' +
                '<div id="dekukiToolsStatus" class="dekuki-tools-status">Ready.</div>' +
                '<textarea id="dekukiToolsOutput" class="dekuki-tools-output" spellcheck="false" placeholder="Output, diagnostics, or SRT will appear here."></textarea>' +
            '</div>';
        after.parentNode.insertBefore(panel, after.nextSibling);

        function activateTools(e) {
            if (e) { e.preventDefault(); e.stopPropagation(); }
            var buttons = document.querySelectorAll('.tab-btn');
            var contents = document.querySelectorAll('.tab-content');
            for (var i = 0; i < buttons.length; i++) buttons[i].classList.remove('active');
            for (var j = 0; j < contents.length; j++) contents[j].classList.remove('active');
            btn.classList.add('active');
            panel.classList.add('active');
        }
        btn.addEventListener('click', activateTools, true);
        var existing = document.querySelectorAll('.tab-btn:not([data-tab="tools"])');
        for (var i = 0; i < existing.length; i++) {
            existing[i].addEventListener('click', function () { panel.classList.remove('active'); btn.classList.remove('active'); }, true);
        }

        panel.addEventListener('click', function (e) {
            var t = e.target;
            if (!t) return;
            var runName = t.getAttribute('data-dekuki-run');
            if (runName) run(runName, [], t.textContent);
            var mode = t.getAttribute('data-dekuki-case');
            if (mode) run('dekukiSetTextCase', [mode], 'Case ' + mode);
            var align = t.getAttribute('data-dekuki-align');
            if (align) run('dekukiAlignText', [align], 'Align ' + align);
        });

        byId('dekukiShiftBtn').addEventListener('click', function () {
            run('dekukiShiftSelectedLayers', [byId('dekukiShiftSeconds').value], 'Shift layers');
        });
        byId('dekukiDistributeBtn').addEventListener('click', function () {
            run('dekukiDistributeSelectedLayers', [byId('dekukiGapSeconds').value], 'Sequence layers');
        });
        byId('dekukiStyleBtn').addEventListener('click', function () {
            var style = {
                fontSize: byId('dekukiStyleSize').value,
                fillColor: byId('dekukiStyleColor').value,
                strokeColor: byId('dekukiStrokeColor').value,
                strokeWidth: byId('dekukiStrokeWidth').value
            };
            run('dekukiApplySubtitleStyle', [JSON.stringify(style)], 'Apply style');
        });
        byId('dekukiExportSrtEnhanced').addEventListener('click', function () {
            run('dekukiExportSelectedTextAsSRT', [], 'Build SRT');
        });
        byId('dekukiCopyOutput').addEventListener('click', function () {
            var out = byId('dekukiToolsOutput');
            if (!out) return;
            out.focus(); out.select();
            try { document.execCommand('copy'); setStatus('Copied output to clipboard.', false); }
            catch (e) { setStatus('Copy failed: ' + e.message, true); }
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injectUI);
    else injectUI();
})();


/* DeKuki Enhanced v4.1.2 - additional productivity UI */
(function () {
    'use strict';

    function byId(id) { return document.getElementById(id); }
    function val(id) { var el = byId(id); return el ? el.value : ''; }
    function checked(id) { var el = byId(id); return !!(el && el.checked); }

    function evalAE(fnName, args, callback) {
        args = args || [];
        var code = fnName + '(' + args.map(function (a) { return JSON.stringify(a); }).join(',') + ')';
        try {
            if (window.__adobe_cep__ && typeof window.__adobe_cep__.evalScript === 'function') {
                window.__adobe_cep__.evalScript(code, function (res) { if (callback) callback(String(res == null ? '' : res)); });
                return;
            }
            if (window.CSInterface) {
                var cs = new window.CSInterface();
                cs.evalScript(code, function (res) { if (callback) callback(String(res == null ? '' : res)); });
                return;
            }
            if (callback) callback('ERROR:CEP bridge is not available.');
        } catch (e) {
            if (callback) callback('ERROR:' + e.message);
        }
    }

    function setStatus(text, isError) {
        var el = byId('dekukiToolsStatus');
        if (!el) return;
        el.className = 'dekuki-tools-status' + (isError ? ' error' : '');
        el.textContent = text;
    }

    function showOutput(text) {
        var out = byId('dekukiToolsOutput');
        if (out) out.value = text || '';
    }

    function run(fnName, args, label) {
        setStatus((label || fnName) + ' ...', false);
        evalAE(fnName, args || [], function (res) {
            showOutput(res);
            setStatus(res.indexOf('ERROR:') === 0 ? res : 'Done: ' + (label || fnName), res.indexOf('ERROR:') === 0);
        });
    }

    function injectMoreTools() {
        var panel = byId('dekukiToolsTab');
        if (!panel || byId('dekukiMoreToolsCard')) return false;
        var firstSrtCard = byId('dekukiExportSrtEnhanced');
        var anchor = firstSrtCard;
        while (anchor && (!anchor.className || String(anchor.className).indexOf('dekuki-tools-card') === -1)) anchor = anchor.parentNode;

        var wrap = document.createElement('div');
        wrap.id = 'dekukiMoreToolsCard';
        wrap.innerHTML = '' +
            '<div class="dekuki-tools-card">' +
                '<div class="dekuki-tools-title">Advanced Text <small>batch edit</small></div>' +
                '<div class="dekuki-tools-row"><label>Find</label><input id="dekukiFindText" class="dekuki-tools-input" type="text" placeholder="word / phrase"></div>' +
                '<div class="dekuki-tools-row"><label>Replace</label><input id="dekukiReplaceText" class="dekuki-tools-input" type="text" placeholder="replacement"><button id="dekukiFindReplaceBtn" class="dekuki-tools-btn">Replace</button></div>' +
                '<div class="dekuki-tools-row"><label>Options</label><label style="min-width:0;display:flex;gap:5px;align-items:center;font-size:10px;color:rgba(255,255,255,.45)"><input id="dekukiCaseSensitive" type="checkbox"> Case sensitive</label></div>' +
                '<div class="dekuki-tools-row"><label>Prefix</label><input id="dekukiPrefixText" class="dekuki-tools-input" type="text" placeholder="before"></div>' +
                '<div class="dekuki-tools-row"><label>Suffix</label><input id="dekukiSuffixText" class="dekuki-tools-input" type="text" placeholder="after"><button id="dekukiPrefixSuffixBtn" class="dekuki-tools-btn">Apply</button></div>' +
            '</div>' +
            '<div class="dekuki-tools-card">' +
                '<div class="dekuki-tools-title">Layer Power <small>subtitle structure</small></div>' +
                '<div class="dekuki-tools-grid three">' +
                    '<button class="dekuki-tools-btn" data-more-run="dekukiSplitSelectedTextByLines">Split Lines</button>' +
                    '<button class="dekuki-tools-btn" data-more-run="dekukiMergeSelectedTextLayers">Merge</button>' +
                    '<button class="dekuki-tools-btn" data-more-run="dekukiRenameTextLayers">Rename</button>' +
                    '<button class="dekuki-tools-btn" data-more-run="dekukiCreateMarkersFromTextLayers">Markers</button>' +
                    '<button class="dekuki-tools-btn" data-more-run="dekukiSnapSelectedLayersToFrames">Snap Frames</button>' +
                    '<button class="dekuki-tools-btn" data-more-run="dekukiTrimSelectedToWorkArea">Trim Work</button>' +
                '</div>' +
                '<div class="dekuki-tools-row"><label>Duration</label><input id="dekukiEqualDuration" class="dekuki-tools-input" type="number" step="0.05" value="1.20"><button id="dekukiEqualDurationBtn" class="dekuki-tools-btn">Equalize</button></div>' +
                '<div class="dekuki-tools-grid" style="margin-top:7px"><button class="dekuki-tools-btn" data-more-run="dekukiCreateSafeAreaGuides">Safe Guides</button><button class="dekuki-tools-btn" data-more-run="dekukiExportTextLayersCSV">Export CSV</button></div>' +
                '<div class="dekuki-tools-note">Split Lines turns one multi-line text layer into timed subtitle layers. Merge does the opposite for selected text layers.</div>' +
            '</div>';

        if (anchor) panel.insertBefore(wrap, anchor);
        else panel.appendChild(wrap);

        wrap.addEventListener('click', function (e) {
            var t = e.target;
            if (!t) return;
            var fn = t.getAttribute('data-more-run');
            if (fn) run(fn, [], t.textContent);
        });
        byId('dekukiFindReplaceBtn').addEventListener('click', function () {
            run('dekukiFindReplace', [val('dekukiFindText'), val('dekukiReplaceText'), checked('dekukiCaseSensitive')], 'Find/replace');
        });
        byId('dekukiPrefixSuffixBtn').addEventListener('click', function () {
            run('dekukiAddPrefixSuffix', [val('dekukiPrefixText'), val('dekukiSuffixText')], 'Prefix/suffix');
        });
        byId('dekukiEqualDurationBtn').addEventListener('click', function () {
            run('dekukiEqualizeSelectedDuration', [val('dekukiEqualDuration')], 'Equalize duration');
        });
        setStatus('Tools+ upgraded to v4.1.2.', false);
        return true;
    }

    function boot() {
        if (injectMoreTools()) return;
        var tries = 0;
        var timer = setInterval(function () {
            tries++;
            if (injectMoreTools() || tries > 80) clearInterval(timer);
        }, 100);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
})();


/* DeKuki Enhanced v4.1.5 - clean visible commercial wording only */
(function () {
    'use strict';
    var CREDIT_TEXT = 'BY ZENO & YALI';
    var COMMERCIAL_NODE = /(purchase|buy|price|pricing|paid|payment|money|license|licence|licensed|subscription|subscribe|trial|demo|limit\s*:\s*\d+|per\s*day|aesc?ripts\.com|רכישה|לקנות|תשלום|כסף|רישוי|רישיון|רשיון|גרסת\s*ניסיון|גרסת\s*נסיון|מצב\s*ניסיון|מצב\s*נסיון|מגבלה|ליום)/i;
    var PHRASES = [
        /purchase\s+a\s+license\s+at\s+aesc?ripts\.com/gi,
        /limit\s*:\s*\d+\s*per\s*day/gi,
        /trial\s*version/gi,
        /free\s*trial/gi,
        /trial\s*mode/gi,
        /demo\s*version/gi,
        /\blicense(?:d)?\b/gi,
        /\bsubscription\b/gi,
        /\bpurchase\b/gi,
        /\bpayment\b/gi,
        /\bpricing\b/gi,
        /\bprice\b/gi,
        /\bmoney\b/gi,
        /גרסת\s*ניסיון/g,
        /גרסת\s*נסיון/g,
        /מצב\s*ניסיון/g,
        /מצב\s*נסיון/g,
        /רישוי|רישיון|רשיון|רכישה|לקנות|תשלום|כסף|מגבלה|ליום/g,
        /\btrial\b/gi
    ];

    function shouldSkipNode(node) {
        if (!node || !node.parentNode) return true;
        var tag = (node.parentNode.tagName || '').toLowerCase();
        return tag === 'script' || tag === 'style' || tag === 'textarea' || tag === 'input';
    }

    function replaceTextValue(value) {
        var before = String(value == null ? '' : value);
        if (!COMMERCIAL_NODE.test(before)) return before;
        var compact = before.replace(/\s+/g, ' ').trim();
        if (compact.length <= 180 || /purchase|license|trial|limit|per\s*day|aesc?ripts\.com/i.test(compact)) return CREDIT_TEXT;
        var next = before;
        for (var i = 0; i < PHRASES.length; i++) next = next.replace(PHRASES[i], CREDIT_TEXT);
        next = next.replace(new RegExp('(?:\\s*' + CREDIT_TEXT.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*){2,}', 'g'), ' ' + CREDIT_TEXT + ' ');
        return next;
    }

    function replaceTextNode(node) {
        if (shouldSkipNode(node)) return;
        var before = node.nodeValue || '';
        var after = replaceTextValue(before);
        if (after !== before) node.nodeValue = after;
    }

    function cleanAttributes(el) {
        if (!el || el.nodeType !== 1) return;
        var attrs = ['title', 'aria-label', 'data-tooltip'];
        for (var i = 0; i < attrs.length; i++) {
            var a = attrs[i];
            var v = el.getAttribute(a);
            if (v && COMMERCIAL_NODE.test(v)) el.setAttribute(a, CREDIT_TEXT);
        }
    }

    function walk(root) {
        if (!root) return;
        if (root.nodeType === 3) {
            replaceTextNode(root);
            return;
        }
        if (root.nodeType !== 1 && root.nodeType !== 9 && root.nodeType !== 11) return;
        if (root.nodeType === 1) cleanAttributes(root);
        var textWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
            acceptNode: function (node) {
                return shouldSkipNode(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
            }
        });
        var nodes = [];
        while (textWalker.nextNode()) nodes.push(textWalker.currentNode);
        for (var i = 0; i < nodes.length; i++) replaceTextNode(nodes[i]);
        var els = root.querySelectorAll ? root.querySelectorAll('[title],[aria-label],[data-tooltip]') : [];
        for (var j = 0; j < els.length; j++) cleanAttributes(els[j]);
    }

    function bootBranding() {
        walk(document.body || document.documentElement);
        try {
            var observer = new MutationObserver(function (mutations) {
                for (var i = 0; i < mutations.length; i++) {
                    var m = mutations[i];
                    if (m.type === 'characterData') replaceTextNode(m.target);
                    if (m.type === 'attributes') cleanAttributes(m.target);
                    if (m.addedNodes) {
                        for (var j = 0; j < m.addedNodes.length; j++) walk(m.addedNodes[j]);
                    }
                }
            });
            observer.observe(document.body || document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['title', 'aria-label', 'data-tooltip'] });
        } catch (e) {}
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootBranding);
    else bootBranding();
})();


/* DeKuki Enhanced v4.1.5 - auto silence cuts and surprise timeline tools */
(function () {
    'use strict';

    var lastSilences = [];
    function byId(id) { return document.getElementById(id); }
    function val(id) { var el = byId(id); return el ? el.value : ''; }

    function setStatus(text, isError) {
        var el = byId('dekukiToolsStatus');
        if (!el) return;
        el.className = 'dekuki-tools-status' + (isError ? ' error' : '');
        el.textContent = text;
    }
    function showOutput(text) {
        var out = byId('dekukiToolsOutput');
        if (out) out.value = text || '';
    }
    function evalAE(fnName, args, callback) {
        args = args || [];
        var code = fnName + '(' + args.map(function (a) { return JSON.stringify(a); }).join(',') + ')';
        try {
            if (window.__adobe_cep__ && typeof window.__adobe_cep__.evalScript === 'function') {
                window.__adobe_cep__.evalScript(code, function (res) { if (callback) callback(String(res == null ? '' : res)); });
                return;
            }
            if (window.CSInterface) {
                var cs = new window.CSInterface();
                cs.evalScript(code, function (res) { if (callback) callback(String(res == null ? '' : res)); });
                return;
            }
            if (callback) callback('ERROR:CEP bridge is not available.');
        } catch (e) { if (callback) callback('ERROR:' + e.message); }
    }
    function runAE(fnName, args, label) {
        setStatus((label || fnName) + ' ...', false);
        evalAE(fnName, args || [], function (res) {
            showOutput(res);
            setStatus(res.indexOf('ERROR:') === 0 ? res : 'Done: ' + (label || fnName), res.indexOf('ERROR:') === 0);
        });
    }
    function cepRequire(name) {
        try { if (typeof window.require === 'function') return window.require(name); } catch (e) {}
        try { if (typeof require === 'function') return require(name); } catch (e2) {}
        return null;
    }
    function extensionRoot() {
        var p = decodeURI(String(window.location.pathname || ''));
        if (/^\/[A-Za-z]:\//.test(p)) p = p.substring(1);
        return p.replace(/[\\\/][^\\\/]*$/, '');
    }
    function ffmpegPath() {
        var path = cepRequire('path');
        var processObj = cepRequire('process') || window.process;
        if (!path || !processObj) return '';
        var root = extensionRoot();
        var name = 'ffmpeg-win32-x64.exe';
        if (processObj.platform === 'darwin') name = processObj.arch === 'arm64' ? 'ffmpeg-darwin-arm64' : 'ffmpeg-darwin-x64';
        return path.join(root, 'bin', name);
    }
    function parseSilence(stderrText, totalDuration) {
        var lines = String(stderrText || '').split(/\r?\n/);
        var arr = [];
        var current = null;
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var m1 = /silence_start:\s*([0-9.]+)/.exec(line);
            if (m1) current = parseFloat(m1[1]);
            var m2 = /silence_end:\s*([0-9.]+)/.exec(line);
            if (m2 && current !== null) {
                var end = parseFloat(m2[1]);
                if (!isNaN(current) && !isNaN(end) && end > current) arr.push({ start: current, end: end });
                current = null;
            }
        }
        if (current !== null && totalDuration && totalDuration > current) arr.push({ start: current, end: totalDuration });
        return arr;
    }
    function formatSilences(arr) {
        if (!arr.length) return 'No silence ranges detected with the current settings.';
        var out = 'Detected silence ranges: ' + arr.length + '\n\n';
        for (var i = 0; i < arr.length; i++) {
            out += (i + 1) + '. ' + arr[i].start.toFixed(3) + 's  →  ' + arr[i].end.toFixed(3) + 's  (' + (arr[i].end - arr[i].start).toFixed(3) + 's)\n';
        }
        return out;
    }
    function detectSilence(callback) {
        setStatus('Reading selected audio layer ...', false);
        evalAE('dekukiGetSelectedAudioInfoEnhanced', [], function (infoRes) {
            if (infoRes.indexOf('ERROR:') === 0) { showOutput(infoRes); setStatus(infoRes, true); return; }
            var info;
            try { info = JSON.parse(infoRes); } catch (e) { showOutput('ERROR:Could not parse audio info: ' + infoRes); setStatus('Audio info parse failed', true); return; }
            var child = cepRequire('child_process');
            var fs = cepRequire('fs');
            if (!child || !fs) {
                var msg = 'ERROR:Node access is unavailable in this CEP panel, so automatic audio analysis cannot run here.';
                showOutput(msg + '\nTip: You can still use the manual Tools+ timeline utilities.');
                setStatus(msg, true);
                return;
            }
            var ff = ffmpegPath();
            if (!ff || !fs.existsSync(ff)) { showOutput('ERROR:ffmpeg binary was not found in the extension bin folder.'); setStatus('ffmpeg not found', true); return; }
            try { if (fs.chmodSync) fs.chmodSync(ff, 0o755); } catch (chmodErr) {}
            var noise = parseFloat(val('dekukiSilenceDb') || '-35');
            var dur = parseFloat(val('dekukiSilenceMin') || '0.25');
            if (isNaN(noise)) noise = -35;
            if (isNaN(dur) || dur < 0.05) dur = 0.25;
            setStatus('Analyzing silence with ffmpeg ...', false);
            var args = ['-hide_banner', '-nostats', '-i', info.fsName, '-af', 'silencedetect=noise=' + noise + 'dB:d=' + dur, '-f', 'null', '-'];
            child.execFile(ff, args, { maxBuffer: 1024 * 1024 * 12 }, function (err, stdout, stderr) {
                var silences = parseSilence(stderr, info.outPoint ? (info.outPoint - info.inPoint) : info.compDuration);
                lastSilences = silences;
                try { window.__dekukiLastSilences416 = silences; } catch (eStore) {}
                showOutput(formatSilences(silences));
                setStatus(silences.length ? ('Detected ' + silences.length + ' silence ranges.') : 'No silence detected. Try a higher threshold like -30 dB.', !silences.length);
                if (callback) callback(silences);
            });
        });
    }

    function injectSilenceTools() {
        var panel = byId('dekukiToolsTab');
        if (!panel || byId('dekukiSilenceToolsCard')) return false;
        var anchor = byId('dekukiMoreToolsCard') || byId('dekukiExportSrtEnhanced');
        while (anchor && (!anchor.className || String(anchor.className).indexOf('dekuki-tools-card') === -1) && anchor.id !== 'dekukiMoreToolsCard') anchor = anchor.parentNode;
        var wrap = document.createElement('div');
        wrap.id = 'dekukiSilenceToolsCard';
        wrap.innerHTML = '' +
            '<div class="dekuki-tools-card">' +
                '<div class="dekuki-tools-title">Auto Silence Cuts <small>jump cuts</small></div>' +
                '<div class="dekuki-tools-row"><label>Threshold</label><input id="dekukiSilenceDb" class="dekuki-tools-input" type="number" step="1" value="-35"><label>dB</label></div>' +
                '<div class="dekuki-tools-row"><label>Min silence</label><input id="dekukiSilenceMin" class="dekuki-tools-input" type="number" step="0.05" value="0.25"><label>sec</label></div>' +
                '<div class="dekuki-tools-row"><label>Padding</label><input id="dekukiSilencePad" class="dekuki-tools-input" type="number" step="0.01" value="0.04"><label>sec</label></div>' +
                '<div class="dekuki-tools-row"><label>Min keep</label><input id="dekukiMinKeep" class="dekuki-tools-input" type="number" step="0.05" value="0.12"><label>sec</label></div>' +
                '<div class="dekuki-tools-row"><label>Mode</label><select id="dekukiCutMode" class="dekuki-tools-input"><option value="packed">Packed jump cuts</option><option value="timed">Keep original timing</option></select></div>' +
                '<div class="dekuki-tools-grid three" style="margin-top:7px"><button id="dekukiDetectSilenceBtn" class="dekuki-tools-btn">Detect</button><button id="dekukiSilenceMarkersBtn" class="dekuki-tools-btn">Markers</button><button id="dekukiAutoCutsBtn" class="dekuki-tools-btn danger">Auto Cut</button></div>' +
                '<div class="dekuki-tools-note">Select the layers first. Smart Cut creates trimmed cut pieces from speech ranges, closes short breath gaps, and hides the original layer for Undo/recovery.</div>' +
            '</div>' +
            '<div class="dekuki-tools-card">' +
                '<div class="dekuki-tools-title">Surprise Tools <small>timeline helpers</small></div>' +
                '<div class="dekuki-tools-row"><label>Beat every</label><input id="dekukiBeatEvery" class="dekuki-tools-input" type="number" step="0.05" value="1.00"><button id="dekukiBeatMarkersBtn" class="dekuki-tools-btn">Beat Markers</button></div>' +
                '<div class="dekuki-tools-row"><label>Stack gap</label><input id="dekukiStackGap" class="dekuki-tools-input" type="number" step="5" value="90"><button id="dekukiStackBtn" class="dekuki-tools-btn">Vertical Stack</button></div>' +
            '</div>';
        if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(wrap, anchor);
        else panel.appendChild(wrap);
        byId('dekukiDetectSilenceBtn').addEventListener('click', function () { detectSilence(); });
        byId('dekukiSilenceMarkersBtn').addEventListener('click', function () {
            var use = function (arr) { runAE('dekukiCreateSilenceMarkersFromJSON', [JSON.stringify(arr), val('dekukiSilencePad')], 'Silence markers'); };
            if (lastSilences.length) use(lastSilences); else detectSilence(use);
        });
        byId('dekukiAutoCutsBtn').addEventListener('click', function () {
            var use = function (arr) {
                try { window.__dekukiLastSilences416 = arr; } catch (eStore) {}
                runAE('dekukiApplySilenceCutsSmartFromJSON', [JSON.stringify(arr), val('dekukiCutMode'), val('dekukiSilencePad'), val('dekukiMinKeep'), val('dekukiBreathMerge') || '0.18', val('dekukiLeadPad') || '0.03'], 'Smart auto cuts');
            };
            if (lastSilences.length) use(lastSilences); else detectSilence(use);
        });
        byId('dekukiBeatMarkersBtn').addEventListener('click', function () { runAE('dekukiAddBeatMarkers', [val('dekukiBeatEvery'), 'BEAT'], 'Beat markers'); });
        byId('dekukiStackBtn').addEventListener('click', function () { runAE('dekukiDuplicateSelectedToVerticalStack', [val('dekukiStackGap')], 'Vertical stack'); });
        setStatus('Tools+ upgraded to v4.1.6 with Smart Auto Cut.', false);
        return true;
    }

    function boot() {
        if (injectSilenceTools()) return;
        var tries = 0;
        var timer = setInterval(function () {
            tries++;
            if (injectSilenceTools() || tries > 100) clearInterval(timer);
        }, 120);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
})();


/* DeKuki Enhanced v4.1.6 - UI polish and smarter breath-aware auto cuts */
(function () {
    'use strict';
    var CREDIT_TEXT = 'BY ZENO & YALI';
    var MONEY_PATTERN = /(purchase|buy|price|pricing|paid|payment|money|license|licence|subscription|subscribe|trial|demo|limit\s*:\s*\d+|per\s*day|aesc?ripts\.com|רכישה|לקנות|תשלום|כסף|רישוי|רישיון|רשיון|גרסת\s*ניסיון|גרסת\s*נסיון|מצב\s*ניסיון|מצב\s*נסיון|מגבלה|ליום)/i;

    function id(x) { return document.getElementById(x); }
    function getVal(x) { var el = id(x); return el ? el.value : ''; }
    function setVal(x, v) { var el = id(x); if (el) el.value = v; }
    function injectCss() {
        if (id('dekuki416Style')) return;
        var s = document.createElement('style');
        s.id = 'dekuki416Style';
        s.textContent = '' +
            '.dekuki-clean-credit{display:block!important;text-align:center!important;background:transparent!important;border:0!important;box-shadow:none!important;color:#ffd700!important;font-size:9px!important;font-weight:700!important;letter-spacing:1.3px!important;padding:3px 0!important;margin:2px auto!important;min-height:0!important;height:auto!important;line-height:1.2!important}' +
            '.dekuki-clean-credit *{display:none!important}' +
            '.dekuki416-hint{font-size:10px;color:#b8b8b8;line-height:1.35;margin-top:6px}' +
            '.dekuki416-preset{border:1px solid rgba(255,210,0,.35);background:rgba(80,60,0,.22);color:#fff3a0;border-radius:6px;padding:5px 7px;font-size:10px;font-weight:700;cursor:pointer}';
        document.head.appendChild(s);
    }
    function normalizeCreditBars(root) {
        injectCss();
        root = root || document.body;
        if (!root || !root.querySelectorAll) return;
        var nodes = root.querySelectorAll('div,span,p,small,strong,button,a');
        for (var i = 0; i < nodes.length; i++) {
            var el = nodes[i];
            var txt = (el.textContent || '').replace(/\s+/g, ' ').trim();
            if (!txt) continue;
            var isCredit = txt === CREDIT_TEXT || txt === ('✕ ' + CREDIT_TEXT) || txt === ('× ' + CREDIT_TEXT);
            var isCommercial = MONEY_PATTERN.test(txt) && txt.length < 220;
            if ((isCredit || isCommercial) && el.children.length <= 6) {
                el.textContent = CREDIT_TEXT;
                el.classList.add('dekuki-clean-credit');
                try { el.removeAttribute('title'); el.removeAttribute('aria-label'); } catch (e) {}
            }
        }
    }
    function updateAutoCutUI() {
        var card = id('dekukiSilenceToolsCard');
        if (!card || id('dekukiBreathMerge')) return false;
        var mode = id('dekukiCutMode');
        if (mode) {
            mode.innerHTML = '<option value="packed">Real jump cut - close gaps</option><option value="timed">Cut pieces - keep timing</option><option value="markers">Markers only</option>';
        }
        var min = id('dekukiSilenceMin');
        var db = id('dekukiSilenceDb');
        var pad = id('dekukiSilencePad');
        var keep = id('dekukiMinKeep');
        if (min && min.value === '0.25') min.value = '0.12';
        if (db && db.value === '-35') db.value = '-30';
        if (pad && pad.value === '0.04') pad.value = '0.02';
        if (keep && keep.value === '0.12') keep.value = '0.08';
        var controls = document.createElement('div');
        controls.innerHTML = '' +
            '<div class="dekuki-tools-row"><label>Breath close</label><input id="dekukiBreathMerge" class="dekuki-tools-input" type="number" step="0.02" value="0.18"><label>sec</label></div>' +
            '<div class="dekuki-tools-row"><label>Lead/Tail</label><input id="dekukiLeadPad" class="dekuki-tools-input" type="number" step="0.01" value="0.03"><label>sec keep</label></div>' +
            '<div class="dekuki-tools-grid three" style="margin-top:6px"><button id="dekukiPresetNormal" class="dekuki416-preset">Normal</button><button id="dekukiPresetBreath" class="dekuki416-preset">Breaths</button><button id="dekukiPresetAggressive" class="dekuki416-preset">Fast Cuts</button></div>' +
            '<div class="dekuki416-hint">Auto Cut עכשיו בונה מקטעים אמיתיים מהחלקים שבהם מדברים, סוגר נשימות קצרות, מכבה את המקור לשחזור, ומסדר את הקאטים קדימה במצב Jump Cut.</div>';
        var btnRow = id('dekukiDetectSilenceBtn');
        while (btnRow && (!btnRow.className || String(btnRow.className).indexOf('dekuki-tools-grid') === -1)) btnRow = btnRow.parentNode;
        if (btnRow && btnRow.parentNode) btnRow.parentNode.insertBefore(controls, btnRow);
        function preset(dbv, minv, padv, keepv, mergev, leadv) {
            setVal('dekukiSilenceDb', dbv); setVal('dekukiSilenceMin', minv); setVal('dekukiSilencePad', padv); setVal('dekukiMinKeep', keepv); setVal('dekukiBreathMerge', mergev); setVal('dekukiLeadPad', leadv);
        }
        id('dekukiPresetNormal').addEventListener('click', function () { preset('-32', '0.16', '0.02', '0.10', '0.14', '0.03'); });
        id('dekukiPresetBreath').addEventListener('click', function () { preset('-28', '0.08', '0.01', '0.06', '0.24', '0.02'); });
        id('dekukiPresetAggressive').addEventListener('click', function () { preset('-26', '0.06', '0.00', '0.05', '0.32', '0.01'); });
        var autoBtn = id('dekukiAutoCutsBtn');
        if (autoBtn && !autoBtn.getAttribute('data-dekuki416')) {
            autoBtn.textContent = 'Smart Cut';
            autoBtn.setAttribute('data-dekuki416', '1');
        }
        return true;
    }
    function rememberDetectOutput() {
        var out = id('dekukiToolsOutput');
        if (!out || out.getAttribute('data-dekuki416-watch')) return;
        out.setAttribute('data-dekuki416-watch', '1');
        var obs = new MutationObserver(function () { parseOutput(); });
        obs.observe(out, { childList: true, characterData: true, subtree: true, attributes: true });
        out.addEventListener('input', parseOutput);
        function parseOutput() {
            var text = out.value || out.textContent || '';
            var arr = [];
            var re = /([0-9]+\.[0-9]+)s\s*→\s*([0-9]+\.[0-9]+)s/g;
            var m;
            while ((m = re.exec(text))) arr.push({ start: parseFloat(m[1]), end: parseFloat(m[2]) });
            if (arr.length) window.__dekukiLastSilences416 = arr;
        }
    }
    function boot416() {
        normalizeCreditBars(document.body);
        rememberDetectOutput();
        updateAutoCutUI();
        try {
            new MutationObserver(function (mutations) {
                for (var i = 0; i < mutations.length; i++) if (mutations[i].addedNodes) for (var j = 0; j < mutations[i].addedNodes.length; j++) normalizeCreditBars(mutations[i].addedNodes[j]);
                updateAutoCutUI(); rememberDetectOutput();
            }).observe(document.body || document.documentElement, { childList: true, subtree: true, characterData: true });
        } catch (e) {}
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot416); else boot416();
})();


/* DeKuki Enhanced – Animate Tab UI controller */
(function () {
    'use strict';

    function byId(id) { return document.getElementById(id); }
    function val(id) { var el = byId(id); return el ? el.value : ''; }

    function evalAE(fn, args, cb) {
        args = args || [];
        var code = fn + '(' + args.map(function(a){ return JSON.stringify(a); }).join(',') + ')';
        try {
            if (window.__adobe_cep__ && typeof window.__adobe_cep__.evalScript === 'function') {
                window.__adobe_cep__.evalScript(code, function(r){ if (cb) cb(String(r == null ? '' : r)); }); return;
            }
            if (window.CSInterface) {
                var cs = new window.CSInterface();
                cs.evalScript(code, function(r){ if (cb) cb(String(r == null ? '' : r)); }); return;
            }
            if (cb) cb('ERROR:CEP bridge unavailable.');
        } catch(e) { if (cb) cb('ERROR:' + e.message); }
    }

    function setAnimStatus(msg, isErr) {
        var el = byId('dekukiToolsStatus');
        if (!el) return;
        el.className = 'dekuki-tools-status' + (isErr ? ' error' : '');
        el.textContent = msg;
    }

    // ── Preview animation ──────────────────────────────────────────────
    var previewTimer = null;

    function refreshPreview() {
        var previewText = byId('animPreviewText');
        if (!previewText) return;
        var type = val('animEntranceType');
        var cont = val('animContinuousType');

        // Remove previous classes
        previewText.className = 'anim-preview-text';

        // Continuous class
        var contMap = { pulse: 'p-pulse', float: 'p-float', wigglePos: 'p-wiggle wiggle-pos', none: '' };
        var contCls = contMap[cont] || '';

        // Apply animation by cloning the node (triggers CSS animation restart)
        var clone = previewText.cloneNode(true);
        var entMap = {
            fade: 'p-fade', slideUp: 'p-slideUp', slideDown: 'p-slideDown',
            slideLeft: 'p-slideLeft', scale: 'p-scaleUp', rotate: 'p-rotateIn',
            blur: 'p-blur', drop: 'p-dropIn', typewriter: 'p-typewriter', none: ''
        };
        var entCls = entMap[type] || '';
        clone.className = 'anim-preview-text' + (entCls ? ' ' + entCls : '') + (contCls ? ' ' + contCls : '');
        previewText.parentNode.replaceChild(clone, clone.parentNode.querySelector('.anim-preview-text') || previewText);

        // Also update preview label
        var lbl = byId('animPreviewLabel');
        if (lbl) lbl.textContent = (type === 'none' ? '' : type.toUpperCase());
    }

    // ── Hex ↔ color swatch sync ─────────────────────────────────────────
    function syncColor(swatchId, hexId) {
        var swatch = byId(swatchId);
        var hex    = byId(hexId);
        if (!swatch || !hex) return;
        swatch.addEventListener('input', function() {
            hex.value = swatch.value.replace('#', '').toUpperCase();
        });
        hex.addEventListener('input', function() {
            var v = hex.value.trim().replace('#','');
            if (/^[0-9a-fA-F]{6}$/.test(v)) swatch.value = '#' + v;
        });
    }

    // ── Boot when animateTab is visible ────────────────────────────────
    function bootAnimTab() {
        var tab = byId('animateTab');
        if (!tab || tab.getAttribute('data-anim-boot')) return;
        tab.setAttribute('data-anim-boot', '1');

        // Slider → label sync
        function sliderSync(sliderId, labelId, suffix) {
            var sl = byId(sliderId); var lb = byId(labelId);
            if (!sl || !lb) return;
            sl.addEventListener('input', function() {
                lb.textContent = parseFloat(sl.value).toFixed(sl.step && sl.step < 0.1 ? 2 : 1) + (suffix||'');
                refreshPreview();
            });
        }
        sliderSync('animEntranceDuration',  'animEntranceDurationVal',  's');
        sliderSync('animEntranceDelay',     'animEntranceDelayVal',     's');
        sliderSync('animContinuousSpeed',   'animContinuousSpeedVal',   's');

        // Select → preview refresh
        ['animEntranceType','animEntrancePer','animContinuousType'].forEach(function(id) {
            var el = byId(id);
            if (el) el.addEventListener('change', refreshPreview);
        });

        // Speed presets
        tab.querySelectorAll('.speed-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                tab.querySelectorAll('.speed-btn').forEach(function(b){ b.classList.remove('active'); });
                btn.classList.add('active');
                var dur = btn.getAttribute('data-dur');
                var dly = btn.getAttribute('data-delay');
                var durSl = byId('animEntranceDuration');
                var dlySl = byId('animEntranceDelay');
                if (durSl && dur) { durSl.value = dur; byId('animEntranceDurationVal').textContent = parseFloat(dur).toFixed(1) + 's'; }
                if (dlySl && dly) { dlySl.value = dly; byId('animEntranceDelayVal').textContent = parseFloat(dly).toFixed(2) + 's'; }
                refreshPreview();
            });
        });

        // Color preset dots
        tab.querySelectorAll('.ae-color-dot').forEach(function(dot) {
            dot.addEventListener('click', function() {
                var color   = dot.getAttribute('data-color') || '#ffffff';
                var section = dot.closest('.ws-color-section');
                if (!section) return;
                var sw  = section.querySelector('.ae-color-swatch');
                var hx  = section.querySelector('.ae-hex-input');
                if (sw) sw.value = color;
                if (hx) hx.value = color.replace('#','').toUpperCase();
            });
        });

        // Color swatch ↔ hex sync
        syncColor('animTextColor',   'animTextColorHex');
        syncColor('animStrokeColor', 'animStrokeColorHex');

        // ── Apply button ────────────────────────────────────────────────
        var applyBtn = byId('animApplyBtn');
        if (applyBtn) {
            applyBtn.addEventListener('click', function() {
                var cfg = {
                    entranceType: val('animEntranceType'),
                    per:          val('animEntrancePer'),
                    duration:     val('animEntranceDuration'),
                    delay:        val('animEntranceDelay'),
                    contType:     val('animContinuousType'),
                    contSpeed:    val('animContinuousSpeed'),
                    fillColor:    '#' + (val('animTextColorHex')   || 'ffffff'),
                    strokeColor:  '#' + (val('animStrokeColorHex') || '000000')
                };
                applyBtn.disabled = true;
                setAnimStatus('Applying animation...', false);
                evalAE('dekukiApplyTextAnimation', [JSON.stringify(cfg)], function(res) {
                    applyBtn.disabled = false;
                    setAnimStatus(res, res.indexOf('ERROR:') === 0);
                });
            });
        }

        // ── Clear button ────────────────────────────────────────────────
        var clearBtn = byId('animClearBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', function() {
                clearBtn.disabled = true;
                setAnimStatus('Clearing animations...', false);
                evalAE('dekukiClearTextAnimation', [], function(res) {
                    clearBtn.disabled = false;
                    setAnimStatus(res, res.indexOf('ERROR:') === 0);
                });
            });
        }

        // Init preview
        refreshPreview();
    }

    // Watch for the animate tab button click to trigger boot
    function watchAnimTab() {
        var tabBtn = document.querySelector('[data-tab="animate"]');
        if (!tabBtn || tabBtn.getAttribute('data-anim-watch')) return;
        tabBtn.setAttribute('data-anim-watch', '1');
        tabBtn.addEventListener('click', function() {
            setTimeout(bootAnimTab, 60);
        });
    }

    function boot() {
        watchAnimTab();
        // Also boot immediately if animate tab is already active
        if (byId('animateTab') && byId('animateTab').classList.contains('active')) bootAnimTab();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();

    // Retry in case tabs load late
    var tries = 0;
    var t = setInterval(function() { watchAnimTab(); if (++tries > 60) clearInterval(t); }, 200);
})();


/* DeKuki Enhanced v4.1.7 - UI fixes and improvements */
(function () {
    'use strict';
    
    function id(x) { return document.getElementById(x); }
    
    function fixAutoCutStatus() {
        // Fix Auto Cut / Smart Cut button feedback
        var autoBtn = id('dekukiAutoCutsBtn');
        if (!autoBtn || autoBtn.getAttribute('data-v417')) return false;
        
        autoBtn.setAttribute('data-v417', '1');
        autoBtn.textContent = 'Smart Cut';
        
        var originalClick = autoBtn.onclick;
        autoBtn.addEventListener('click', function() {
            var statusEl = id('dekukiToolsStatus');
            if (statusEl) {
                statusEl.textContent = 'Running Smart Cut... Please wait.';
                statusEl.className = 'dekuki-tools-status';
            }
        }, true);
        return true;
    }
    
    function addPresetLabels() {
        // Make presets more visible
        var style = document.getElementById('dekuki417Style');
        if (style) return;
        style = document.createElement('style');
        style.id = 'dekuki417Style';
        style.textContent = [
            '.dekuki416-preset:hover { background: rgba(180,140,0,.35) !important; border-color: rgba(255,210,0,.6) !important; transform: translateY(-1px); }',
            '.dekuki-tools-btn[data-v417]:hover { background: rgba(200,160,0,.35) !important; }',
            '#dekukiSilenceToolsCard .dekuki-tools-title { color: #ffdc50 !important; }',
            '.dekuki-tools-note { color: rgba(255,255,255,.5) !important; font-style: italic; }',
            '#dekukiAutoCutsBtn { background: linear-gradient(135deg, rgba(180,40,0,.4), rgba(180,140,0,.3)) !important; border-color: rgba(255,100,0,.4) !important; color: #ffdc50 !important; font-weight: 900 !important; }',
            '#dekukiAutoCutsBtn:hover { background: linear-gradient(135deg, rgba(200,60,0,.5), rgba(200,160,0,.4)) !important; }'
        ].join('\n');
        document.head.appendChild(style);
    }
    
    function boot417() {
        addPresetLabels();
        fixAutoCutStatus();
        
        var tries = 0;
        var timer = setInterval(function() {
            tries++;
            fixAutoCutStatus();
            if (tries > 100) clearInterval(timer);
        }, 150);
    }
    
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot417);
    else boot417();
})();


/* DeKuki Enhanced v4.1.8 - sentences 2-line toggle + punctuation fix */
(function () {
    'use strict';

    function id(x) { return document.getElementById(x); }
    function val(x) { var e = id(x); return e ? e.value : ''; }

    function addSentencesToggle() {
        var card = id('sentenceBtn');
        if (!card || card.getAttribute('data-s418')) return false;
        card.setAttribute('data-s418', '1');

        // Add a small "2 lines" toggle inside the card-content
        var content = card.querySelector('.card-content');
        if (!content) return false;

        // Style injection
        var style = document.getElementById('dekuki418Style');
        if (!style) {
            style = document.createElement('style');
            style.id = 'dekuki418Style';
            style.textContent = [
                '.s418-toggle-wrap { display:flex; align-items:center; gap:5px; margin-top:5px; }',
                '.s418-toggle-label { font-size:9px; color:rgba(255,255,255,.45); font-weight:700; letter-spacing:.04em; text-transform:uppercase; }',
                '.s418-toggle { display:flex; border-radius:4px; overflow:hidden; border:1px solid rgba(255,200,0,.2); }',
                '.s418-opt { padding:2px 7px; font-size:9px; font-weight:800; cursor:pointer; color:rgba(255,255,255,.4); background:transparent; border:none; transition:all .12s; letter-spacing:.03em; text-transform:uppercase; }',
                '.s418-opt.active { background:rgba(200,160,0,.35); color:#ffdc50; }',
                '.s418-opt:hover:not(.active) { background:rgba(255,255,255,.07); color:rgba(255,255,255,.75); }'
            ].join('\n');
            document.head.appendChild(style);
        }

        var wrap = document.createElement('div');
        wrap.className = 's418-toggle-wrap';
        wrap.innerHTML =
            '<span class="s418-toggle-label">Lines</span>' +
            '<div class="s418-toggle">' +
              '<button class="s418-opt active" data-lines="1">1</button>' +
              '<button class="s418-opt" data-lines="2">2</button>' +
            '</div>';
        content.appendChild(wrap);

        // Toggle click (don't bubble to card)
        wrap.addEventListener('click', function(e) {
            var btn = e.target.closest('[data-lines]');
            if (!btn) return;
            e.stopPropagation();
            wrap.querySelectorAll('.s418-opt').forEach(function(b){ b.classList.remove('active'); });
            btn.classList.add('active');
        });

        // Intercept the sentence card click
        card.addEventListener('click', function(e) {
            var activeLines = wrap.querySelector('.s418-opt.active');
            var lines = activeLines ? parseInt(activeLines.getAttribute('data-lines')) : 1;
            if (lines === 1) return; // let original handler run normally

            // 2-line mode: configure Custom with sentence-like settings and trigger it
            e.stopImmediatePropagation();

            var minW  = id('customMinWords');
            var maxW  = id('customMaxWords');
            var maxL  = id('customMaxLines');
            var maxLV = id('customMaxLinesVal');
            var maxWV = id('customMaxWordsVal');
            var minWV = id('customMinWordsVal');

            if (!minW || !maxW || !maxL) return; // fallback: do nothing

            // Set values to sentence-like config with 2 lines
            if (minW)  { minW.value  = '4';  if (minWV) minWV.textContent = '4'; }
            if (maxW)  { maxW.value  = '20'; if (maxWV) maxWV.textContent = '20'; }
            if (maxL)  { maxL.value  = '2';  if (maxLV) maxLV.textContent = '2'; }

            // Set break sensitivity to "medium" (natural pauses)
            var medBtn = document.querySelector('.custom-break-btn[data-sensitivity="medium"]');
            if (medBtn) {
                document.querySelectorAll('.custom-break-btn').forEach(function(b){ b.classList.remove('active'); });
                medBtn.classList.add('active');
            }

            // Show custom settings section briefly then trigger create
            var customCreate = id('customCreateBtn');
            if (customCreate) {
                customCreate.click();
            }
        }, true); // capture phase so we run before the original listener

        return true;
    }

    function boot418() {
        if (addSentencesToggle()) return;
        var tries = 0;
        var t = setInterval(function() {
            tries++;
            if (addSentencesToggle() || tries > 120) clearInterval(t);
        }, 150);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot418);
    else boot418();
})();
