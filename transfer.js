tf = require('@tensorflow/tfjs');
gifFrames = require('gif-frames');
gifshot = require('gifshot');

/*
fetchUrl: url to the gif;
style_img: image element of the style
return a generator that generate stylized frame and lastly gif
*/
async function* gifTransfer(fetchUrl, style_img, styleNet, transformNet, style_ratio){
    const styledBottleNeck = await getStyleBottleneckScaled(tf.browser.fromPixels(style_img), style_ratio, styleNet);
    const frameData = await gifFrames({url: fetchUrl, frames: 'all', outputType: 'canvas', cumulative: true});
    const frameDataSize = frameData.length;
    let counter = 0;

    let images_arr = [];
    for (const frame of frameData){
        const img = frame.getImage();
        const stylized = await transferImage(
            tf.browser.fromPixels(img), 
            style_ratio,
            styleNet,
            transformNet, 
            styledBottleNeck);
        let canv = document.createElement('canvas');
        await tf.browser.toPixels(stylized, canv);
        stylized.dispose();
        images_arr.push(canv);
        counter++;
        yield canv;
    };

    // A function that returns a promise to resolve into the data //fetched from the API or an error
    const createGIF = (images_arr, gifWidth, gifHeight, interval) => {
      return new Promise(
        (resolve, reject) => {
            gifshot.createGIF({
                'images': images_arr,
                'gifWidth': gifWidth,
                'gifHeight': gifHeight,
                'interval': interval
            },function(obj) {
                if(!obj.error) {
                    resolve(obj.image);
                }
                else{
                    reject(obj.error);
                }
            });
        }
        );
    };
    const gif = await createGIF(images_arr, 
        frameData[0].frameInfo.width, 
        frameData[0].frameInfo.height,
        frameData[0].frameInfo.delay / 100);
    let canv = document.createElement('img');
    canv.src = gif;
    yield canv;
}

async function getStyleBottleneckScaled(style_tensor, style_ratio, styleNet){
    const bottleneck = await tf.tidy(() => {
        return styleNet.predict(style_tensor.toFloat().div(tf.scalar(255)).expandDims());
    });
    const styleBottleneckScaled = bottleneck.mul(tf.scalar(style_ratio));
    return styleBottleneckScaled;
};

async function transferImage(src_tensor, style_ratio, styleNet, transformNet, styleBottleneckScaled){
    let bottleneck = styleBottleneckScaled;
    if (style_ratio !== 1.0) {
      const identityBottleneck = await tf.tidy(() => {
        return styleNet.predict(src_tensor.toFloat().div(tf.scalar(255)).expandDims());
      })
      bottleneck = await tf.tidy(() => {
        const identityBottleneckScaled = identityBottleneck.mul(tf.scalar(1.0-style_ratio));
        return styleBottleneckScaled.addStrict(identityBottleneckScaled)
      })
      identityBottleneck.dispose();
    }
    const stylized = await tf.tidy(() => {
        return transformNet.predict([src_tensor.toFloat().div(tf.scalar(255)).expandDims(), bottleneck]).squeeze();
    });
    if (style_ratio !== 1.0) {
        bottleneck.dispose();
    }
    return stylized;
};

async function loadMobileNetStyleModel() {
    return await tf.loadGraphModel('models/style_model.json');
}

async function loadSeparableTransformerModel() {
    return await await tf.loadGraphModel('models/transform_model.json');
}

module.exports = {gifTransfer, loadMobileNetStyleModel, loadSeparableTransformerModel, getStyleBottleneckScaled, transferImage}
