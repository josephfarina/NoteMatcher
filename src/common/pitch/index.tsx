import pitchDetection from "./pitchDetection";

export { pitchDetection };

// TODO: delete this
export default function getMedia(test = false) {
  const context = new AudioContext();
  const analyser = context.createAnalyser();

  if (test) {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    gainNode.gain.value = 0.3;
    oscillator.frequency.value = 440;
    oscillator.start();

    setInterval(() => {
      oscillator.frequency.value = Math.floor(Math.random() * 1000);
      gainNode.gain.value = Math.random() > 0.5 ? 0.001 : 1;
    }, 500);

    oscillator.connect(gainNode);
    gainNode.connect(analyser);
    analyser.connect(context.destination);

    pitchDetection(context, analyser);
  } else {
    navigator.getUserMedia(
      { audio: true },
      stream => {
        const input = context.createMediaStreamSource(stream);
        input.connect(analyser);
        pitchDetection(context, analyser);
      },
      console.error
    );
  }
}
