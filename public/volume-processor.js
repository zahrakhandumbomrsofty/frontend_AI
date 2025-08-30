// public/volume-processor.js - CORRECTED VERSION

class VolumeProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    // Time when we last sent a message to the main thread.
    this.lastPostTime = 0;
    // The interval in seconds to post messages.
    this.postInterval = 0.25; // 250ms
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const inputChannel = input[0];

    // If there's no audio, do nothing but keep the processor alive.
    if (!inputChannel) {
      return true;
    }

    // Calculate the Root Mean Square (RMS) to determine volume.
    let sum = 0.0;
    for (let i = 0; i < inputChannel.length; ++i) {
      sum += inputChannel[i] * inputChannel[i];
    }
    const rms = Math.sqrt(sum / inputChannel.length);

    // Simple silence threshold.
    const SILENCE_THRESHOLD = 0.01;
    const isSpeaking = rms > SILENCE_THRESHOLD;

    // The 'currentTime' variable is a high-resolution timer provided by the worklet.
    // We check if enough time has passed since our last message.
    if (currentTime > this.lastPostTime + this.postInterval) {
      // If it has, send the speaking status to the main thread.
      this.port.postMessage({ isSpeaking: isSpeaking });
      // And update the time of our last message.
      this.lastPostTime = currentTime;
    }

    // Return true to keep the processor alive.
    return true;
  }
}

registerProcessor('volume-processor', VolumeProcessor);