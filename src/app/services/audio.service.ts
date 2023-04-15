import { Injectable } from '@angular/core';
import { BehaviorSubject, skip } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  Speakerphone: any;
  Microphone: any;
  Recorder!: MediaRecorder;
  AudioPlayer!: HTMLAudioElement;
  blobArray: Blob[] = [];
  audioRecordingBlob!: Blob;
  isMicrophoneActive: boolean;
  isAudioPlaying: boolean;
  isAudioAvailable: boolean;
  navigator: any = window.navigator;

  constructor() {
    this.isMicrophoneActive = false;
    this.isAudioPlaying = false;
    this.isAudioAvailable = false;
    this.initSpeakerphone();
    this.initMicrophone();
  }

  setAudioPlayer(audioPlayer: HTMLAudioElement) {
    this.AudioPlayer = audioPlayer;
  }

  volumeChanged(volume: number) {
    this.Microphone.Volume = volume;
    this.AudioPlayer.volume = volume;
  }

  microphoneToggle() {
    this.Microphone.IsActive = !this.Microphone.IsActive;
    this.Microphone.Activity.next(!this.Microphone.IsActive);

    if (this.Microphone.IsActive) {
      this.getUserAudio();
    } else {
      if (this.Recorder) {
        this.stopUserAudio();
      }
    }
  }

  async getUserAudio() {
    try {
      let stream = await this.navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      this.cameraAccessObtained(stream);
    } catch (err: any) {
      this.Microphone.Errors.next(err.toString());
    }
  }

  playbackAudio() {
    this.isAudioPlaying = true;
    this.AudioPlayer.play();
  }

  stopAudioPlayback() {
    this.isAudioPlaying = false;
    this.AudioPlayer.pause();
    this.AudioPlayer.currentTime = 0;
  }

  stopUserAudio() {
    this.Recorder.stop();
  }

  audioTrackEnded(event: any) {
    this.isAudioPlaying = false;
  }

  initSpeakerphone() {
    this.Speakerphone = {
      IsActive: false,
      Activity: new BehaviorSubject<boolean>(false).pipe(skip(1)),
    };
  }

  initMicrophone() {
    this.Microphone = {
      IsActive: false,
      Activity: new BehaviorSubject<boolean>(false).pipe(skip(1)),
      Errors: new BehaviorSubject<string>('').pipe(skip(1)),
      AudioAvailable: new BehaviorSubject<boolean>(false).pipe(skip(1)),
      Volume: 5,
    };
  }

  alarmSirenClicked() {
    let isActive = this.Speakerphone.IsActive;
    this.Speakerphone.IsActive = isActive;
    this.Speakerphone.Activity.next(isActive);
  }

  cameraAccessObtained(stream: any) {
    this.Recorder = new MediaRecorder(stream);
    this.Recorder.ondataavailable = (event: any) => {
      this.blobArray.push(event.data);
    };

    this.Recorder.onstop = (event: any) => {
      this.audioRecordingBlob = new Blob(this.blobArray, {
        type: 'audio/mpeg-3',
      });
      this.blobArray = [];
      this.AudioPlayer.src = URL.createObjectURL(this.audioRecordingBlob);
      this.isAudioAvailable = true;
      this.Microphone.AudioAvailable.next(this.isAudioAvailable);
    };

    this.Recorder.start();
  }
}
