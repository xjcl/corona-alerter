// past times are fixed and unchanging, future times predictions
// TODO: differentiate open and close times
// TODO: typescript this and use an IDE

var times = [];
for (var i = 0; i < 1440; ++i) { times[i] = 0; }

var library = {"reset":{"Volume":{"Master":0.8}}};
var sfx = jsfx.Sounds(library);

var config = {};

function sleep(s) {
    return new Promise(resolve => setTimeout(resolve, 1000*s));
}

function timeNow(now) {
    return 60 * now.getHours() + now.getMinutes();
}

// check every minute in case user recalibrated the schedule
async function minutely() {
    while (true) {
        const now = new Date();
        const time = timeNow(now);
        console.log(`enter loop at ${time} | ${now}`);
        if (times[time])
            for (var i = 0; i < times[time]; ++i)
                setTimeout(sfx.reset, i * 600);

        redrawCanvas(config.hrsLo, config.hrsHi);
        await sleep(60 - now.getSeconds());
    }
}

// Draw from hrsLo to hrsHi
//  with width-only supersample antialiasing to increase text quality
function redrawCanvas(hrsLo, hrsHi) {
    const SSAA = Math.round(24 / (hrsHi - hrsLo));
    console.log(`call to redrawCanvas(${hrsLo}, ${hrsHi}, ${SSAA})`);
    var now = timeNow(new Date())

    var canvas = document.getElementById("canvas_times");
    // canvas.width = SSAA * 60*(24 - hrsHi - hrsLo);
    canvas.width = SSAA * 60*(24 - (24-hrsHi) - hrsLo);
    canvas.height = canvas.width / 9;
    var context = canvas.getContext("2d");

    context.fillStyle = "red";
    for (var i = 0; i < 1440; i++) {
        if (times[i]) {
            context.fillRect((i - 60*hrsLo) * SSAA, canvas.height/5, SSAA, canvas.height);
        }
    }

    context.fillStyle = "green";
    context.fillRect((now - 60*hrsLo)*SSAA, canvas.height/5, SSAA, canvas.height);

    var fontArgs = context.font.split(' ');
    var newSize = '' + (canvas.height/10) + 'px';
    context.font = newSize + ' ' + fontArgs[fontArgs.length - 1];

    context.fillStyle = "blue";
    context.textAlign = "center";
    for (var i = 0; i < 25; i++) {
        context.fillText(`${i}:00`, 60*(i-hrsLo)*SSAA, 10*canvas.height/100);
        context.fillRect(60*(i-hrsLo)*SSAA, 12.5*canvas.height/100, SSAA, 5*canvas.height/100);
    }

    // var img = canvas.toDataURL("image/png");
    // var img_times = document.getElementById("img_times");
    // img_times.src = img;
}

// build future times array
function recalibrate(openMins, closedMins) {
    console.log(`call to recalibrate(${openMins}, ${closedMins})`);
    var now = timeNow(new Date())
    var time = now + 1;

    for (var i = time; i < 1440; i++) {
        times[i] = 0;
    }

    while (time < 1440) {
        if (time >= 1440) break;
        times[time] = 1;
        time += openMins;

        if (time >= 1440) break;
        times[time] = 2;
        time += closedMins;
    }
    console.log(times);
}

function buttonClick() {
    parseInt(document.getElementById('openMins')).value = "Recalibrate";
    config.openMins = parseInt(document.getElementById('openMins').value);
    config.closedMins = parseInt(document.getElementById('closedMins').value);
    config.hrsLo = parseInt(document.getElementById('hrsLo').value);
    config.hrsHi = parseInt(document.getElementById('hrsHi').value);
    for (var key in config) { console.log(`config.${key}`, config[key]); }
    recalibrate(config.openMins, config.closedMins);
    redrawCanvas(config.hrsLo, config.hrsHi);
}
