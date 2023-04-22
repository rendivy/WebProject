const buttonClear = document.getElementById('button-clear');
const buttonPredict = document.getElementById('button-predict');


function centerImage(image) {
    const height = image.length;
    const width = image[0].length;


    const centerY = Math.floor(height / 2);
    const centerX = Math.floor(width / 2);

    let imageY = Math.floor(height / 2);
    let imageX = Math.floor(width / 2);


    const offsetY = centerY - imageY;
    const offsetX = centerX - imageX;


    const centeredImage = [];


    for (let y = 0; y < height; y++) {
        centeredImage[y] = [];
        for (let x = 0; x < width; x++) {
            if (y + offsetY < 0 || y + offsetY >= height || x + offsetX < 0 || x + offsetX >= width) {
                centeredImage[y][x] = 0;
            } else {
                centeredImage[y][x] = image[y + offsetY][x + offsetX];
            }
        }
    }

    return centeredImage;
}


buttonClear.addEventListener('click', () => {
    ctx.clearRect(0, 0, 50, 50);
    outputDiv1 = document.getElementById('output1');
    outputDiv2 = document.getElementById('output2');
    outputDiv3 = document.getElementById('output3');
    outputDiv1.innerHTML = ' ';
    outputDiv2.innerHTML = ' ';
    outputDiv3.innerHTML = ' ';
});

buttonPredict.addEventListener('click', () => {
    const image = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
    width = image.width
    height = image.height
    pixelArray = new Array(50);
    for (i = 0; i < 50; ++i) {
        pixelArray[i] = new Array(50);
    }
    count = 0;
    sum = 0;
    max_predict = -1;
    max_predict_index = 0;
    const R = [];
    const G = [];
    const B = [];
    for (let i = 0; i < image.data.length; i += 4) {
        R.push(image.data[i]);
        G.push(image.data[i + 1]);
        B.push(image.data[i + 2]);
    }
    for (i = 0; i < width; i++) {
        for (j = 0; j < height; j++) {
            if (R[i * width + j] > 100 && G[i * width + j] > 100 && B[i * width + j] > 100) {
                pixelArray[j][i] = 1;

            } else {
                pixelArray[j][i] = 0;
            }
        }
    }
    //центрируем
    top_pixel = 50;
    down_pixel = 0;
    left_pixel = 50;
    right_pixel = 0;
    for (i = 0; i < width; ++i) {
        for (j = 0; j < height; ++j) {
            if (pixelArray[i][j] === 1) {
                if (j < top_pixel) {
                    top_pixel = j;
                }
                if (j > down_pixel) {
                    down_pixel = j;
                }
                if (i < left_pixel) {
                    left_pixel = i;
                }
                if (i > right_pixel) {
                    right_pixel = i;
                }
            }
        }
    }
    h = down_pixel - top_pixel;
    w = right_pixel - left_pixel;
    center_pixelArray = new Array(50);
    for (i = 0; i < 50; ++i) {
        center_pixelArray[i] = new Array(50);
        for (j = 0; j < 50; ++j) {
            center_pixelArray[i][j] = 0;
        }
    }
    for (i = left_pixel; i < right_pixel; ++i) {
        for (j = top_pixel; j < down_pixel; ++j) {
            center_pixelArray[25 - parseInt(w / 2) + i - left_pixel][25 - parseInt(h / 2) + j - top_pixel] = pixelArray[i][j];
        }
    }


    predict = new Array(10);
    predict_index = Array(10);
    for (i = 0; i < 10; ++i) {
        predict_index[i] = i;
    }
    for (k = 0; k < 10; ++k) {
        count = 0;
        sum = 0;
        for (i = 0; i < width; i++) {
            for (j = 0; j < height; j++) {
                if (center_pixelArray[i][j] === 1) {
                    count++;
                    sum += neurons[k][i][j];
                }
            }
        }
        predict[k] = sum / count;
        if (max_predict < predict[k]) {
            max_predict_index = k;
            max_predict = predict[k];
        }
    }
    for (i = 0; i < 9; i++)
        for (j = 0; j < 9; j++)
            if (predict[j] > predict[j + 1]) {
                temp = predict[j];
                predict[j] = predict[j + 1];
                predict[j + 1] = temp;
                temp_index = predict_index[j];
                predict_index[j] = predict_index[j + 1];
                predict_index[j + 1] = temp_index;
            }
    const outputDiv1 = document.getElementById('output1');
    const outputDiv2 = document.getElementById('output2');
    const outputDiv3 = document.getElementById('output3');
    outputDiv1.innerHTML = predict_index[9];
    outputDiv2.innerHTML = predict_index[8];
    outputDiv3.innerHTML = predict_index[7];
});
