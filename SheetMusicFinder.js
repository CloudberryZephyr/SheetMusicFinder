let chunks = [];
let bodyData = '';

mediaRecorder.ondataavailable = (e) => {chunks.push(e.data);}

async function startRecord(stream) {
	const mediaRecorder = new MediaRecorder(stream);
	mediaRecorder.start();
	await setTimeout(mediaRecorder.stop(), 5000); // this should get us 5 seconds of sound data
}

function getMicInput(stream) {
	startRecord(stream);
	let chunkString = chunks.toString;
	let base64Str = btoa(chunkString);
	return base64Str;
} 

async function setUpMic() {
	// make sure that getUserMedia is supported in the browser
	if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {  
		navigator.mediaDevices.getUserMedia({audio : true})
			.then( (stream) => { bodyData = getMicInput(stream);})
			.catch( (err) => {console.error(`getUserMedia  error: ${err}`);} );
		
	} else {
		console.log("getUserMedia not supported on this browser");
	}
}

async function getResponse() {
	const url = 'https://shazam.p.rapidapi.com/songs/detect';
	const options = {
		method: 'POST',
		headers: {
			'content-type': 'text/plain',
			'X-RapidAPI-Key': '0bfb0321bbmsh8e25be16e31863dp15994cjsnc481a9a41b94',
			'X-RapidAPI-Host': 'shazam.p.rapidapi.com'
		},
		body: bodyData
	};

	try {
		const response = await fetch(url, options);
		const result = await response.text();
		
		console.log(result);
	} catch (error) {
		console.error(error);
	}
}
