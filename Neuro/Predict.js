const buttonClear = document.getElementById('button-clear');
const buttonPredict= document.getElementById('button-predict');


buttonClear.addEventListener('click', () => {
	ctx.clearRect(0, 0, 50,50);
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
  for(i = 0;i<50;++i)
  {
    pixelArray[i] = new Array(50);
  }
  count = 0;
  sum = 0;
  max_predict = -1;
  max_predict_index = 0;
  const R = [];
  const G = [];
  const B = [];
	for (let i = 0; i < image.data.length; i += 4) 
	{
 	 	R.push(image.data[i]);
		G.push(image.data[i+1]);
		B.push(image.data[i+2]);
	}
	for (i = 0; i < width; i++)
	{
		for (j = 0; j < height; j++)
		{
			if (R[i * width + j] > 50 && G[i * width + j] > 50 && B[i * width + j] > 50)
			{
				pixelArray[j][i] = 1;

			}
			else
			{
				pixelArray[j][i] = 0;
			}
		}
	}
  predict = new Array(10);
  predict_index = Array(10);
  for(i = 0;i<10;++i)
  {
	predict_index[i] = i;
  }
  for (k = 0; k < 10; ++k)
  {
	  count = 0;
	  sum = 0;
	  for (i = 0; i < width; i++)
	  {
		  for (j = 0; j < height; j++)
		  {
			  if (pixelArray[i][j] == 1)
			  {
				  count++;
				  sum += neurons[k][i][j];
			  }
		  }
	  }
	  predict[k] = sum / count;
	  if (max_predict < predict[k])
	  {
		  max_predict_index = k;
		  max_predict = predict[k];
	  }
  }
  for (i = 0; i < 9; i++)
                for (j = 0; j < 9; j++)
                    if (predict[j] > predict[j + 1])
                    {
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