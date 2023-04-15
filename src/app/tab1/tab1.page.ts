import { MatSliderModule } from '@angular/material/slider';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { NgxSliderModule, Options } from '@angular-slider/ngx-slider';
import { BehaviorSubject } from 'rxjs';
import { IonContent } from '@ionic/angular';

declare const $: any;

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, NgxSliderModule, MatSliderModule],
})
export class Tab1Page implements OnInit, AfterViewInit {
  @ViewChild('AudioInputContainer') audioInputContainer: any;
  @ViewChild(IonContent)
  ionContent!: IonContent;
  @ViewChild('AudioPlayer', { read: ElementRef })
  audioPlayer!: ElementRef<HTMLAudioElement>;
  navigator: any = window.navigator;

  isMicrophoneActive: boolean;
  heartsensor: any;
  speakerphone: any;
  microphone: any;
  sliderOptions: Options;

  constructor() {
    this.isMicrophoneActive = false;
    this.heartsensor = {
      IsAlertActive: false,
    };
    this.speakerphone = {
      IsActive: false,
      ActivityStream: new BehaviorSubject<boolean>(false),
      ActiveSirenIcon: '/assets/siren-off.svg',
    };
    this.microphone = {
      IsActive: false,
      ActivityStream: new BehaviorSubject<boolean>(false),
      Volume: 5,
      chatBubbleDivHeight: 'auto',
      chatBubbleIconSrc: '/assets/chat-single.svg',
    };
    this.sliderOptions = {
      floor: 0,
      ceil: 10,
      vertical: true,
    };

    this.speakerphone.ActivityStream.subscribe((isActive: boolean) => {
      this.speakerphone.IsActive = isActive;
      this.speakerphone.ActiveSirenIcon = isActive
        ? '/assets/siren-on.svg'
        : '/assets/siren-off.svg';
    });

    this.microphone.ActivityStream.subscribe((isActive: boolean) => {
      this.microphone.IsActive = isActive;
      this.microphone.chatBubbleIconSrc = isActive
        ? '/assets/chat-duo.svg'
        : '/assets/chat-single.svg';
    });

    this.microphone.ActivityStream.subscribe((isActive: boolean) => {
      if (isActive) {
        this.getUserAudio();
      } else {
        this.stopUserAudio();
      }
    });
  }

  ngOnInit() {}

  ngAfterViewInit(): void {}

  volumeChanged(event: any) {
    this.microphone.Volume = event.detail.value;
  }

  AlarmSirenClicked(event: Event) {
    this.speakerphone.ActivityStream.next(!this.speakerphone.IsActive);
  }

  MicrophoneClicked(event: Event) {
    this.microphone.ActivityStream.next(!this.microphone.IsActive);
  }

  successCallback(stream: any) {
    this.audioPlayer.nativeElement.src = URL.createObjectURL(stream);
  }

  errorCallback(error: any) {
    //on failure, log the error
    console.log('navigator.getUserMedia error: ', error);
  }

  getUserAudio() {
    this.navigator.getUserMedia =
      this.navigator.getUserMedia ||
      this.navigator.webkitGetUserMedia ||
      this.navigator.mozGetUserMedia;

    this.navigator.getUserMedia(
      { audio: true, video: false },
      this.successCallback,
      this.errorCallback
    );
  }

  stopUserAudio() {
    this.audioPlayer.nativeElement.src = '';
  }

  videoEvt(event: any | Event) {
    // $('ion-card#camera-3d-safety ion-card-content').height(
    //   event.target.offsetHeight
    // );

    $('ion-card#camera-3d-safety ion-card-content').height(
      event.target.offsetHeight + $('div.safety-3d-vision').height()
    );
  }
}
