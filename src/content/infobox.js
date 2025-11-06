/// Display diverse functions when dragging over a table

var M = module.exports = {};

var cell = require('../lib/cell'),
    dom = require('../lib/dom'),
    event = require('../lib/event'),
    preferences = require('../lib/preferences'),
    number = require('../lib/number');


function getValue(td, fmt) {
    var val = {text: '', number: 0, isNumber: false};

    dom.textContentItems(td).some(function (t) {
        var n = number.extract(t, fmt);
        if (n !== null) {
            return val = {text: t, number: n, isNumber: true};
        }
    });

    return val;
}

function data(tbl) {
    if (!tbl) {
        return null;
    }

    var cells = cell.findSelected(tbl);

    if (!cells || !cells.length) {
        return null;
    }

    var fmt = preferences.numberFormat();
    var values = [];

    cells.forEach(function (td) {
        values.push(getValue(td, fmt));
    });

    return preferences.infoFunctions().map(function (f) {
        return {
            title: f.name + ':',
            message: f.fn(values)
        }
    });
};

var
    boxId = '__copytables_infobox__',
    pendingContent = null,
    timer = 0,
    freq = 500;

function getBox() {
    return dom.findOne('#' + boxId);
}

function setTimer() {
    if (!timer)
        timer = setInterval(draw, freq);
}

function clearTimer() {
    clearInterval(timer);
    timer = 0;
}

function html(items, sticky) {
    var h = [];

    items.forEach(function (item) {
        if (item.message !== null) {
            // Make each stat item clickable with data attributes
            h.push(' <b class="stat-item" data-value="' + item.message + '" data-stat-name="' + item.title.replace(':', '') + '" title="Click to copy">' +
                   item.title + '<i>' + item.message + '</i></b>');
        }
    });

    h = h.join('');

    if (sticky) {
        h += '<span>&times;</span>';
    } else {
        h += '<b></b>';
    }

    // Version indicator for debugging
    h += '<b class="version" style="font-size:9px;opacity:0.5;padding:0 8px;">v2.0</b>';

    return h;
}

function copyToClipboard(text) {
    console.log('[CopyTables] ===== COPY FUNCTION CALLED =====');
    console.log('[CopyTables] Attempting to copy:', text);
    console.log('[CopyTables] Text type:', typeof text);
    console.log('[CopyTables] Text length:', text ? text.length : 0);

    // In content scripts, execCommand is more reliable than Clipboard API
    // Try execCommand first for better compatibility
    var result = fallbackCopy(text);

    // If fallback failed and Clipboard API is available, try it as backup
    if (!result && navigator.clipboard && navigator.clipboard.writeText) {
        console.log('[CopyTables] execCommand failed, trying Clipboard API...');
        return navigator.clipboard.writeText(text).then(function() {
            console.log('[CopyTables] ✓ Copy successful (Clipboard API)');
            return true;
        }).catch(function(err) {
            console.log('[CopyTables] ✗ Clipboard API also failed:', err);
            return false;
        });
    }

    return result;
}

function fallbackCopy(text) {
    // Fallback method using execCommand
    console.log('[CopyTables] Using execCommand copy method');

    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '0';
    textarea.style.opacity = '0';
    textarea.setAttribute('readonly', '');
    console.log('[CopyTables] Created textarea element');

    document.body.appendChild(textarea);
    console.log('[CopyTables] Textarea appended to body');

    // Select the text
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    console.log('[CopyTables] Text selected, selection:', textarea.selectionStart, '-', textarea.selectionEnd);

    try {
        var successful = document.execCommand('copy');
        console.log('[CopyTables] execCommand result:', successful);

        document.body.removeChild(textarea);
        console.log('[CopyTables] Textarea removed');

        if (successful) {
            console.log('[CopyTables] ✓✓✓ Copy successful (execCommand) ✓✓✓');
            return Promise.resolve(true);
        } else {
            console.log('[CopyTables] ✗✗✗ Copy failed (execCommand) ✗✗✗');
            return Promise.resolve(false);
        }
    } catch (err) {
        console.log('[CopyTables] ✗✗✗ Copy error (execCommand):', err);
        document.body.removeChild(textarea);
        return Promise.resolve(false);
    }
}

function showCopyFeedback(element) {
    var originalTitle = element.getAttribute('title');
    element.setAttribute('title', 'Copied!');
    element.classList.add('copied');

    setTimeout(function() {
        element.setAttribute('title', originalTitle);
        element.classList.remove('copied');
    }, 1000);
}

function init() {
    console.log('[CopyTables] Initializing infobox v2.0 with click-to-copy');

    var box = dom.create('div', {
        id: boxId,
        'data-position': preferences.val('infobox.position') || '0'
    });
    document.body.appendChild(box);

    box.addEventListener('click', function (e) {
        var target = e.target;

        console.log('[CopyTables] ===================================');
        console.log('[CopyTables] CLICK EVENT TRIGGERED!');
        console.log('[CopyTables] Click detected on:', target.tagName, target.className);
        console.log('[CopyTables] Target element:', target);
        console.log('[CopyTables] Target outerHTML:', target.outerHTML);

        // Close button clicked
        if (dom.tag(target) === 'SPAN') {
            console.log('[CopyTables] Close button clicked');
            hide();
            return;
        }

        // Find the stat item (could be clicking on <b> or <i> inside it)
        var statItem = target;
        if (dom.tag(target) === 'I') {
            statItem = target.parentElement;
            console.log('[CopyTables] Clicked on <i>, getting parent <b>');
        }

        console.log('[CopyTables] Checking statItem:', statItem);
        console.log('[CopyTables] statItem tag:', dom.tag(statItem));
        console.log('[CopyTables] statItem has stat-item class?', statItem.classList.contains('stat-item'));

        // Check if it's a stat item
        if (dom.tag(statItem) === 'B' && statItem.classList.contains('stat-item')) {
            console.log('[CopyTables] *** STAT ITEM CLICKED ***');

            // Visual feedback immediately to confirm click works
            statItem.style.backgroundColor = 'yellow';
            setTimeout(function() {
                statItem.style.backgroundColor = '';
            }, 200);

            var value = statItem.getAttribute('data-value');
            var statName = statItem.getAttribute('data-stat-name');

            console.log('[CopyTables] Stat name:', statName);
            console.log('[CopyTables] Value:', value);
            console.log('[CopyTables] Value type:', typeof value);

            if (value) {
                console.log('[CopyTables] Calling copyToClipboard with:', value);
                copyToClipboard(value).then(function(success) {
                    console.log('[CopyTables] Copy promise resolved, success:', success);
                    if (success) {
                        console.log('[CopyTables] Showing feedback animation');
                        showCopyFeedback(statItem);
                    } else {
                        console.log('[CopyTables] ✗ Copy failed, no feedback shown');
                        // Show error feedback
                        statItem.style.backgroundColor = 'red';
                        setTimeout(function() {
                            statItem.style.backgroundColor = '';
                        }, 500);
                    }
                });
            } else {
                console.log('[CopyTables] ✗ No value found to copy');
            }
        } else {
            console.log('[CopyTables] Not a stat item.');
            console.log('[CopyTables] - Tag:', dom.tag(statItem));
            console.log('[CopyTables] - Classes:', statItem.className);
            console.log('[CopyTables] - classList:', statItem.classList);
        }
    });

    return box;
}

function draw() {
    if (!pendingContent) {
        //console.log('no pendingContent');
        clearTimer();
        return;
    }

    if (pendingContent === 'hide') {
        //console.log('removed');
        dom.remove([getBox()]);
        clearTimer();
        return;
    }

    var box = getBox() || init();

    dom.removeClass(box, 'hidden');
    box.innerHTML = pendingContent;

    pendingContent = null;
    //console.log('drawn');
}

function show(items) {
    var p = html(items, preferences.val('infobox.sticky'));

    if (p === pendingContent) {
        //console.log('same content');
        return;
    }

    if (pendingContent) {
        //console.log('queued');
    }

    pendingContent = p;
    setTimer();
}

function hide() {
    //console.log('about to remove...');
    pendingContent = 'hide';
    dom.addClass(getBox(), 'hidden');
    setTimer();
}

M.update = function (tbl) {
    if (preferences.val('infobox.enabled')) {
        var d = data(tbl);
        if (d && d.length)
            show(d);
    }
};

M.remove = function () {
    if (!preferences.val('infobox.sticky')) {
        hide();
    }
};
