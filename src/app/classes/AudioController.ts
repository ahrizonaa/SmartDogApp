import { inject } from '@angular/core';
import { BehaviorSubject, skip } from 'rxjs';
import { LogService } from '../services/log.service';
import { Microphone, AudioRecording } from '@mozartec/capacitor-microphone';
import { Device, DeviceInfo } from '@capacitor/device';

export class AudioController {
  Speakerphone: any;
  Microphone: any;
  WebRecorder!: MediaRecorder;
  AudioPlayer!: HTMLAudioElement;
  blobArray: Blob[] = [];
  audioRecordingBlob!: Blob;
  isMicrophoneActive: boolean;
  isAudioPlaying: boolean;
  isAudioAvailable: boolean;
  navigator: any = window.navigator;
  Log: LogService;
  deviceInfo!: DeviceInfo;

  RecordingiOS!: any;
  webPaths = [];
  dataUrls = [];

  constructor() {
    this.Log = inject(LogService);
    this.isMicrophoneActive = false;
    this.isAudioPlaying = false;
    this.isAudioAvailable = false;
    this.initSpeakerphone();
    this.initMicrophone();
    this.getDeviceInfo();
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
      Errors: new BehaviorSubject<Error>(new Error('')).pipe(skip(1)),
      AudioAvailable: new BehaviorSubject<boolean>(false).pipe(skip(1)),
      Volume: 5,
    };
  }

  setAudioPlayer(audioPlayer: HTMLAudioElement) {
    this.AudioPlayer = audioPlayer;
  }

  volumeChanged(volume: number) {
    this.Microphone.Volume = volume;
    this.AudioPlayer.volume = volume;
  }

  async microphoneToggle() {
    this.Microphone.IsActive = !this.Microphone.IsActive;
    this.Microphone.Activity.next(!this.Microphone.IsActive);

    if (this.Microphone.IsActive) {
      await this.beginRecording();
    } else {
      await this.endRecording();
    }
  }

  async beginRecording() {
    if (this.deviceInfo.platform === 'ios') {
      await this.begin_iOSRecording();
    } else if (this.deviceInfo.platform == 'android') {
      // not implemented
    } else if (this.deviceInfo.platform == 'web') {
      this.getUserAudio();
    } else {
      let err = new Error(
        'Cannot activate microphone.  Unsupported platform: ' +
          this.deviceInfo.platform
      );
      this.Microphone.Errors.next(err);
      this.Log.addLog(err);
    }
  }

  async endRecording() {
    if (this.deviceInfo.platform == 'ios') {
      await this.end_iOSRecording();
    } else if (this.deviceInfo.platform == 'android') {
      // not implemented
    } else if (this.deviceInfo.platform == 'web') {
      if (this.WebRecorder) {
        this.stopUserAudio();
      }
    } else {
      let err = new Error(
        'Cannot activate microphone.  Unsupported platform: ' +
          this.deviceInfo.platform
      );

      this.Microphone.Errors.next(err);
      this.Log.addLog(err);
    }
  }

  async begin_iOSRecording() {
    let perms = await this.checkPermissions();
    if (perms && perms.microphone == 'granted') {
      // capture native iOS audio
      await this.startRecording();
    } else {
      let permsresult: any = await this.requestPermissions();
      if (permsresult && permsresult.microphone == 'granted') {
        // capture native iOS audio
        await this.startRecording();
      } else {
        this.Microphone.Errors.next(new Error('Microphone permission denied'));
      }
    }
  }

  async end_iOSRecording() {
    await this.stopRecording();
  }

  async getUserAudio() {
    try {
      let stream = await this.navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      this.cameraAccessObtained(stream);
    } catch (err: any) {
      this.Microphone.Errors.next(err);
      this.Log.addLog(err);
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
    this.WebRecorder.stop();
  }

  audioTrackEnded(event: any) {
    this.isAudioPlaying = false;
  }

  alarmSirenClicked() {
    let isActive = this.Speakerphone.IsActive;
    this.Speakerphone.IsActive = isActive;
    this.Speakerphone.Activity.next(isActive);
  }

  cameraAccessObtained(stream: any) {
    this.WebRecorder = new MediaRecorder(stream);
    this.WebRecorder.ondataavailable = (event: any) => {
      this.blobArray.push(event.data);
    };

    this.WebRecorder.onstop = (event: any) => {
      this.audioRecordingBlob = new Blob(this.blobArray, {
        type: 'audio/mpeg-3',
      });
      this.blobArray = [];
      this.AudioPlayer.src = URL.createObjectURL(this.audioRecordingBlob);
      this.setAudioAvailable();
    };

    this.WebRecorder.start();
  }

  setAudioAvailable() {
    this.isAudioAvailable = true;
    this.Microphone.AudioAvailable.next(this.isAudioAvailable);
  }

  async checkPermissions() {
    try {
      const perms = await Microphone.checkPermissions();
      return perms;
    } catch (error) {
      this.Microphone.Errors.next(error);
      this.Log.addLog(error);
      return null;
    }
  }

  async requestPermissions() {
    try {
      const requestPermissionsResult = await Microphone.requestPermissions();
      console.log(
        'requestPermissionsResult: ' + JSON.stringify(requestPermissionsResult)
      );
    } catch (error) {
      console.error('requestPermissions Error: ' + JSON.stringify(error));
    }
  }

  async startRecording() {
    try {
      const startRecordingResult = await Microphone.startRecording();
      console.log(
        'startRecordingResult: ' + JSON.stringify(startRecordingResult)
      );
    } catch (error) {
      console.error('startRecordingResult Error: ' + JSON.stringify(error));
      this.Microphone.Errors.next(error);
      this.Log.addLog(error);
    }
  }

  async stopRecording() {
    try {
      this.RecordingiOS = await Microphone.stopRecording();
      // console.log(this.RecordingiOS);
      // @ts-ignore
      this.webPaths.push(this.RecordingiOS.webPath);
      // @ts-ignore
      this.dataUrls.push(this.RecordingiOS.dataUrl);
      this.AudioPlayer.src = this.RecordingiOS.dataUrl;
      this.setAudioAvailable();
    } catch (error) {
      console.error('recordingResult Error: ' + JSON.stringify(error));
      this.Microphone.Errors.next(error);
      this.Log.addLog(error);
    }
  }

  async getDeviceInfo() {
    this.deviceInfo = await Device.getInfo();
  }
}
