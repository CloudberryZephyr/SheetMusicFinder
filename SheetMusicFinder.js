let chunks = [];
let base64Str = "";
let recorder;

async function setUpAudio() {
	navigator.getUserMedia = navigator.getUserMedia || 
                         navigator.webkitGetUserMedia || 
                         navigator.mozGetUserMedia || 
                         navigator.msGetUserMedia;
 
	let audioStream;
 
	if (navigator.getUserMedia) {
   		await navigator.getUserMedia({audio: true}, function(stream){
    		audioStream = stream;
		}, function(error){
    		alert('Error capturing audio.');
		});
	}
	else {
	   	alert('getUserMedia not supported in this browser.');
	}
	
	// creates the an instance of audioContext
	const context = window.AudioContext;
	const audioContext = new context();
 
	// get processor module
	await audioContext.audioWorklet.addModule("./linear-pcm-processor.js");
	recorder = new AudioWorkletNode(audioContext, "linear-pcm-processor");
                                                           
	// we connect the recorder
	audioContext.connect(recorder);

	recorder.port.onmessage = (e) => {chunks.push(e.data)};
}


async function getResponse() {
	base64Str = "";
	recorder.connect(audioContext.destination);
	new Promise( function (resolve, reject) {
		setTimeout( function() {
			recorder.disconnect();
			let chunkString = chunks.toString;
			chunks = [];
			base64Str = btoa(chunkString);
			resolve(base64Str)
		}, 5000);
	}).then( async function (base64Str) {
	
		// set up API call
		const url = 'https://shazam.p.rapidapi.com/songs/detect';
		const options = {
			method: 'POST',
			headers: {
				'content-type': 'text/plain',
				'X-RapidAPI-Key': '0bfb0321bbmsh8e25be16e31863dp15994cjsnc481a9a41b94',
				'X-RapidAPI-Host': 'shazam.p.rapidapi.com'
			},
			body: base64Str
		};

		try {
			const response = await fetch(url, options);
			const result = await response.text();
		
			console.log(result);
		} catch (error) {
			console.error(error);
		}
	});
}

document.addEventListener("DOMContentLoaded", async () => {
	setUpAudio();

	// set up button trigger
	const btn = document.getElementById("mic-button");
	btn.addEventListener("click", getResponse)
})

// document.addEventListener("DOMContentLoaded", () => {
// 	// make sure that getUserMedia is supported in the browser
// 	if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {  
// 		navigator.mediaDevices.getUserMedia({audio : true})
// 			.then( async function(stream) { 
// 				// set up mediaRecorder
// 				mediaRecorder = new MediaRecorder(stream);
				
// 				// mediaRecorder.ondataavailable = (e) => {chunks.push(e.data)}
// 				mediaRecorder.addEventListener("dataavailable", (e) => {chunks.push(e.data)} );

// 				// set up button trigger
// 				const btn = document.getElementById("mic-button");
// 				btn.addEventListener("click", getResponse)
// 			})
// 			.catch( (err) => {console.error(`getUserMedia error: ${err}`);} );
	
// 	} else {
// 		console.log("getUserMedia not supported on this browser");
// 	}

// });
