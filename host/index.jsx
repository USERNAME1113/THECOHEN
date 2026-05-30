// host/index.jsx - AutoCaption ExtendScript
// JSON support embedded
// NOTE: #target removed — unnecessary in CEP context and can cause
//       load errors when the panel initialises before AE's scripting engine.

// ==================== JSON2 LIBRARY ====================
if (!this.JSON) {
    this.JSON = {};
}

(function () {

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                   this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON =
        Number.prototype.toJSON =
        Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                                mind + ']' :
                          '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                     typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
.replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());
// ==================== PLUGIN FUNCTIONS ====================

function getFileInfo() {
    try {
        var comp = app.project.activeItem;
        if (!comp || !(comp instanceof CompItem)) {
            return "ERROR:No active composition";
        }
        
        var audioLayer = null;
        for (var i = 1; i <= comp.numLayers; i++) {
            var layer = comp.layer(i);
            if (layer.selected && layer.hasAudio) {
                audioLayer = layer;
                break;
            }
        }
        
        if (!audioLayer) {
            return "ERROR:No audio layer selected";
        }
        
        if (!audioLayer.source || !audioLayer.source.file) {
            return "ERROR:Audio layer has no source file";
        }
        
        var file = audioLayer.source.file;
        
        if (!file.exists) {
            return "ERROR:File does not exist";
        }
        
        var fileSize = file.length;
        var maxSize = 2 * 1024 * 1024 * 1024;

        if (fileSize > maxSize) {
            return "ERROR:File too large (max 2GB)";
        }
        
        if (typeof JSON === 'undefined') {
            return "ERROR:JSON is not defined";
        }
        
        var result = JSON.stringify({
            fsName: file.fsName,
            name: file.name,
            size: fileSize,
            offset: audioLayer.startTime,
            compWidth: comp.width,
            compHeight: comp.height
        });
        
        return result;
        
    } catch (e) {
        return "ERROR:" + e.toString();
    }
}

function exportSelectedAudio() {
    try {
        var comp = app.project.activeItem;
        if (!(comp instanceof CompItem)) {
            return "";
        }
        
        var selectedLayers = comp.selectedLayers;
        if (!selectedLayers || selectedLayers.length === 0) {
            return "";
        }
        
        var layer = selectedLayers[0];
        if (!(layer instanceof AVLayer) || !layer.source || !layer.source.file) {
            return "";
        }
        
        if (!layer.source.file.exists) {
            return "";
        }
        
        return layer.source.file.fsName;
        
    } catch (error) {
        return "";
    }
}

function testJSON() {
    try {
        if (typeof JSON === 'undefined') {
            return "ERROR:JSON is undefined";
        }
        
        var testObj = {test: "value", number: 123};
        var jsonStr = JSON.stringify(testObj);
        var parsed = JSON.parse(jsonStr);
        
        if (parsed.test === "value" && parsed.number === 123) {
            return "SUCCESS:JSON is working correctly";
        } else {
            return "ERROR:JSON parse/stringify mismatch";
        }
    } catch (e) {
        return "ERROR:" + e.toString();
    }
}
// Lightweight health-check for CEP startup retry loop.
// Returns "PONG" immediately — no JSON, no comp access needed.
function ping() {
    return "PONG";
}

$.global.getAllFonts = function () {
    try {
        if (typeof app.fonts === "undefined" || typeof app.fonts.allFonts === "undefined") {
            return "LEGACY";
        }
        var families = app.fonts.allFonts;
        var result = [];
        var skipped = 0;
        for (var i = 0; i < families.length; i++) {
            var family = families[i];
            if (!family || !family.length) continue;
            for (var j = 0; j < family.length; j++) {
                try {
                    var font = family[j];
                    if (!font) continue;
                    var ps = font.postScriptName || "";
                    if (!ps) continue;
                    result.push({
                        ps: ps,
                        fam: font.familyName || "",
                        sty: font.styleName || ""
                    });
                } catch (innerErr) {
                    skipped++;
                }
            }
        }
        if (skipped > 0) {
            $.writeln("[getAllFonts] skipped " + skipped + " broken fonts");
        }
        return JSON.stringify(result);
    } catch (e) {
        return "ERROR:" + e.toString();
    }
};


// ==================== DEKUKI ENHANCED TOOLS ====================
// Added as a separate compatibility layer. Uses ES3-compatible ExtendScript.
function dekuki_ok(message) { return "OK:" + message; }
function dekuki_error(e) { return "ERROR:" + (e && e.toString ? e.toString() : String(e)); }

function dekuki_getActiveComp() {
    var comp = app.project.activeItem;
    if (!comp || !(comp instanceof CompItem)) {
        throw new Error("No active composition");
    }
    return comp;
}

function dekuki_isTextLayer(layer) {
    try {
        return layer && layer.property("ADBE Text Properties") && layer.property("ADBE Text Properties").property("ADBE Text Document");
    } catch (e) {
        return false;
    }
}

function dekuki_getTextProp(layer) {
    return layer.property("ADBE Text Properties").property("ADBE Text Document");
}

function dekuki_getText(layer) {
    var doc = dekuki_getTextProp(layer).value;
    return doc && doc.text !== undefined ? String(doc.text) : "";
}

function dekuki_setText(layer, text) {
    var prop = dekuki_getTextProp(layer);
    var doc = prop.value;
    doc.text = text;
    prop.setValue(doc);
}

function dekuki_collectTextLayers(comp, selectedOnly) {
    var result = [];
    var i, layer;
    if (selectedOnly && comp.selectedLayers && comp.selectedLayers.length > 0) {
        for (i = 0; i < comp.selectedLayers.length; i++) {
            layer = comp.selectedLayers[i];
            if (dekuki_isTextLayer(layer)) result.push(layer);
        }
    }
    if (result.length === 0) {
        for (i = 1; i <= comp.numLayers; i++) {
            layer = comp.layer(i);
            if (dekuki_isTextLayer(layer)) result.push(layer);
        }
    }
    return result;
}

function dekuki_pad(n, w) {
    n = String(n);
    while (n.length < w) n = "0" + n;
    return n;
}

function dekuki_srtTime(t) {
    if (t < 0) t = 0;
    var ms = Math.round((t - Math.floor(t)) * 1000);
    var total = Math.floor(t);
    var h = Math.floor(total / 3600);
    var m = Math.floor((total % 3600) / 60);
    var s = total % 60;
    return dekuki_pad(h, 2) + ":" + dekuki_pad(m, 2) + ":" + dekuki_pad(s, 2) + "," + dekuki_pad(ms, 3);
}

function dekuki_hexToRgb(hex) {
    hex = String(hex || "#ffffff").replace("#", "");
    if (hex.length === 3) {
        hex = hex.charAt(0) + hex.charAt(0) + hex.charAt(1) + hex.charAt(1) + hex.charAt(2) + hex.charAt(2);
    }
    var r = parseInt(hex.substr(0, 2), 16) / 255;
    var g = parseInt(hex.substr(2, 2), 16) / 255;
    var b = parseInt(hex.substr(4, 2), 16) / 255;
    if (isNaN(r) || isNaN(g) || isNaN(b)) return [1, 1, 1];
    return [r, g, b];
}

function dekuki_trim(s) {
    return String(s).replace(/^\s+|\s+$/g, "");
}

function dekuki_titleCase(s) {
    return String(s).toLowerCase().replace(/(^|\s)(\S)/g, function (m, p1, p2) { return p1 + p2.toUpperCase(); });
}

function dekukiDiagnostics() {
    try {
        var comp = dekuki_getActiveComp();
        var selected = comp.selectedLayers ? comp.selectedLayers.length : 0;
        var allText = 0;
        var selectedText = 0;
        var emptyText = 0;
        var audio = 0;
        var video = 0;
        for (var i = 1; i <= comp.numLayers; i++) {
            var layer = comp.layer(i);
            if (dekuki_isTextLayer(layer)) {
                allText++;
                if (dekuki_trim(dekuki_getText(layer)) === "") emptyText++;
                if (layer.selected) selectedText++;
            }
            try { if (layer.hasAudio) audio++; } catch (e1) {}
            try { if (layer.hasVideo) video++; } catch (e2) {}
        }
        var report = {
            composition: comp.name,
            width: comp.width,
            height: comp.height,
            fps: comp.frameRate,
            duration_seconds: Math.round(comp.duration * 1000) / 1000,
            total_layers: comp.numLayers,
            selected_layers: selected,
            text_layers: allText,
            selected_text_layers: selectedText,
            empty_text_layers: emptyText,
            audio_layers: audio,
            video_layers: video,
            dekuki_enhanced: "4.1.0-tools"
        };
        return JSON.stringify(report, null, 2);
    } catch (e) {
        return dekuki_error(e);
    }
}

function dekukiSelectAllTextLayers() {
    try {
        var comp = dekuki_getActiveComp();
        app.beginUndoGroup("DeKuki Select Text Layers");
        for (var i = 1; i <= comp.numLayers; i++) comp.layer(i).selected = false;
        var count = 0;
        for (var j = 1; j <= comp.numLayers; j++) {
            var layer = comp.layer(j);
            if (dekuki_isTextLayer(layer)) {
                layer.selected = true;
                count++;
            }
        }
        app.endUndoGroup();
        return dekuki_ok("Selected " + count + " text layers");
    } catch (e) {
        try { app.endUndoGroup(); } catch (ignore) {}
        return dekuki_error(e);
    }
}

function dekukiDeleteEmptyTextLayers() {
    try {
        var comp = dekuki_getActiveComp();
        var layers = dekuki_collectTextLayers(comp, true);
        var removed = 0;
        app.beginUndoGroup("DeKuki Delete Empty Text Layers");
        for (var i = layers.length - 1; i >= 0; i--) {
            if (dekuki_trim(dekuki_getText(layers[i])) === "") {
                layers[i].remove();
                removed++;
            }
        }
        app.endUndoGroup();
        return dekuki_ok("Deleted " + removed + " empty text layers");
    } catch (e) {
        try { app.endUndoGroup(); } catch (ignore) {}
        return dekuki_error(e);
    }
}

function dekukiNormalizeTextLayers() {
    try {
        var comp = dekuki_getActiveComp();
        var layers = dekuki_collectTextLayers(comp, true);
        app.beginUndoGroup("DeKuki Normalize Text Layers");
        for (var i = 0; i < layers.length; i++) {
            var t = dekuki_getText(layers[i]);
            t = dekuki_trim(t).replace(/[ \t]{2,}/g, " ").replace(/\s+\n/g, "\n").replace(/\n\s+/g, "\n").replace(/\n{3,}/g, "\n\n");
            dekuki_setText(layers[i], t);
        }
        app.endUndoGroup();
        return dekuki_ok("Normalized " + layers.length + " text layers");
    } catch (e) {
        try { app.endUndoGroup(); } catch (ignore) {}
        return dekuki_error(e);
    }
}

function dekukiRemovePunctuation() {
    try {
        var comp = dekuki_getActiveComp();
        var layers = dekuki_collectTextLayers(comp, true);
        app.beginUndoGroup("DeKuki Remove Punctuation");
        for (var i = 0; i < layers.length; i++) {
            var t = dekuki_getText(layers[i]);
            // Remove punctuation including hyphens, dashes, Hebrew geresh/gershayim
            t = t.replace(/[.,!?;:\"'“”‘’׳״\[\](){}<>«»\/\\|~`@#$%^&*_+=\-‒–—―]/g, "");
            t = t.replace(/[ \t]{2,}/g, " ");
            dekuki_setText(layers[i], dekuki_trim(t));
        }
        app.endUndoGroup();
        return dekuki_ok("Removed punctuation from " + layers.length + " text layers");
    } catch (e) {
        try { app.endUndoGroup(); } catch (ignore) {}
        return dekuki_error(e);
    }
}
function dekukiSetTextCase(mode) {
    try {
        var comp = dekuki_getActiveComp();
        var layers = dekuki_collectTextLayers(comp, true);
        app.beginUndoGroup("DeKuki Text Case");
        for (var i = 0; i < layers.length; i++) {
            var t = dekuki_getText(layers[i]);
            if (mode === "upper") t = t.toUpperCase();
            else if (mode === "lower") t = t.toLowerCase();
            else if (mode === "title") t = dekuki_titleCase(t);
            dekuki_setText(layers[i], t);
        }
        app.endUndoGroup();
        return dekuki_ok("Changed case for " + layers.length + " text layers");
    } catch (e) {
        try { app.endUndoGroup(); } catch (ignore) {}
        return dekuki_error(e);
    }
}

function dekukiAlignText(positionName) {
    try {
        var comp = dekuki_getActiveComp();
        var layers = dekuki_collectTextLayers(comp, true);
        var x = comp.width / 2;
        var y = comp.height * 0.86;
        if (positionName === "center") y = comp.height / 2;
        if (positionName === "top") y = comp.height * 0.14;
        app.beginUndoGroup("DeKuki Align Text");
        for (var i = 0; i < layers.length; i++) {
            try { layers[i].property("ADBE Transform Group").property("ADBE Position").setValue([x, y]); } catch (e1) {}
            try { layers[i].property("ADBE Transform Group").property("ADBE Anchor Point").setValue([0, 0]); } catch (e2) {}
        }
        app.endUndoGroup();
        return dekuki_ok("Aligned " + layers.length + " text layers to " + positionName);
    } catch (e) {
        try { app.endUndoGroup(); } catch (ignore) {}
        return dekuki_error(e);
    }
}

function dekukiShiftSelectedLayers(seconds) {
    try {
        var comp = dekuki_getActiveComp();
        var delta = parseFloat(seconds);
        if (isNaN(delta)) delta = 0;
        var layers = comp.selectedLayers;
        if (!layers || layers.length === 0) throw new Error("Select layers first");
        app.beginUndoGroup("DeKuki Shift Layers");
        for (var i = 0; i < layers.length; i++) layers[i].startTime += delta;
        app.endUndoGroup();
        return dekuki_ok("Shifted " + layers.length + " layers by " + delta + " seconds");
    } catch (e) {
        try { app.endUndoGroup(); } catch (ignore) {}
        return dekuki_error(e);
    }
}

function dekukiDistributeSelectedLayers(gapSeconds) {
    try {
        var comp = dekuki_getActiveComp();
        var gap = parseFloat(gapSeconds);
        if (isNaN(gap)) gap = 0;
        var layers = comp.selectedLayers;
        if (!layers || layers.length < 2) throw new Error("Select at least two layers");
        var arr = [];
        for (var i = 0; i < layers.length; i++) arr.push(layers[i]);
        arr.sort(function (a, b) { return a.startTime - b.startTime; });
        app.beginUndoGroup("DeKuki Sequence Layers");
        var cursor = arr[0].startTime;
        for (var j = 0; j < arr.length; j++) {
            arr[j].startTime = cursor;
            cursor = arr[j].outPoint + gap;
        }
        app.endUndoGroup();
        return dekuki_ok("Sequenced " + arr.length + " layers with " + gap + "s gap");
    } catch (e) {
        try { app.endUndoGroup(); } catch (ignore) {}
        return dekuki_error(e);
    }
}

function dekukiApplySubtitleStyle(styleJson) {
    try {
        var comp = dekuki_getActiveComp();
        var layers = dekuki_collectTextLayers(comp, true);
        var cfg = JSON.parse(styleJson || "{}");
        var fontSize = parseFloat(cfg.fontSize);
        var strokeWidth = parseFloat(cfg.strokeWidth);
        app.beginUndoGroup("DeKuki Apply Subtitle Style");
        for (var i = 0; i < layers.length; i++) {
            var prop = dekuki_getTextProp(layers[i]);
            var doc = prop.value;
            if (!isNaN(fontSize) && fontSize > 0) doc.fontSize = fontSize;
            if (cfg.fillColor) {
                doc.applyFill = true;
                doc.fillColor = dekuki_hexToRgb(cfg.fillColor);
            }
            if (cfg.strokeColor) {
                doc.applyStroke = true;
                doc.strokeColor = dekuki_hexToRgb(cfg.strokeColor);
            }
            if (!isNaN(strokeWidth) && strokeWidth >= 0) doc.strokeWidth = strokeWidth;
            try { doc.justification = ParagraphJustification.CENTER_JUSTIFY; } catch (e1) {}
            prop.setValue(doc);
        }
        app.endUndoGroup();
        return dekuki_ok("Applied style to " + layers.length + " text layers");
    } catch (e) {
        try { app.endUndoGroup(); } catch (ignore) {}
        return dekuki_error(e);
    }
}

function dekukiExportSelectedTextAsSRT() {
    try {
        var comp = dekuki_getActiveComp();
        var layers = dekuki_collectTextLayers(comp, true);
        layers.sort(function (a, b) { return a.inPoint - b.inPoint; });
        var out = [];
        for (var i = 0; i < layers.length; i++) {
            var txt = dekuki_trim(dekuki_getText(layers[i]));
            if (!txt) continue;
            out.push(String(out.length + 1));
            out.push(dekuki_srtTime(layers[i].inPoint) + " --> " + dekuki_srtTime(layers[i].outPoint));
            out.push(txt.replace(/\r\n|\r/g, "\n"));
            out.push("");
        }
        return out.join("\n");
    } catch (e) {
        return dekuki_error(e);
    }
}

try {
    $.global.dekukiDiagnostics = dekukiDiagnostics;
    $.global.dekukiSelectAllTextLayers = dekukiSelectAllTextLayers;
    $.global.dekukiDeleteEmptyTextLayers = dekukiDeleteEmptyTextLayers;
    $.global.dekukiNormalizeTextLayers = dekukiNormalizeTextLayers;
    $.global.dekukiRemovePunctuation = dekukiRemovePunctuation;
    $.global.dekukiSetTextCase = dekukiSetTextCase;
    $.global.dekukiAlignText = dekukiAlignText;
    $.global.dekukiShiftSelectedLayers = dekukiShiftSelectedLayers;
    $.global.dekukiDistributeSelectedLayers = dekukiDistributeSelectedLayers;
    $.global.dekukiApplySubtitleStyle = dekukiApplySubtitleStyle;
    $.global.dekukiExportSelectedTextAsSRT = dekukiExportSelectedTextAsSRT;
} catch (e) {}


// ==================== DEKUKI ENHANCED TOOLS v4.1.2 ====================
function dekuki_csvEscape(value) {
    var s = String(value == null ? "" : value);
    return '"' + s.replace(/"/g, '""').replace(/\r\n|\r/g, "\n") + '"';
}

function dekukiFindReplace(findText, replaceText, caseSensitive) {
    try {
        var comp = dekuki_getActiveComp();
        findText = String(findText || "");
        replaceText = String(replaceText || "");
        if (findText === "") throw new Error("Find text is empty");
        var layers = dekuki_collectTextLayers(comp, true);
        var flags = caseSensitive === true || caseSensitive === "true" ? "g" : "gi";
        var escaped = findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        var re = new RegExp(escaped, flags);
        var changed = 0;
        app.beginUndoGroup("DeKuki Find Replace");
        for (var i = 0; i < layers.length; i++) {
            var before = dekuki_getText(layers[i]);
            var after = before.replace(re, replaceText);
            if (after !== before) {
                dekuki_setText(layers[i], after);
                changed++;
            }
        }
        app.endUndoGroup();
        return dekuki_ok("Find/replace changed " + changed + " of " + layers.length + " text layers");
    } catch (e) {
        try { app.endUndoGroup(); } catch (ignore) {}
        return dekuki_error(e);
    }
}

function dekukiAddPrefixSuffix(prefix, suffix) {
    try {
        var comp = dekuki_getActiveComp();
        prefix = String(prefix || "");
        suffix = String(suffix || "");
        var layers = dekuki_collectTextLayers(comp, true);
        app.beginUndoGroup("DeKuki Add Prefix Suffix");
        for (var i = 0; i < layers.length; i++) {
            dekuki_setText(layers[i], prefix + dekuki_getText(layers[i]) + suffix);
        }
        app.endUndoGroup();
        return dekuki_ok("Updated " + layers.length + " text layers");
    } catch (e) {
        try { app.endUndoGroup(); } catch (ignore) {}
        return dekuki_error(e);
    }
}

function dekukiEqualizeSelectedDuration(seconds) {
    try {
        var comp = dekuki_getActiveComp();
        var dur = parseFloat(seconds);
        if (isNaN(dur) || dur <= 0) throw new Error("Duration must be greater than zero");
        var layers = comp.selectedLayers;
        if (!layers || layers.length === 0) throw new Error("Select layers first");
        app.beginUndoGroup("DeKuki Equalize Duration");
        for (var i = 0; i < layers.length; i++) {
            layers[i].outPoint = layers[i].inPoint + dur;
        }
        app.endUndoGroup();
        return dekuki_ok("Set duration to " + dur + "s for " + layers.length + " layers");
    } catch (e) {
        try { app.endUndoGroup(); } catch (ignore) {}
        return dekuki_error(e);
    }
}

function dekukiSnapSelectedLayersToFrames() {
    try {
        var comp = dekuki_getActiveComp();
        var layers = comp.selectedLayers;
        if (!layers || layers.length === 0) throw new Error("Select layers first");
        var fd = comp.frameDuration;
        app.beginUndoGroup("DeKuki Snap Layers To Frames");
        for (var i = 0; i < layers.length; i++) {
            var inDur = layers[i].outPoint - layers[i].inPoint;
            var newIn = Math.round(layers[i].inPoint / fd) * fd;
            var newOut = Math.round(layers[i].outPoint / fd) * fd;
            if (newOut <= newIn) newOut = newIn + Math.max(fd, inDur);
            layers[i].inPoint = newIn;
            layers[i].outPoint = newOut;
        }
        app.endUndoGroup();
        return dekuki_ok("Snapped " + layers.length + " layers to frame boundaries");
    } catch (e) {
        try { app.endUndoGroup(); } catch (ignore) {}
        return dekuki_error(e);
    }
}

function dekukiTrimSelectedToWorkArea() {
    try {
        var comp = dekuki_getActiveComp();
        var layers = comp.selectedLayers;
        if (!layers || layers.length === 0) throw new Error("Select layers first");
        var start = comp.workAreaStart;
        var end = comp.workAreaStart + comp.workAreaDuration;
        app.beginUndoGroup("DeKuki Trim To Work Area");
        var changed = 0;
        for (var i = 0; i < layers.length; i++) {
            if (layers[i].outPoint > start && layers[i].inPoint < end) {
                if (layers[i].inPoint < start) layers[i].inPoint = start;
                if (layers[i].outPoint > end) layers[i].outPoint = end;
                changed++;
            }
        }
        app.endUndoGroup();
        return dekuki_ok("Trimmed " + changed + " selected layers to work area");
    } catch (e) {
        try { app.endUndoGroup(); } catch (ignore) {}
        return dekuki_error(e);
    }
}

function dekukiSplitSelectedTextByLines() {
    try {
        var comp = dekuki_getActiveComp();
        var selected = comp.selectedLayers;
        if (!selected || selected.length === 0) throw new Error("Select one or more multi-line text layers first");
        var targets = [];
        for (var i = 0; i < selected.length; i++) if (dekuki_isTextLayer(selected[i])) targets.push(selected[i]);
        if (targets.length === 0) throw new Error("No selected text layers");
        var created = 0;
        app.beginUndoGroup("DeKuki Split Text By Lines");
        for (var t = targets.length - 1; t >= 0; t--) {
            var layer = targets[t];
            var txt = dekuki_getText(layer).replace(/\r\n|\r/g, "\n");
            var raw = txt.split("\n");
            var lines = [];
            for (var r = 0; r < raw.length; r++) {
                var line = dekuki_trim(raw[r]);
                if (line !== "") lines.push(line);
            }
            if (lines.length <= 1) continue;
            var start = layer.inPoint;
            var end = layer.outPoint;
            var dur = Math.max(comp.frameDuration, (end - start) / lines.length);
            for (var j = 0; j < lines.length; j++) {
                var dup = layer.duplicate();
                dekuki_setText(dup, lines[j]);
                dup.inPoint = start + dur * j;
                dup.outPoint = (j === lines.length - 1) ? end : start + dur * (j + 1);
                dup.name = "Subtitle " + dekuki_pad(j + 1, 2) + " - " + lines[j].substr(0, 24);
                created++;
            }
            layer.remove();
        }
        app.endUndoGroup();
        return dekuki_ok("Split text into " + created + " subtitle layers");
    } catch (e) {
        try { app.endUndoGroup(); } catch (ignore) {}
        return dekuki_error(e);
    }
}

function dekukiMergeSelectedTextLayers() {
    try {
        var comp = dekuki_getActiveComp();
        var layers = dekuki_collectTextLayers(comp, true);
        if (layers.length < 2) throw new Error("Select at least two text layers");
        layers.sort(function (a, b) { return a.inPoint - b.inPoint; });
        var merged = [];
        var first = layers[0];
        var lastOut = first.outPoint;
        for (var i = 0; i < layers.length; i++) {
            var txt = dekuki_trim(dekuki_getText(layers[i]));
            if (txt) merged.push(txt);
            if (layers[i].outPoint > lastOut) lastOut = layers[i].outPoint;
        }
        app.beginUndoGroup("DeKuki Merge Text Layers");
        dekuki_setText(first, merged.join("\n"));
        first.inPoint = layers[0].inPoint;
        first.outPoint = lastOut;
        first.name = "Merged Subtitles";
        for (var j = layers.length - 1; j >= 1; j--) layers[j].remove();
        app.endUndoGroup();
        return dekuki_ok("Merged " + layers.length + " text layers into one layer");
    } catch (e) {
        try { app.endUndoGroup(); } catch (ignore) {}
        return dekuki_error(e);
    }
}

function dekukiCreateMarkersFromTextLayers() {
    try {
        var comp = dekuki_getActiveComp();
        var layers = dekuki_collectTextLayers(comp, true);
        layers.sort(function (a, b) { return a.inPoint - b.inPoint; });
        app.beginUndoGroup("DeKuki Create Markers From Text");
        var count = 0;
        for (var i = 0; i < layers.length; i++) {
            var txt = dekuki_trim(dekuki_getText(layers[i]));
            if (!txt) continue;
            var marker = new MarkerValue(txt.substr(0, 240));
            try { marker.duration = Math.max(0, layers[i].outPoint - layers[i].inPoint); } catch (e1) {}
            comp.markerProperty.setValueAtTime(layers[i].inPoint, marker);
            count++;
        }
        app.endUndoGroup();
        return dekuki_ok("Created " + count + " composition markers");
    } catch (e) {
        try { app.endUndoGroup(); } catch (ignore) {}
        return dekuki_error(e);
    }
}

function dekukiRenameTextLayers() {
    try {
        var comp = dekuki_getActiveComp();
        var layers = dekuki_collectTextLayers(comp, true);
        layers.sort(function (a, b) { return a.inPoint - b.inPoint; });
        app.beginUndoGroup("DeKuki Rename Text Layers");
        for (var i = 0; i < layers.length; i++) {
            var txt = dekuki_trim(dekuki_getText(layers[i])).replace(/\n/g, " ");
            layers[i].name = "SUB_" + dekuki_pad(i + 1, 3) + (txt ? "_" + txt.substr(0, 28) : "");
        }
        app.endUndoGroup();
        return dekuki_ok("Renamed " + layers.length + " text layers");
    } catch (e) {
        try { app.endUndoGroup(); } catch (ignore) {}
        return dekuki_error(e);
    }
}

function dekukiExportTextLayersCSV() {
    try {
        var comp = dekuki_getActiveComp();
        var layers = dekuki_collectTextLayers(comp, true);
        layers.sort(function (a, b) { return a.inPoint - b.inPoint; });
        var out = ["index,layer_name,start,end,duration,text"];
        for (var i = 0; i < layers.length; i++) {
            out.push([
                i + 1,
                dekuki_csvEscape(layers[i].name),
                dekuki_csvEscape(dekuki_srtTime(layers[i].inPoint)),
                dekuki_csvEscape(dekuki_srtTime(layers[i].outPoint)),
                Math.round((layers[i].outPoint - layers[i].inPoint) * 1000) / 1000,
                dekuki_csvEscape(dekuki_getText(layers[i]))
            ].join(","));
        }
        return out.join("\n");
    } catch (e) {
        return dekuki_error(e);
    }
}

function dekukiCreateSafeAreaGuides() {
    try {
        var comp = dekuki_getActiveComp();
        app.beginUndoGroup("DeKuki Safe Area Guides");
        var layer = comp.layers.addShape();
        layer.name = "DeKuki Safe Area Guides";
        layer.guideLayer = true;
        var contents = layer.property("ADBE Root Vectors Group");
        function addRect(name, size, color) {
            var group = contents.addProperty("ADBE Vector Group");
            group.name = name;
            var vectors = group.property("ADBE Vectors Group");
            var rect = vectors.addProperty("ADBE Vector Shape - Rect");
            rect.property("ADBE Vector Rect Size").setValue(size);
            rect.property("ADBE Vector Rect Position").setValue([0, 0]);
            var stroke = vectors.addProperty("ADBE Vector Graphic - Stroke");
            stroke.property("ADBE Vector Stroke Color").setValue(color);
            stroke.property("ADBE Vector Stroke Width").setValue(2);
            try { stroke.property("ADBE Vector Stroke Opacity").setValue(55); } catch (e1) {}
        }
        addRect("Title Safe 90%", [comp.width * 0.90, comp.height * 0.90], [1, 0.15, 0.15]);
        addRect("Subtitle Safe 80%", [comp.width * 0.80, comp.height * 0.76], [1, 1, 1]);
        layer.property("ADBE Transform Group").property("ADBE Position").setValue([comp.width / 2, comp.height / 2]);
        layer.locked = true;
        app.endUndoGroup();
        return dekuki_ok("Created safe-area guide layer");
    } catch (e) {
        try { app.endUndoGroup(); } catch (ignore) {}
        return dekuki_error(e);
    }
}

try {
    $.global.dekukiFindReplace = dekukiFindReplace;
    $.global.dekukiAddPrefixSuffix = dekukiAddPrefixSuffix;
    $.global.dekukiEqualizeSelectedDuration = dekukiEqualizeSelectedDuration;
    $.global.dekukiSnapSelectedLayersToFrames = dekukiSnapSelectedLayersToFrames;
    $.global.dekukiTrimSelectedToWorkArea = dekukiTrimSelectedToWorkArea;
    $.global.dekukiSplitSelectedTextByLines = dekukiSplitSelectedTextByLines;
    $.global.dekukiMergeSelectedTextLayers = dekukiMergeSelectedTextLayers;
    $.global.dekukiCreateMarkersFromTextLayers = dekukiCreateMarkersFromTextLayers;
    $.global.dekukiRenameTextLayers = dekukiRenameTextLayers;
    $.global.dekukiExportTextLayersCSV = dekukiExportTextLayersCSV;
    $.global.dekukiCreateSafeAreaGuides = dekukiCreateSafeAreaGuides;
} catch (e) {}


// ==================== DEKUKI ENHANCED v4.1.5 - SILENCE CUTS & SURPRISE TOOLS ====================
function dekuki_415_ok(msg) { return "OK:" + msg; }
function dekuki_415_err(msg) { return "ERROR:" + msg; }
function dekuki_415_comp() {
    var comp = app.project.activeItem;
    if (!comp || !(comp instanceof CompItem)) return null;
    return comp;
}
function dekuki_415_selectedAV(comp) {
    var arr = [];
    var selected = comp.selectedLayers;
    for (var i = 0; i < selected.length; i++) {
        try { if (selected[i] instanceof AVLayer) arr.push(selected[i]); } catch (e) {}
    }
    return arr;
}
function dekuki_415_selectedAudio(comp) {
    var selected = comp.selectedLayers;
    for (var i = 0; i < selected.length; i++) {
        try { if (selected[i].hasAudio && selected[i].source && selected[i].source.file) return selected[i]; } catch (e) {}
    }
    for (var j = 1; j <= comp.numLayers; j++) {
        try { if (comp.layer(j).selected && comp.layer(j).hasAudio) return comp.layer(j); } catch (e2) {}
    }
    return null;
}
function dekuki_415_num(v, fallback) {
    var n = parseFloat(v);
    return isNaN(n) ? fallback : n;
}
function dekuki_415_parseSilences(jsonText) {
    var data = JSON.parse(jsonText || "[]");
    var arr = [];
    for (var i = 0; i < data.length; i++) {
        var s = dekuki_415_num(data[i].start, NaN);
        var e = dekuki_415_num(data[i].end, NaN);
        if (!isNaN(s) && !isNaN(e) && e > s) arr.push({ start: s, end: e });
    }
    arr.sort(function (a, b) { return a.start - b.start; });
    return arr;
}
function dekuki_415_keepRangesFromSilences(silences, fromTime, toTime, offset, pad, minKeep) {
    var ranges = [];
    var cursor = fromTime;
    for (var i = 0; i < silences.length; i++) {
        var ss = offset + silences[i].start - pad;
        var se = offset + silences[i].end + pad;
        if (se <= fromTime || ss >= toTime) continue;
        ss = Math.max(fromTime, ss);
        se = Math.min(toTime, se);
        if (ss > cursor && (ss - cursor) >= minKeep) ranges.push({ start: cursor, end: ss });
        if (se > cursor) cursor = se;
    }
    if (toTime > cursor && (toTime - cursor) >= minKeep) ranges.push({ start: cursor, end: toTime });
    return ranges;
}
function dekukiGetSelectedAudioInfoEnhanced() {
    try {
        var comp = dekuki_415_comp();
        if (!comp) return dekuki_415_err("No active composition");
        var audio = dekuki_415_selectedAudio(comp);
        if (!audio) return dekuki_415_err("Select an audio/video layer with audio first");
        if (!audio.source || !audio.source.file || !audio.source.file.exists) return dekuki_415_err("Selected audio layer has no source file");
        return JSON.stringify({
            fsName: audio.source.file.fsName,
            name: audio.source.file.name,
            offset: audio.startTime,
            inPoint: audio.inPoint,
            outPoint: audio.outPoint,
            compDuration: comp.duration,
            workStart: comp.workAreaStart,
            workEnd: comp.workAreaStart + comp.workAreaDuration
        });
    } catch (e) { return dekuki_415_err(e.toString()); }
}
function dekukiCreateSilenceMarkersFromJSON(silenceJson, pad) {
    try {
        var comp = dekuki_415_comp();
        if (!comp) return dekuki_415_err("No active composition");
        var audio = dekuki_415_selectedAudio(comp);
        var offset = audio ? audio.startTime : 0;
        pad = Math.max(0, dekuki_415_num(pad, 0));
        var silences = dekuki_415_parseSilences(silenceJson);
        app.beginUndoGroup("DeKuki Silence Markers");
        var count = 0;
        for (var i = 0; i < silences.length; i++) {
            var t = offset + silences[i].start;
            if (t < 0 || t > comp.duration) continue;
            var mv = new MarkerValue("SILENCE CUT " + (i + 1));
            try { mv.duration = Math.max(0.01, silences[i].end - silences[i].start); } catch (e1) {}
            comp.markerProperty.setValueAtTime(t, mv);
            count++;
        }
        app.endUndoGroup();
        return dekuki_415_ok("Created " + count + " silence markers");
    } catch (e) { try { app.endUndoGroup(); } catch (x) {} return dekuki_415_err(e.toString()); }
}
function dekukiApplySilenceCutsFromJSON(silenceJson, mode, pad, minKeep) {
    try {
        var comp = dekuki_415_comp();
        if (!comp) return dekuki_415_err("No active composition");
        var layers = dekuki_415_selectedAV(comp);
        if (!layers.length) return dekuki_415_err("Select the audio/video layers you want to cut");
        var audio = dekuki_415_selectedAudio(comp);
        var offset = audio ? audio.startTime : 0;
        var silences = dekuki_415_parseSilences(silenceJson);
        if (!silences.length) return dekuki_415_err("No silence ranges were detected");
        pad = Math.max(0, dekuki_415_num(pad, 0.04));
        minKeep = Math.max(0.02, dekuki_415_num(minKeep, 0.12));
        mode = String(mode || "packed");
        app.beginUndoGroup("DeKuki Auto Silence Cuts");
        var made = 0;
        for (var li = 0; li < layers.length; li++) {
            var layer = layers[li];
            var ranges = dekuki_415_keepRangesFromSilences(silences, layer.inPoint, layer.outPoint, offset, pad, minKeep);
            var packCursor = layer.inPoint;
            for (var r = 0; r < ranges.length; r++) {
                var a = ranges[r].start;
                var b = ranges[r].end;
                var dur = b - a;
                if (dur < minKeep) continue;
                var dup = layer.duplicate();
                dup.name = layer.name + " | cut " + (r + 1);
                if (mode === "packed") {
                    dup.startTime = layer.startTime + (packCursor - a);
                    dup.inPoint = packCursor;
                    dup.outPoint = packCursor + dur;
                    packCursor += dur;
                } else {
                    dup.inPoint = a;
                    dup.outPoint = b;
                }
                try { dup.moveBefore(layer); } catch (eMove) {}
                made++;
            }
            if (made > 0) {
                try { layer.enabled = false; } catch (eDisable) {}
                try { layer.shy = true; comp.hideShyLayers = false; } catch (eShy) {}
            }
        }
        app.endUndoGroup();
        return dekuki_415_ok("Created " + made + " non-silent cut layers. Original selected layers were disabled, not deleted.");
    } catch (e) { try { app.endUndoGroup(); } catch (x) {} return dekuki_415_err(e.toString()); }
}
function dekukiAddBeatMarkers(intervalSeconds, label) {
    try {
        var comp = dekuki_415_comp();
        if (!comp) return dekuki_415_err("No active composition");
        var step = Math.max(0.05, dekuki_415_num(intervalSeconds, 1));
        label = String(label || "BEAT");
        app.beginUndoGroup("DeKuki Beat Markers");
        var start = comp.workAreaStart;
        var end = comp.workAreaStart + comp.workAreaDuration;
        var count = 0;
        for (var t = start; t <= end + 0.0001; t += step) {
            comp.markerProperty.setValueAtTime(t, new MarkerValue(label + " " + (count + 1)));
            count++;
        }
        app.endUndoGroup();
        return dekuki_415_ok("Created " + count + " beat markers");
    } catch (e) { try { app.endUndoGroup(); } catch (x) {} return dekuki_415_err(e.toString()); }
}
function dekukiDuplicateSelectedToVerticalStack(gapPx) {
    try {
        var comp = dekuki_415_comp();
        if (!comp) return dekuki_415_err("No active composition");
        var layers = dekuki_415_selectedAV(comp);
        if (!layers.length) return dekuki_415_err("Select layers first");
        gapPx = dekuki_415_num(gapPx, 90);
        app.beginUndoGroup("DeKuki Vertical Stack");
        var baseY = comp.height / 2 - ((layers.length - 1) * gapPx / 2);
        for (var i = 0; i < layers.length; i++) {
            try {
                var p = layers[i].property("ADBE Transform Group").property("ADBE Position");
                var v = p.value;
                if (v.length >= 2) { v[0] = comp.width / 2; v[1] = baseY + i * gapPx; p.setValue(v); }
            } catch (e1) {}
        }
        app.endUndoGroup();
        return dekuki_415_ok("Stacked " + layers.length + " layers vertically");
    } catch (e) { try { app.endUndoGroup(); } catch (x) {} return dekuki_415_err(e.toString()); }
}

try {
    $.global.dekukiGetSelectedAudioInfoEnhanced = dekukiGetSelectedAudioInfoEnhanced;
    $.global.dekukiCreateSilenceMarkersFromJSON = dekukiCreateSilenceMarkersFromJSON;
    $.global.dekukiApplySilenceCutsFromJSON = dekukiApplySilenceCutsFromJSON;
    $.global.dekukiAddBeatMarkers = dekukiAddBeatMarkers;
    $.global.dekukiDuplicateSelectedToVerticalStack = dekukiDuplicateSelectedToVerticalStack;
} catch (e415) {}


// ==================== DEKUKI ENHANCED v4.1.6 - SMART BREATH-AWARE CUTS ====================
function dekuki_416_mergeSilences(silences, breathClose) {
    if (!silences || !silences.length) return [];
    breathClose = Math.max(0, dekuki_415_num(breathClose, 0.18));
    var src = [];
    for (var i = 0; i < silences.length; i++) src.push({ start: silences[i].start, end: silences[i].end });
    src.sort(function (a, b) { return a.start - b.start; });
    var out = [];
    var cur = { start: src[0].start, end: src[0].end };
    for (var j = 1; j < src.length; j++) {
        var gap = src[j].start - cur.end;
        if (gap <= breathClose) {
            if (src[j].end > cur.end) cur.end = src[j].end;
        } else {
            out.push(cur);
            cur = { start: src[j].start, end: src[j].end };
        }
    }
    out.push(cur);
    return out;
}
function dekuki_416_keepRangesSmart(silences, fromTime, toTime, offset, cutPad, minKeep, breathClose, leadPad) {
    cutPad = Math.max(0, dekuki_415_num(cutPad, 0.01));
    leadPad = Math.max(0, dekuki_415_num(leadPad, 0.01));
    minKeep = Math.max(0.02, dekuki_415_num(minKeep, 0.08));
    var merged = dekuki_416_mergeSilences(silences, breathClose);
    var ranges = [];
    var cursor = fromTime;
    for (var i = 0; i < merged.length; i++) {
        var ss = offset + merged[i].start - leadPad;
        var se = offset + merged[i].end + cutPad;
        if (se <= fromTime || ss >= toTime) continue;
        ss = Math.max(fromTime, ss);
        se = Math.min(toTime, se);
        if (ss > cursor && (ss - cursor) >= minKeep) ranges.push({ start: cursor, end: ss });
        if (se > cursor) cursor = se;
    }
    if (toTime > cursor && (toTime - cursor) >= minKeep) ranges.push({ start: cursor, end: toTime });
    return ranges;
}
function dekuki_416_selectOnly(comp, layer) {
    try {
        for (var i = 1; i <= comp.numLayers; i++) comp.layer(i).selected = false;
        layer.selected = true;
    } catch (e) {}
}
function dekukiApplySilenceCutsSmartFromJSON(silenceJson, mode, pad, minKeep, breathClose, leadPad) {
    try {
        var comp = dekuki_415_comp();
        if (!comp) return dekuki_415_err("No active composition");
        var layers = dekuki_415_selectedAV(comp);
        if (!layers.length) return dekuki_415_err("Select the video/audio layers you want Smart Cut to cut");
        var audio = dekuki_415_selectedAudio(comp);
        var offset = audio ? audio.startTime : 0;
        var silences = dekuki_415_parseSilences(silenceJson);
        if (!silences.length) return dekuki_415_err("No silence ranges were detected. Press Detect first, or use a more aggressive preset.");
        mode = String(mode || "packed");
        if (mode === "markers") return dekukiCreateSilenceMarkersFromJSON(silenceJson, pad);
        app.beginUndoGroup("DeKuki Smart Auto Cut");
        var made = 0;
        var disabled = 0;
        var selectedCopies = [];
        for (var li = 0; li < layers.length; li++) {
            var layer = layers[li];
            var ranges = dekuki_416_keepRangesSmart(silences, layer.inPoint, layer.outPoint, offset, pad, minKeep, breathClose, leadPad);
            if (!ranges.length) continue;
            var packCursor = layer.inPoint;
            for (var r = 0; r < ranges.length; r++) {
                var a = ranges[r].start;
                var b = ranges[r].end;
                var dur = b - a;
                if (dur < Math.max(0.02, dekuki_415_num(minKeep, 0.08))) continue;
                var dup = layer.duplicate();
                dup.name = "CUT " + (r + 1) + " - " + layer.name;
                if (mode === "packed") {
                    dup.startTime = layer.startTime + (packCursor - a);
                    dup.inPoint = packCursor;
                    dup.outPoint = packCursor + dur;
                    packCursor += dur;
                } else {
                    dup.startTime = layer.startTime;
                    dup.inPoint = a;
                    dup.outPoint = b;
                }
                try { dup.moveBefore(layer); } catch (eMove) {}
                try { dup.label = 9; } catch (eLabel) {}
                selectedCopies.push(dup);
                made++;
            }
            if (made > 0) {
                try { layer.enabled = false; disabled++; } catch (eDisable) {}
                try { layer.shy = true; comp.hideShyLayers = true; } catch (eShy) {}
            }
        }
        try {
            for (var s = 1; s <= comp.numLayers; s++) comp.layer(s).selected = false;
            for (var c = 0; c < selectedCopies.length; c++) selectedCopies[c].selected = true;
        } catch (eSel) {}
        app.endUndoGroup();
        return dekuki_415_ok("Smart Cut created " + made + " trimmed clip pieces and hid " + disabled + " original layer(s). For breath cuts use Preset: Breaths or Fast Cuts, then Detect again.");
    } catch (e) { try { app.endUndoGroup(); } catch (x) {} return dekuki_415_err(e.toString()); }
}
try { $.global.dekukiApplySilenceCutsSmartFromJSON = dekukiApplySilenceCutsSmartFromJSON; } catch (e) {}


// ==================== DEKUKI ANIMATE TAB FUNCTIONS ====================

function dekukiApplyTextAnimation(cfgJson) {
    try {
        var comp = dekuki_getActiveComp();
        var layers = dekuki_collectTextLayers(comp, true);
        if (!layers.length) return dekuki_error(new Error("No text layers selected. Select text layers in the comp first."));

        var cfg;
        try { cfg = JSON.parse(cfgJson || "{}"); } catch(pe) { cfg = {}; }

        var entranceType    = cfg.entranceType    || "slideUp";
        var per             = cfg.per             || "char";
        var dur             = isNaN(parseFloat(cfg.duration))  ? 0.5  : Math.max(0.05, parseFloat(cfg.duration));
        var delay           = isNaN(parseFloat(cfg.delay))     ? 0.04 : Math.max(0,    parseFloat(cfg.delay));
        var contType        = cfg.contType        || "none";
        var contSpeed       = isNaN(parseFloat(cfg.contSpeed)) ? 1.2  : Math.max(0.2,  parseFloat(cfg.contSpeed));
        var fillColor       = cfg.fillColor       || "";
        var strokeColor     = cfg.strokeColor     || "";

        app.beginUndoGroup("DeKuki Apply Animation");

        for (var li = 0; li < layers.length; li++) {
            var layer   = layers[li];
            var textProp = layer.property("ADBE Text Properties");

            // ── Apply fill / stroke color ──────────────────────────────
            if (fillColor || strokeColor) {
                var doc = textProp.property("ADBE Text Document").value;
                if (fillColor) {
                    doc.applyFill  = true;
                    doc.fillColor  = dekuki_hexToRgb(fillColor);
                }
                if (strokeColor) {
                    doc.applyStroke  = true;
                    doc.strokeColor  = dekuki_hexToRgb(strokeColor);
                    if (!doc.strokeWidth || doc.strokeWidth < 0.5) doc.strokeWidth = 3;
                }
                textProp.property("ADBE Text Document").setValue(doc);
            }

            if (entranceType === "none" && contType === "none") continue;

            var animators = textProp.property("ADBE Text Animators");

            // Remove previous DeKuki animators
            for (var ai = animators.numProperties; ai >= 1; ai--) {
                try {
                    var an = animators.property(ai);
                    if (String(an.name).indexOf("DeKuki") === 0) an.remove();
                } catch(re2) {}
            }

            // ── Build entrance text animator ───────────────────────────
            if (entranceType !== "none") {
                var anGroup = animators.addProperty("ADBE Text Animator");
                anGroup.name = "DeKuki Entrance";
                var anProps  = anGroup.property("ADBE Text Animator Properties");

                // Opacity always drives entrance visibility
                var opProp = anProps.addProperty("ADBE Text Opacity");
                opProp.setValue(0);

                var posProp = null, scaleProp = null, rotProp = null, blurProp = null;
                if (entranceType === "slideUp")   { posProp   = anProps.addProperty("ADBE Text Position 3D"); posProp.setValue([0,  20, 0]); }
                if (entranceType === "slideDown")  { posProp   = anProps.addProperty("ADBE Text Position 3D"); posProp.setValue([0, -20, 0]); }
                if (entranceType === "slideLeft")  { posProp   = anProps.addProperty("ADBE Text Position 3D"); posProp.setValue([20,  0, 0]); }
                if (entranceType === "scale")      { scaleProp = anProps.addProperty("ADBE Text Scale 3D");    scaleProp.setValue([0, 0, 100]); }
                if (entranceType === "rotate")     { rotProp   = anProps.addProperty("ADBE Text Rotation");   rotProp.setValue(45); }
                if (entranceType === "blur") {
                    try { blurProp = anProps.addProperty("ADBE Text Blur"); blurProp.setValue(15); } catch(be) {}
                }

                // Range selector animated from 0 → 100%
                var sels      = anGroup.property("ADBE Text Selectors");
                var sel       = sels.addProperty("ADBE Text Range Selector");
                sel.name      = "Selector";
                var startProp = sel.property("ADBE Text Range Start");
                var endProp   = sel.property("ADBE Text Range End");
                endProp.setValue(100);

                // Selector unit: 1=chars, 2=words
                try {
                    var unitsProp = sel.property("ADBE Text Range Units");
                    if (unitsProp) unitsProp.setValue(per === "word" ? 2 : 1);
                } catch(ue) {}

                var fps       = comp.frameRate;
                var inPt      = layer.inPoint;
                var totalDur  = dur + delay * (entranceType === "typewriter" ? 20 : 10);

                try {
                    startProp.setValueAtTime(inPt,           0);
                    startProp.setValueAtTime(inPt + totalDur, 100);
                    // Smooth easing
                    var keys = startProp.numKeys;
                    if (keys >= 2) {
                        startProp.setInterpolationTypeAtKey(1, KeyframeInterpolationType.EASY_EASE_OUT);
                        startProp.setInterpolationTypeAtKey(2, KeyframeInterpolationType.EASY_EASE_IN);
                    }
                } catch(ke) {}
            }

            // ── Continuous animation via expression ────────────────────
            if (contType !== "none") {
                var posLayer = layer.property("Position");
                if (posLayer) {
                    var expr = "";
                    var spd  = contSpeed;
                    if (contType === "float") {
                        expr = "var t=time*" + (2/spd).toFixed(3) + "; value+[0,Math.sin(t)*4,0];";
                    } else if (contType === "pulse") {
                        expr = "var s=1+Math.sin(time*" + (6.28/spd).toFixed(3) + ")*0.04; [value[0]*s,value[1]*s];";
                    } else if (contType === "wigglePos") {
                        expr = "wiggle(" + (2/spd).toFixed(2) + ",3);";
                    }
                    if (expr) {
                        try { posLayer.expression = expr; } catch(ee) {}
                    }
                }
            }
        }

        app.endUndoGroup();
        return dekuki_ok("Applied \"" + entranceType + "\" to " + layers.length + " layer(s)");
    } catch(e) {
        try { app.endUndoGroup(); } catch(ig) {}
        return dekuki_error(e);
    }
}

function dekukiClearTextAnimation() {
    try {
        var comp   = dekuki_getActiveComp();
        var layers = dekuki_collectTextLayers(comp, true);
        if (!layers.length) return dekuki_error(new Error("No text layers selected."));

        app.beginUndoGroup("DeKuki Clear Animation");
        var cleared = 0;
        for (var li = 0; li < layers.length; li++) {
            var layer     = layers[li];
            var textProp  = layer.property("ADBE Text Properties");
            var animators = textProp.property("ADBE Text Animators");
            for (var ai = animators.numProperties; ai >= 1; ai--) {
                try { animators.property(ai).remove(); cleared++; } catch(re) {}
            }
            try {
                var pos = layer.property("Position");
                if (pos && pos.expression) pos.expression = "";
            } catch(ee) {}
        }
        app.endUndoGroup();
        return dekuki_ok("Cleared animators from " + layers.length + " layer(s) (" + cleared + " removed)");
    } catch(e) {
        try { app.endUndoGroup(); } catch(ig) {}
        return dekuki_error(e);
    }
}

// Register new functions
try {
    $.global.dekukiApplyTextAnimation = dekukiApplyTextAnimation;
    $.global.dekukiClearTextAnimation  = dekukiClearTextAnimation;
} catch(e) {}
