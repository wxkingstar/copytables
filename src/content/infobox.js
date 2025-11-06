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

    return h;
}

function copyToClipboard(text) {
    console.log('[CopyTables] Attempting to copy:', text);

    // Try modern Clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text).then(function() {
            console.log('[CopyTables] ✓ Copy successful (Clipboard API)');
            return true;
        }).catch(function(err) {
            console.log('[CopyTables] Clipboard API failed, using fallback:', err);
            return fallbackCopy(text);
        });
    }
    return fallbackCopy(text);
}

function fallbackCopy(text) {
    // Fallback method using execCommand
    console.log('[CopyTables] Using fallback copy method (execCommand)');

    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    try {
        var successful = document.execCommand('copy');
        document.body.removeChild(textarea);

        if (successful) {
            console.log('[CopyTables] ✓ Copy successful (execCommand)');
        } else {
            console.log('[CopyTables] ✗ Copy failed (execCommand)');
        }

        return successful ? Promise.resolve(true) : Promise.resolve(false);
    } catch (err) {
        console.log('[CopyTables] ✗ Copy error:', err);
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
    var box = dom.create('div', {
        id: boxId,
        'data-position': preferences.val('infobox.position') || '0'
    });
    document.body.appendChild(box);

    box.addEventListener('click', function (e) {
        var target = e.target;

        // Close button clicked
        if (dom.tag(target) === 'SPAN') {
            hide();
            return;
        }

        // Find the stat item (could be clicking on <b> or <i> inside it)
        var statItem = target;
        if (dom.tag(target) === 'I') {
            statItem = target.parentElement;
        }

        // Check if it's a stat item
        if (dom.tag(statItem) === 'B' && statItem.classList.contains('stat-item')) {
            console.log('[CopyTables] Stat item clicked:', statItem);

            var value = statItem.getAttribute('data-value');
            var statName = statItem.getAttribute('data-stat-name');

            console.log('[CopyTables] Stat name:', statName, 'Value:', value);

            if (value) {
                copyToClipboard(value).then(function(success) {
                    if (success) {
                        console.log('[CopyTables] Showing feedback animation');
                        showCopyFeedback(statItem);
                    } else {
                        console.log('[CopyTables] Copy failed, no feedback shown');
                    }
                });
            } else {
                console.log('[CopyTables] No value found to copy');
            }
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
