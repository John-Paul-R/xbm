//Credit: Tobspr
function Hex2Bin(n) {
    if (!checkHex(n)) return 0;
    return parseInt(n, 16).toString(2)
}

//Useful Functions
function checkBin(n) {
    return /^[01]{1,64}$/.test(n)
}

function checkDec(n) {
    return /^[0-9]{1,64}$/.test(n)
}

function checkHex(n) {
    return /^[0-9A-Fa-f]{1,64}$/.test(n)
}

function pad(s, z) {
    s = "" + s;
    return s.length < z ? pad("0" + s, z) : s
}

function unpad(s) {
    s = "" + s;
    return s.replace(/^0+/, '')
}

//Decimal operations
function Dec2Bin(n) {
    if (!checkDec(n) || n < 0) return 0;
    return n.toString(2)
}

function Dec2Hex(n) {
    if (!checkDec(n) || n < 0) return 0;
    return n.toString(16)
}

//Binary Operations
function Bin2Dec(n) {
    if (!checkBin(n)) return 0;
    return parseInt(n, 2).toString(10)
}

function Bin2Hex(n) {
    if (!checkBin(n)) return 0;
    return parseInt(n, 2).toString(16)
}

//Hexadecimal Operations
function Hex2Bin(n) {
    if (!checkHex(n)) {
        console.warn("NOT HEX", n);
        return 0;
    }
    return pad(parseInt(n, 16).toString(2), 8 * 4);
}

function Hex2Dec(n) {
    if (!checkHex(n)) return 0;
    return parseInt(n, 16).toString(10)
}

let image = `
  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    <rect style="stroke-width: 10; stroke: #666;" width="100%" height="100%" fill="#d4d0c8" />
    <text transform="translate(0, 9)" x="50%" y="50%" width="100%" fill="#666" height="100%" style="text-anchor: middle; font: bold 10pt 'Segoe UI', Arial, Helvetica, Sans-serif;">Blocked (custiom - JP)</text>
  </svg>
`;

chrome.webRequest.onBeforeRequest.addListener(
    function (info) {
        const request = new XMLHttpRequest();
        // chrome won't allow async on the event
        request.open("GET", info.url, false); // `false` makes the request synchronous
        request.send(null);

        if (request.status !== 200) {
            return undefined;
        }
        const resText = request.responseText;

        const redirectUrl = `data:image/svg+xml,${encodeURIComponent(image)}`;
        // return { redirectUrl };

        console.log("Cat intercepted: " + info.url);

        // const res = await fetch(info.url, {
        //     method: 'GET'
        // });

        /** @type {Array<string>}*/
        var lines = (resText).split("\n");
        var xbm = new Object();

        function extractNumber() {
            return lines[line].match(/[0-9]+/)[0];
        }

        function extractNumberV2(str) {
            return str.match(/[0-9]+/)[0];
        }

        var imgWidth = -1;
        var imgHeight = -1;
        var widthIndex = 0;
        var lineBits = "";
        var pixelBrightnesses = []
        for (line = 0; line < lines.length; line++) {
            console.log(lines[line]);
        }

        const hexExtractorPattern = /0x([0-9a-f]{2})/i;

        /**
         * @param str {string}
         * @returns {string | null} the matched hex val
         */
        function extractHex(str) {
            const match = str.match(hexExtractorPattern);
            return match ? match[1] : null;
        }

        var idxOfTarget = -1;
        for (line = 0; line < lines.length; line++) {
            if (lines[line].indexOf("#define") == -1) { //data
                var values = lines[line].split(",");

                for (var i = 0; i < values.length; i++) {
                    var hexBits = values[i].replace("0x", "").trim();
                    if (!hexBits[0]) {
                        if (hexBits[0] && hexBits[0].length > 0) {
                            console.log("error on " + line + "," + i + "  > " + values[i] + " < - len: " + values[i].length);
                        } //EOL
                        continue;
                    }

                    lineBits += "" + Hex2Bin(hexBits); //Hex2Bin(hexBits[0])+""+Hex2Bin(hexBits[1]);
                }

                const hex = values
                    .map(v => v.trim())
                    .filter(v => v.includes('0x'))
                    .map(extractHex);
                const bin = hex.map(vStr => Hex2Bin(vStr));
                console.log("VALUES", values, hex, bin);
                pixelBrightnesses.push(...bin
                    .flatMap(binStr => binStr.split('').map(v => v === '1'))
                );
            } else if ((idxOfTarget = lines[line].indexOf("width")) > -1) { // width definition
                imgWidth = parseInt(extractNumberV2(lines[line].slice(idxOfTarget)), 10);
                console.log("WIDTH EXTRACT", lines[line], imgWidth, [
                    lines[line].slice(idxOfTarget),
                    extractNumberV2(lines[line].slice(idxOfTarget)),
                    parseInt(extractNumberV2(lines[line].slice(idxOfTarget)), 10),
                ])
                console.log("width: " + extractNumberV2(lines[line]));
            } else if ((idxOfTarget = lines[line].indexOf("height")) > -1) { // height definition
                imgHeight = parseInt(extractNumberV2(lines[line].slice(idxOfTarget)), 10);
                console.log("height: " + extractNumberV2(lines[line]));
            } else if (lines[line].indexOf("x_hot") > -1) { // x hotspot
                console.log("x hot: " + extractNumber(lines[line]));
            } else if (lines[line].indexOf("y_hot") > -1) { // y hotspot
                console.log("y hot: " + extractNumber(lines[line]));
            }
            //console.log(lines[line]);
        }

        //echo data
        // for (var line = 0; line < imgHeight; line++) {
        //     var output = "";
        //     for (var pixel = 0; pixel < imgWidth; pixel++) {
        //         output += "" + lineBits[imgWidth * line + pixel];
        //         //console.log((imgWidth*line+pixel);
        //     }
        //     console.log(output.replace(/0/g, " ").replace(/1/g, "X"));
        // }
        console.log("pxb", pixelBrightnesses)
        // console.log(lineBits)

        const imageUrl = renderImageToBlobUrl(imgWidth, imgHeight, pixelBrightnesses)
        // .then(url => {
        //     const imgElem = document.createElement('img');
        //     imgElem.src = url;
        //     console.log(imgElem, imgElem.src);
        //     document.body.appendChild(imgElem);
        // });
        console.log("imageUrl", imageUrl);
        return {
            redirectUrl: imageUrl,
        };
        //console.log(lines.length);
        //console.log(resp.length);
        //console.log(resp);

        // Redirect the lolcal request to a random loldog URL.
        //var i = Math.round(Math.random() * loldogs.length);
        //return {redirectUrl: loldogs[i]};
    },
    // filters
    {
        urls: [
            "http://*/*.xbm", "https://*/*.xbm"
        ],
        types: ["main_frame", "sub_frame", "stylesheet", "script", "image", "object", "other"]
    },
    // extraInfoSpec
    ["blocking"]);

chrome.webRequest.onResponseStarted.addListener(function (deets) {
        //console.log(deets);
    },
    {
        urls: [
            "http://*/*.xbm", "https://*/*.xbm"
        ],
        types: ["main_frame", "sub_frame", "stylesheet", "script", "image", "object", "xmlhttprequest", "other"]
    }, ["responseHeaders"]);

/**
 *
 * @param width
 * @param height
 * @param data pixel brightness data, 1 elem per pixel
 *
 * @returns string
 */
function renderImageToBlobUrl(width, height, data) {
    console.log("RENDER BLOB", width, height, data);
    // const canvas = new OffscreenCanvas(width, height);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(width, height);
    fillImageData(data, imageData.data);
    ctx.putImageData(imageData, 0, 0)
    return canvas.toDataURL();
}

/**
 * @param data {Array<boolean>} pixel brightness data, 1 elem per pixel
 * @param out {Uint8ClampedArray}
 * @returns rgba image data, 4 elems per pixel (clamped to [0,255])
 */
function fillImageData(data, out) {
    console.log(data.length, out.length)
    for (let i = 0; i < data.length; i += 4) {
        const v = data[i] ? 255 : 0;
        out[i] = v;
        out[i + 1] = v;
        out[i + 2] = v;
        out[i + 3] = 255;
    }
}
