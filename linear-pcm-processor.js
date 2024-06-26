class LinearPCMProcessor extends AudioWorkletProcessor {

    static BUFFER_SIZE = 1024;
  
    constructor() {
        super();
        this.buffer = [];
    }
  
    /**
     * Converts input data from Float32Array to Int16Array, and stores it to
     * to the buffer. When the buffer is full, its content is posted to the main
     * thread, and the buffer is emptied
     */
    process(inputList, _outputList, _parameters) {
        // Assumes the input is mono (1 channel). If there are more channels, they
        // are ignored

        const input = inputList[0][0]; // first channel of first input

        // convert from pcm 32 to pcm 16
        for (let i = 0; i < input.length; i++) {
            let val = Math.floor(32767 * input[i]);
            val = Math.min(32767, val);
            val = Math.max(-32768, val);

            this.buffer[i] = val;
        }
 
        // // transform buff contents to ASCII char array in buffer and flush the buffer
        // for (let i = 0; i < buff.length; i++) {
        //     let low = buff[i] & 255;
        //     let high = (buff[i] & (255 << 8)) >> 8;

        //     this.buffer.push(String.fromCharCode(low));
        //     this.buffer.push(String.fromCharCode(high));
        // }
            
        this.port.postMessage(this.buffer);
        return true;
    }
  }
  
  registerProcessor("linear-pcm-processor", LinearPCMProcessor);