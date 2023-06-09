import { inject } from '@angular/core';
import { BehaviorSubject, skip } from 'rxjs';
import { LogService } from '../services/log.service';
import { Device, DeviceInfo } from '@capacitor/device';

import { iOSAudio } from '../classes/iOSAudio';
import { AndroidAudio } from '../classes/AndroidAudio';
import { WebAudio } from '../classes/WebAudio';

export class AudioController {
  Speakerphone: any;
  Microphone: any;
  AudioPlayer!: HTMLAudioElement;
  isMicrophoneActive: boolean;
  isAudioPlaying: boolean;
  isAudioAvailable: boolean;
  navigator: any = window.navigator;
  Log: LogService;
  deviceInfo!: DeviceInfo;
  iOSAudio: iOSAudio;
  AndroidAudio: AndroidAudio;
  WebAudio: WebAudio;

  constructor() {
    this.Log = inject(LogService);
    this.isMicrophoneActive = false;
    this.isAudioPlaying = false;
    this.isAudioAvailable = false;
    this.initSpeakerphone();
    this.initMicrophone();
    this.getDeviceInfo();
    this.iOSAudio = new iOSAudio();
    this.AndroidAudio = new AndroidAudio();
    this.WebAudio = new WebAudio();
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
    try {
      if (!this.Microphone.IsActive) {
        await this.beginRecording();
      } else {
        await this.endRecording();
      }
      this.Microphone.IsActive = !this.Microphone.IsActive;
      this.Microphone.Activity.next(!this.Microphone.IsActive);
    } catch (error) {
      this.Microphone.Errors.next(error);
      this.Log.addLog(error);
      this.Microphone.IsActive = false;
      this.Microphone.Activity.next(this.Microphone.IsActive);
    }
  }

  async beginRecording() {
    if (this.deviceInfo.platform === 'ios') {
      await this.iOSAudio.beginRecording();
    } else if (this.deviceInfo.platform == 'android') {
      // not implemented
    } else if (this.deviceInfo.platform == 'web') {
      await this.WebAudio.startRecording();
    } else {
      throw new Error('Unsupported platform: ' + this.deviceInfo.platform);
    }
  }

  async endRecording() {
    if (this.deviceInfo.platform == 'ios') {
      try {
        const iOSAudioData = await this.iOSAudio.stopRecording();
        this.AudioPlayer.src = iOSAudioData.dataUrl || '';
        this.setAudioAvailable(true);
      } catch (error) {
        this.Microphone.Errors.next(error);
        this.Log.addLog(error);
        this.setAudioAvailable(false);
      }
    } else if (this.deviceInfo.platform == 'android') {
      // not implemented
    } else if (this.deviceInfo.platform == 'web') {
      try {
        const audiosrc = await this.WebAudio.stopRecording();
        this.AudioPlayer.src = audiosrc;
        this.setAudioAvailable(true);
      } catch (error) {
        this.Microphone.Errors.next(error);
        this.Log.addLog(error);
        this.setAudioAvailable(false);
      }
    } else {
      let err = new Error('Unsupported platform: ' + this.deviceInfo.platform);
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

  audioTrackEnded(event: any) {
    this.isAudioPlaying = false;
  }

  alarmSirenClicked() {
    this.Speakerphone.IsActive = !this.Speakerphone.IsActive;
    this.Speakerphone.Activity.next(this.Speakerphone.IsActive);
  }

  setAudioAvailable(status: boolean) {
    this.isAudioAvailable = status;
    this.Microphone.AudioAvailable.next(this.isAudioAvailable);
  }

  async getDeviceInfo() {
    this.deviceInfo = await Device.getInfo();
  }
}
