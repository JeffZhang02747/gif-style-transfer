transfer = require('./transfer.js');

let styleNet;
let transformNet;

async function runTransfer(){
    const style_ratio = 1.0;
    const fetchUrl = document.getElementById('origin-gif').src;
    const animatedImage = document.getElementById('style-img');
    const trans = transfer.gifTransfer(fetchUrl, animatedImage, styleNet, transformNet, style_ratio);

    const transfer_span = document.getElementById('transfer-gif-div');
    document.getElementById('style-button').disabled = true;
    for await(const img of trans){
        transfer_span.innerHTML = "";
        transfer_span.appendChild(img);
    }
    document.getElementById('style-button').disabled = false;
}

window.addEventListener('load', async () => {
    styleNet = await transfer.loadMobileNetStyleModel();
    transformNet = await transfer.loadSeparableTransformerModel();
    document.getElementById('style-button').onclick = runTransfer;
});