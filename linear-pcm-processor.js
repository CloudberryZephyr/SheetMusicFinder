// linear-pcm-processor.js (must be in its own file!)
class LinearPCMProcessor extends AudioWorkletProcessor {
    // The size of the buffer. Must be a multiple of 128 (the number of frames in the
    // input channel). An audio block is posted to the main thread every time the
    // buffer is full, which means a large buffer will emit less frequently (higher
    // latency), but more efficiently (fewer I/O interruptions between the worker and
    // the main thread)
    static BUFFER_SIZE = 2048;
  
    constructor() {
        super();
        this.buffer = []; 
        this.offset = 0;
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
        let buff = new Int16Array(LinearPCMProcessor.BUFFER_SIZE/2);

        for (let i = 0; i < input.length; i++) {
            const sample = Math.max(-1, Math.min(1, input[i]));  // normalize value to between -1 and 1
            buff[i + this.offset] =
            sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        }
        this.offset += input.length;

        // Once the buffer is filled entirely, transform to ASCII char array in buffer and flush the buffer
        if (this.offset >= this.buffer.length - 1) {

            for (let i = 0; i < buff.length; i++) {
                let low = buff[i] & 255;
                let high = (buff[i] & (255 << 8)) >> 8;

                this.buffer.push(String.fromCharCode(low));
                this.buffer.push(String.fromCharCode(high));
            }
            
            this.flush();
        }
        return true;
    }
  
    /**
     * Sends the buffer's content to the main thread via postMessage(), and reset
     * the offset to 0
     */
    flush() {
      this.offset = 0;
      this.port.postMessage(this.buffer);
    }
  }
  
  registerProcessor("linear-pcm-processor", LinearPCMProcessor);