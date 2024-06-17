let recorder;
let audioContext;
let leftChannel;
let recordingLength;

const bufferSize = 2048;

function mergeBuffers(channelBuffer, recordingLength) {
	let result = new Float32Array(recordingLength);
	let offset = 0;
  
	for (let i = 0; i < channelBuffer.length; i++)
	{
		result.set(channelBuffer[i], offset);
		offset += channelBuffer[i].length;
	}
  
	return Array.prototype.slice.call(result);
 }



 function getAudioData() {
	return new Promise( function (resolve, reject) {
		setTimeout( function() {
			recorder.disconnect();
			const PCM32fSamples = mergeBuffers(leftChannel, recordingLength);

			let charArr = [];
			
			// format audio to pcm signed integer 16bit mono
			for (let i = 0; i < PCM32fSamples.length; i++) {
				let val = Math.floor(32767 * PCM32fSamples[i]);
				val = Math.min(32767, val);
				val = Math.max(-32768, val);

				let low = val & 255;
				let high = (val & (255 << 8)) >> 8;

				charArr.push(String.fromCharCode(low));
				charArr.push(String.fromCharCode(high));
			}

			// convert audio to string for http api request
			let base64Str = btoa(charArr.join(""));
			resolve(base64Str)
		}, 4000);

	})
 }



async function getResponse() {
	// reset data-specific global variables
	leftChannel = [];
	recordingLength = 0;

	// only get the recorder if we haven't set it before
	if (recorder == null) {
		// make sure that getUserMedia is supported in the browser
		if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {  
			await navigator.mediaDevices.getUserMedia({audio : true})
				.then( async function(stream) {

					let audioStream = stream;

					// creates the an instance of audioContext
					const context = window.AudioContext || window.webkitAudioContext;
					audioContext = new context();

					// creates a gain node
					const volume = audioContext.createGain();

					// creates an audio node from the microphone incoming stream
					const audioInput = audioContext.createMediaStreamSource(audioStream);

					// connect the stream to the gain node
					audioInput.connect(volume);

					recorder = audioContext.createScriptProcessor.call(audioContext, bufferSize, 1, 1);

					// we connect the recorder
					volume.connect(recorder);

					recorder.onaudioprocess = function(event){
						const samples = event.inputBuffer.getChannelData(0);
				
						// we clone the samples
						leftChannel.push(new Float32Array(samples));
				
						recordingLength += bufferSize;
					};
					
					
				})
				.catch( (err) => {console.error(`getUserMedia error: ${err}`);} );
		
		} else {
			console.log("getUserMedia not supported on this browser");
		}
	}


	// begin recording
	recorder.connect(audioContext.destination);


	getAudioData().then( async function (base64Str) {
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

document.addEventListener("DOMContentLoaded", () => {
	// set up button trigger
	const btn = document.getElementById("mic-button");
	btn.addEventListener("click", getResponse)

});


