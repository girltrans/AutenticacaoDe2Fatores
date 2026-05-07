const secretInput = document.getElementById('secret');
const otpDisplay = document.getElementById('otp');
const otpPrev = document.getElementById('otp-prev');
const otpNext = document.getElementById('otp-next');
const otpPrevContainer = document.getElementById('otp-prev-container');
const otpNextContainer = document.getElementById('otp-next-container');
var currentOtp = "000000";
otpDisplay.addEventListener('click', () => {
    if (currentOtp !== "000000") {
        copyTextToClipboard(currentOtp);
    }
});
if (window.tippy) {
    tippy(otpDisplay, {
        content: "Copiado!",
        trigger: 'click',
        theme: 'translucent',
        animation: 'shift-away',
        zIndex: 99999,
        offset: [0, -30],
        onShow(instance) {
            setTimeout(() => instance.hide(), 1200);
        }
    });
}
function calculateTOTP(secret, offset = 0) {
    try {
        const key = base32tohex(secret);
        if (!key) return "000000";
        const epoch = Math.round(new Date().getTime() / 1000);
        const time = leftpad(dec2hex(Math.floor(epoch / 30) + offset), 16, '0');
        const shaObj = new jsSHA("SHA-1", "HEX");
        shaObj.setHMACKey(key, "HEX");
        shaObj.update(time);
        const hmac = shaObj.getHMAC("HEX");
        const hmacOffset = hex2dec(hmac.substring(hmac.length - 1));
        let otp = (hex2dec(hmac.substr(hmacOffset * 2, 8)) & hex2dec('7fffffff')) + '';
        return otp.substring(otp.length - 6);
    } catch (e) { 
        return "000000"; 
    }
}
function updateInterface() {
    const secretKey = secretInput.value.replace(/\s/g, '');
    let success = false;
    let codeCurr = "000000";

    if (secretKey.length >= 16) {
        codeCurr = calculateTOTP(secretKey, 0);
        if (codeCurr !== "000000") {
            success = true;
        }
    }
    if (success) {
        currentOtp = codeCurr;
        otpDisplay.setAttribute('value', String(codeCurr));
        otpPrev.setAttribute('value', String(calculateTOTP(secretKey, -1)));
        otpNext.setAttribute('value', String(calculateTOTP(secretKey, 1)));
        otpDisplay.style.opacity = '1';
        otpPrevContainer.style.opacity = '1';
        otpNextContainer.style.opacity = '1';
    } else {
        currentOtp = "000000";
        otpDisplay.setAttribute('value', '000000');
        otpPrev.setAttribute('value', '000000');
        otpNext.setAttribute('value', '000000');
        otpDisplay.style.opacity = '0.5';
        otpPrevContainer.style.opacity = '0.5';
        otpNextContainer.style.opacity = '0.5';
    }
}

secretInput.addEventListener('input', updateInterface);

function timer() {
    const epoch = Math.round(new Date().getTime() / 1000);
    const countDown = 30 - (epoch % 30);
    const counterEl = document.getElementById('updatingIn');
    if (counterEl) counterEl.innerHTML = countDown;
    if (countDown === 30) {
        updateInterface();
    }
}
function leftpad(str, len, pad) { if (len + 1 >= str.length) { str = Array(len + 1 - str.length).join(pad) + str; } return str; }
function dec2hex(s) { return (s < 15.5 ? '0' : '') + Math.round(s).toString(16); }
function hex2dec(s) { return parseInt(s, 16); }

function base32tohex(base32) {
    var base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    var bits = ""; var hex = "";
    for (var i = 0; i < base32.length; i++) {
        var val = base32chars.indexOf(base32.charAt(i).toUpperCase());
        if (val === -1) return null;
        bits += leftpad(val.toString(2), 5, '0');
    }
    for (var i = 0; i + 4 <= bits.length; i += 4) {
        var chunk = bits.substr(i, 4);
        hex = hex + parseInt(chunk, 2).toString(16);
    }
    return hex;
}
function copyTextToClipboard(text) {
    if (!navigator.clipboard) {
        var textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea); textArea.select();
        document.execCommand('copy'); document.body.removeChild(textArea);
        return;
    }
    navigator.clipboard.writeText(text);
}
setInterval(timer, 1000);
updateInterface();
timer();
