transfer = require('./transfer.js');

let styleNet;
let transformNet;
const cors_url = 'https://sheltered-tor-32003.herokuapp.com/';

async function runTransfer(){
	const style_ratio = 1.0;
	const fetchUrl = document.getElementById('origin-gif').src;
	const animatedImage = document.getElementById('style-img');
	const trans = transfer.gifTransfer(fetchUrl, animatedImage, styleNet, transformNet, style_ratio);

	let transfer_span = document.getElementById('transfer-gif-div');
	for await(const value of trans){
		const img = value[2];
		transfer_span.innerHTML = "";
		transfer_span.appendChild(img);
	}
}

async function loadGifImgAndTransfer(){
	const gifUrl = cors_url + document.getElementById('origin-gif-url').value;
	document.getElementById('origin-gif').src = gifUrl;
	const styleImgUrl = cors_url + document.getElementById('style-img-url').value;
	document.getElementById('style-img').src = styleImgUrl;
}

async function handleClick(){
	document.getElementById('style-img').addEventListener('load', runTransfer);
	loadGifImgAndTransfer();
}

window.addEventListener('load', async () => {
	styleNet = await transfer.loadMobileNetStyleModel();
	transformNet = await transfer.loadSeparableTransformerModel();
	loadGifImgAndTransfer();
	document.getElementById('style-button').onclick = handleClick;
});