import { Microphone, AudioRecording } from '@mozartec/capacitor-microphone';

export class iOSAudio {
  iOSAudioData!: AudioRecording;

  constructor() {}

  async beginRecording() {
    let permscheck = await Microphone.checkPermissions();
    if (permscheck && permscheck.microphone == 'granted') {
      // capture native iOS audio
      await Microphone.startRecording();
    } else {
      const permsrequest = await Microphone.requestPermissions();
      if (permsrequest && permsrequest.microphone == 'granted') {
        // capture native iOS audio
        await Microphone.startRecording();
      } else {
        throw new Error('Microphone permission denied');
      }
    }
  }

  async stopRecording() {
    this.iOSAudioData = await Microphone.stopRecording();
    return this.iOSAudioData;
  }
}
