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
            // Add a span with a class for styling and an event listener for copying
            h.push(' <b class="copyable-stat" title="Click to copy">' + item.title + '<i class="value">' + item.message + '</i></b>');
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

function init() {
    var box = dom.create('div', {
        id: boxId,
        'data-position': preferences.val('infobox.position') || '0'
    });
    document.body.appendChild(box);

    box.addEventListener('click', function (e) {
        if (dom.tag(e.target) === 'SPAN' && e.target.textContent === '×') { // Close button
            hide();
        } else if (e.target.closest('.copyable-stat')) {
            var statElement = e.target.closest('.copyable-stat');
            var valueElement = statElement.querySelector('.value');
            if (valueElement) {
                var valueText = valueElement.textContent;
                navigator.clipboard.writeText(valueText).then(function () {
                    // Briefly indicate success
                    statElement.classList.add('copied');
                    setTimeout(function () {
                        statElement.classList.remove('copied');
                    }, 1000);
                }).catch(function (err) {
                    console.error('Failed to copy text: ', err);
                    // Optionally, indicate failure to the user
                    statElement.classList.add('copy-failed');
                    setTimeout(function () {
                        statElement.classList.remove('copy-failed');
                    }, 1000);
                });
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
