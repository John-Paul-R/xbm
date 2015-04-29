chrome.webRequest.onBeforeRequest.addListener(
  function(info) {
    console.log("Cat intercepted: " + info.url);


    var get=function(url,callback){
		var xmlRequest=new XMLHttpRequest();
		xmlRequest.open('GET',info.url,true);
		xmlRequest.send();

		xmlRequest.onreadystatechange=function(){
		 if(xmlRequest.readyState==4){
		   callback(xmlRequest.responseText);
		  }
		 };
	};

	get(info.url,function(resp){
		var lines = resp.split("\n");
		var xbm = new Object();
		function extractNumber(str){
			return lines[line].match(/[0-9]+/)[0];
		}
		//Credit: Tobspr
		function Hex2Bin(n){if(!checkHex(n))return 0;return parseInt(n,16).toString(2)}
		//Useful Functions
		function checkBin(n){return/^[01]{1,64}$/.test(n)}
		function checkDec(n){return/^[0-9]{1,64}$/.test(n)}
		function checkHex(n){return/^[0-9A-Fa-f]{1,64}$/.test(n)}
		function pad(s,z){s=""+s;return s.length<z?pad("0"+s,z):s}
		function unpad(s){s=""+s;return s.replace(/^0+/,'')}

		//Decimal operations
		function Dec2Bin(n){if(!checkDec(n)||n<0)return 0;return n.toString(2)}
		function Dec2Hex(n){if(!checkDec(n)||n<0)return 0;return n.toString(16)}

		//Binary Operations
		function Bin2Dec(n){if(!checkBin(n))return 0;return parseInt(n,2).toString(10)}
		function Bin2Hex(n){if(!checkBin(n))return 0;return parseInt(n,2).toString(16)}

		//Hexadecimal Operations
		function Hex2Bin(n){if(!checkHex(n))return 0;return parseInt(n,16).toString(2)}
		function Hex2Dec(n){if(!checkHex(n))return 0;return parseInt(n,16).toString(10)}

		var imgWidth = -1;
		var imgHeight = -1;
		var widthIndex = 0;
		var lineBits = "";
    for(line=0; line<lines.length; line++){
      console.log(lines[line]);
    }

		for(line=0; line<lines.length; line++){
			if(lines[line].indexOf("#define") == -1){ //data
				var values = lines[line].split(",");
				for(var i=0; i<values.length; i++){
          var hexBits = values[i].replace("0x","").trim();
          if(!hexBits[0]){
            if(hexBits[0] && hexBits[0].length > 0){console.log("error on "+line+","+i+"  > "+values[i]+" < - len: "+values[i].length);} //EOL
            continue;
          };
					lineBits += ""+Hex2Bin(hexBits); //Hex2Bin(hexBits[0])+""+Hex2Bin(hexBits[1]);
				}
			}else if(lines[line].indexOf("width") > -1){ // width definition
				imgWidth = parseInt(extractNumber(lines[line]),10);
				console.log("width: "+extractNumber(lines[line]));
			}else if(lines[line].indexOf("height") > -1){ // height definition
				imgHeight = parseInt(extractNumber(lines[line]),10);
				console.log("height: "+extractNumber(lines[line]));
			}else if(lines[line].indexOf("x_hot") > -1){ // x hotspot
				console.log("x hot: "+extractNumber(lines[line]));
			}else if(lines[line].indexOf("y_hot") > -1){ // y hotspot
				console.log("y hot: "+extractNumber(lines[line]));
			}
			//console.log(lines[line]);
		}

		//echo data
		for(var line=0; line<imgHeight; line++){
			var output = "";
			for(var pixel=0; pixel<imgWidth; pixel++){
				output += ""+lineBits[imgWidth*line+pixel];
				//console.log((imgWidth*line+pixel);
			}
			console.log(output.replace(/0/g," ").replace(/1/g,"X"));
		}

		return;
		//console.log(lines.length);
		//console.log(resp.length);
		//console.log(resp);
	});

    // Redirect the lolcal request to a random loldog URL.
    //var i = Math.round(Math.random() * loldogs.length);
    //return {redirectUrl: loldogs[i]};
  },
  // filters
  {
    urls: [
      "http://*/*.xbm","https://*/*.xbm"
    ],
    types: ["main_frame", "sub_frame", "stylesheet", "script", "image", "object", "other"]
  },
  // extraInfoSpec
  ["blocking"]);

chrome.webRequest.onResponseStarted.addListener(function(deets){
	//console.log(deets);
},
  {
    urls: [
      "http://*/*.xbm","https://*/*.xbm"
    ],
    types: ["main_frame", "sub_frame", "stylesheet", "script", "image", "object", "xmlhttprequest", "other"]
  },  ["responseHeaders"]);
