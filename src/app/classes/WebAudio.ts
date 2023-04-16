export class WebAudio {
  navigator: any = window.navigator;
  WebRecorder!: MediaRecorder;
  blobArray: Blob[] = [];
  audioRecordingBlob!: Blob;

  constructor() {}

  async startRecording() {
    let stream = await this.navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    this.cameraAccessObtained(stream);
  }

  cameraAccessObtained(stream: any) {
    this.WebRecorder = new MediaRecorder(stream);
    this.WebRecorder.ondataavailable = (event: any) => {
      this.blobArray.push(event.data);
    };
    this.WebRecorder.onerror = (event) => {
      throw new Error(event.toString());
    };
    this.WebRecorder.start();
  }

  stopRecording() {
    let stopPromise = new Promise<string>((resolve, reject) => {
      this.WebRecorder.onstop = (evt) => {
        this.audioRecordingBlob = new Blob(this.blobArray, {
          type: 'audio/mpeg-3',
        });
        this.blobArray = [];
        const src = URL.createObjectURL(this.audioRecordingBlob);
        resolve(src);
      };
    });
    this.WebRecorder.stop();
    return stopPromise;
  }
}
