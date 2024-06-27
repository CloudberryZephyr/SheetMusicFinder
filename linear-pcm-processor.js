class LinearPCMProcessor extends AudioWorkletProcessor {
  
    constructor() {
        super();
    }
  
    /**
     * Converts input data from Float32Array to an array of ASCII characters, and
     * sends it in a message to the main thread.
     */
    process(inputList, _outputList, _parameters) {
        // Assumes the input is mono (1 channel). If there are more channels, they
        // are ignored
        let buffer = [];
        const input = inputList[0][0]; // first channel of first input

        
        for (let i = 0; i < input.length; i++) {
            // convert from pcm 32 to pcm 16
            let val = Math.floor(32767 * input[i]);
            val = Math.min(32767, val);
            val = Math.max(-32768, val);

            // transform to ASCII char
            let low = val & 255;
            let high = (val & (255 << 8)) >> 8;

            buffer.push(String.fromCharCode(low));
            buffer.push(String.fromCharCode(high));
        }
 
        this.port.postMessage(buffer);
        return true;
    }
  }
  
  registerProcessor("linear-pcm-processor", LinearPCMProcessor);