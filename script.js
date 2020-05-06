var links = document.querySelectorAll(".link");
var codes = document.querySelectorAll(".code");
var canvas1 = document.querySelector("#canv1");
var canvas2 = document.querySelector("#canv2");
var textarea = document.querySelector("#textarea");
var ctx1 = canvas1.getContext('2d');
var ctx2 = canvas2.getContext('2d');

document.querySelector("#navbar").addEventListener("click", function(event){
  if(event.target.className == "link"){
    for (var i = 0; i < links.length; i++) {
      links[i].classList.remove("active");
      codes[i].classList.remove("open");
      if(event.target == links[i]){
        links[i].classList.add("active");
        codes[i].classList.add("open");
      }
    }
  }
});
document.querySelector("#active_link").click();

document.getElementById('open_imageEncode').addEventListener('change', function(e){
  var frames = document.querySelectorAll(".frame");
  for (var i = 0; i < frames.length; i++) {
    frames[i].style.overflowX = "auto";
  }
  var reader = new FileReader();
  reader.onload = function(event){
      var img = new Image();
      img.onload = function(){
          canvas1.width = img.width;
          canvas2.width = img.width;
          canvas1.height = img.height;
          canvas2.height = img.height;
          ctx2.drawImage(img,0,0);
          ctx1.drawImage(img,0,0);
      }
      img.src = event.target.result;
  }
  reader.readAsDataURL(e.target.files[0]);
});

document.getElementById('open_imageDecode').addEventListener('change', function(e){
  document.querySelectorAll(".frame")[1].style.overflowX = "auto";
  var reader = new FileReader();
  reader.onload = function(event){
      var img = new Image();
      img.onload = function(){
          canvas2.width = img.width;
          canvas2.height = img.height;
          ctx2.drawImage(img,0,0);
      }
      img.src = event.target.result;
  }
  reader.readAsDataURL(e.target.files[0]);
});

document.querySelector("#downloadBtn").addEventListener("click", function(){
  var image = canvas2.toDataURL("image/jpg");
  this.href = image;
});

function fillByZeros(str){
  str = str.split("");
  while(str.length !== 8){
    str.unshift("0");
  }
  str = str.join("");
  return str;
}

document.querySelector("#btnEncode").addEventListener("click", function(){

  var message = textarea.value;
  message += "#";
  var bytesMessage = [];
  for (var i = 0; i < message.length; i++) {
    bytesMessage[i] = fillByZeros(message[i].charCodeAt(0).toString(2));
  }

  var imgData = ctx1.getImageData(0, 0, canvas1.width, canvas1.height);
  var arr3d = [];
  var index = 0;
  for (var i = 0; i < canvas1.height; i++) {
    arr3d[i] = [];
    for (var j = 0; j < canvas1.width; j++) {
      arr3d[i][j] = [];
      for (var k = 0; k < 4; k++) {
        arr3d[i][j][k] = imgData.data[index];
        index++;
      }
    }
  }

  var indexDown = canvas1.width-1;
  var indexUp = 0;
  var arrRGBA = [];
  for (var i = canvas1.height-1; i > -1; i--) {

    if(indexUp >= bytesMessage.length){
      continue;
    }else{
      for (var j = 0; j < 4; j++) {
        arrRGBA[j] = fillByZeros(arr3d[i][indexDown][j].toString(2)).slice(0,6);
      }

      arrRGBA[0] += bytesMessage[indexUp].slice(0,2);
      arrRGBA[1] += bytesMessage[indexUp].slice(2,4);
      arrRGBA[2] += bytesMessage[indexUp].slice(4,6);
      arrRGBA[3] += bytesMessage[indexUp].slice(6,8);

      for (var j = 0; j < 4; j++) {
        arr3d[i][indexDown][j] = parseInt(arrRGBA[j], 2);
      }
    }

    indexDown--;
    indexUp++;
  }

  var somestr = [];
  var indexData = 0;
  for (var i = 0; i < arr3d.length; i++) {
    for (var j = 0; j < arr3d[i].length; j++) {
      for (var k = 0; k < arr3d[i][j].length; k++) {
        imgData.data[indexData] = arr3d[i][j][k];
        indexData++;
      }
    }
  }

  ctx2.putImageData(imgData, 0, 0);
});

document.querySelector("#btnDecode").addEventListener("click", function(){

  var imgDataDecode = ctx2.getImageData(0, 0, canvas2.width, canvas2.height);
  var arr3dDecode = [];
  var indexDecode = 0;
  for (var i = 0; i < canvas2.height; i++) {
    arr3dDecode[i] = [];
    for (var j = 0; j < canvas2.width; j++) {
      arr3dDecode[i][j] = [];
      for (var k = 0; k < 4; k++) {
        arr3dDecode[i][j][k] = imgDataDecode.data[indexDecode];
        indexDecode++;
      }
    }
  }

  var arrDecodedBytes = [];
  var indexDownDecode = canvas2.width-1;
  var indexUpDecode = 0;
  var strDecodedMessage = "";
  for (var i = canvas2.height-1; i > -1; i--) {

    if(indexUpDecode >= canvas2.width){
      continue;
    }else{
      arrDecodedBytes[indexUpDecode] = "";
      for (var j = 0; j < 4; j++) {
        arrDecodedBytes[indexUpDecode] += fillByZeros(arr3dDecode[i][indexDownDecode][j].toString(2)).slice(6,8);
      }
    }

    strDecodedMessage += String.fromCharCode(parseInt(arrDecodedBytes[indexUpDecode], 2).toString(10));
    indexDownDecode--;
    indexUpDecode++;
  }
  document.querySelector("#textareaDisabled").innerHTML = strDecodedMessage.slice(0, strDecodedMessage.indexOf("#"));
});
