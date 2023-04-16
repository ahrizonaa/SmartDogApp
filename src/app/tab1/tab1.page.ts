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
import { AudioController } from '../classes/AudioController';

declare const $: any;

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, NgxSliderModule, MatSliderModule],
})
export class Tab1Page implements OnInit, AfterViewInit {
  @ViewChild('AudioPlayer')
  audioPlayer!: ElementRef;
  @ViewChild('AudioPlaybackContainer')
  audioPlaybackContainer!: ElementRef;
  navigator: any = window.navigator;
  AudioController: AudioController;

  heartsensor: any;
  sliderOptions: Options;
  toastErrorMessage: string;
  isToastOpen: boolean;
  activeSirenIcon: string;
  chatBubbleIconSrc: string;
  isAudioAvailable: boolean;

  constructor() {
    this.toastErrorMessage = '';
    this.isToastOpen = false;
    this.activeSirenIcon = '/assets/siren-off.svg';
    this.chatBubbleIconSrc = '/assets/chat-single.svg';
    this.isAudioAvailable = false;
    this.AudioController = new AudioController();
    this.heartsensor = {
      IsAlertActive: false,
    };

    this.sliderOptions = {
      floor: 0,
      ceil: 10,
      vertical: true,
    };
  }

  ngOnInit() {}

  ngAfterViewInit(): void {
    this.AudioController.setAudioPlayer(this.audioPlayer.nativeElement);
    this.AudioController.Speakerphone.Activity.subscribe(
      (isActive: boolean) => {
        this.activeSirenIcon = isActive
          ? '/assets/siren-on.svg'
          : '/assets/siren-off.svg';
      }
    );

    this.AudioController.Microphone.Activity.subscribe((isActive: boolean) => {
      this.chatBubbleIconSrc = isActive
        ? '/assets/chat-duo.svg'
        : '/assets/chat-single.svg';
    });

    this.AudioController.Microphone.Errors.subscribe((error: Error) => {
      if (error) {
        this.toastErrorMessage = error.toString();
        this.isToastOpen = true;
      }
    });

    this.AudioController.Microphone.AudioAvailable.subscribe(
      (isAvailable: boolean) => {
        this.isAudioAvailable = isAvailable;
        if (this.isAudioAvailable) {
          this.audioPlaybackContainer.nativeElement.style.display = 'flex';
        }
      }
    );
  }

  volumeChanged(event: any) {
    this.AudioController.volumeChanged(event.target.value / 10);
  }

  AlarmSirenClicked(event: Event) {
    this.AudioController.alarmSirenClicked();
  }

  MicrophoneClicked(event: Event) {
    this.AudioController.microphoneToggle();
  }

  videoEvt(event: any | Event) {}

  toastDismissed(event: any) {
    this.toastErrorMessage = '';
    this.isToastOpen = false;
  }
}
