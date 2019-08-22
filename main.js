transfer = require('./transfer.js');

let styleNet;
let transformNet;

async function runTransfer(){
    const transfer_span = document.getElementById('transfer-gif-div');
    transfer_span.innerHTML = "";
    const spining = document.createElement("img");
    spining.src = "/static/loading.gif";
    transfer_span.appendChild(spining);

    const style_ratio = 1.0;
    const fetchUrl = document.getElementById('origin-gif').src;
    const animatedImage = document.getElementById('style-img');
    const trans = transfer.gifTransfer(fetchUrl, animatedImage, styleNet, transformNet, style_ratio);

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


var cors_url = 'https://sheltered-tor-32003.herokuapp.com/';

function getPreview(preview, file_ele){
    return function(){
       var file    = file_ele.files[0]; //sames as here
       var reader  = new FileReader();

       reader.onloadend = function () {
          preview.src = reader.result;
       }

       if (file) {
           reader.readAsDataURL(file); //reads the data as a URL
       } else {
           preview.src = "";
       }
    }
}

function setImg(preview, input_ele){
    return function(){
        var url = cors_url + input_ele.value;
        if (preview.src != url){
            preview.src = url;
        }
    }
}

window.addEventListener('load', async () => {
    document.getElementById('style-file-upload').onchange = getPreview(document.getElementById('style-img'),
        document.getElementById('style-file-upload'));
    document.getElementById('gif-file-upload').onchange = getPreview(document.getElementById('origin-gif'),
        document.getElementById('gif-file-upload'));
    document.getElementById('origin-gif-url').onblur = setImg(document.getElementById('origin-gif'), 
        document.getElementById('origin-gif-url'));
    document.getElementById('style-img-url').onblur = setImg(document.getElementById('style-img'), 
        document.getElementById('style-img-url'));

    document.getElementById('origin-gif').src = "/static/moving.gif";
    document.getElementById('style-img').src = "/static/fall.jpg";
    const urlParams = new URLSearchParams(window.location.search);
    const gifurl = urlParams.get('gifurl');
    if(gifurl.length > 0){
      document.getElementById('origin-gif-url').value = gifurl;
    }
});