var neurons = new Array(10);
for(let i = 0; i < 10; i++) {
	neurons[i] = new Array(50);
  for(let j = 0; j < 50; j++) {
	neurons[i][j] = new Array(50);
  }
}
const xhr = new XMLHttpRequest();
var data = "";
xhr.open('GET', 'coefficients.txt', false);
xhr.send();
data = xhr.responseText;
var arrData = data.split(' ');
var temp = 0;
for(let k = 0;k<10;++k)
{
	  for(let i = 0;i<50;++i)
	  {
		for(let j = 0;j<50;++j)
		{
			  neurons[k][i][j] = Number(arrData[temp]);
			  temp++;
		}
	  }
}