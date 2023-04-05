import { MatSliderModule } from '@angular/material/slider';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { NgIf } from '@angular/common';
import { NgxSliderModule, Options } from '@angular-slider/ngx-slider';
import { BehaviorSubject, Observable } from 'rxjs';
declare const $: any;

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    ExploreContainerComponent,
    NgIf,
    NgxSliderModule,
    MatSliderModule,
  ],
})
export class Tab1Page implements OnInit, AfterViewInit {
  @ViewChild('AudioInputContainer') audioInputContainer: any;
  @ViewChild('ChatBubbleDiv') chatBubbleDiv: any;

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
  }

  ngOnInit() {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      $('.chat-bubble').height($('.comm-animation-container').height());
    }, 1000);
  }

  volumeChanged(event: any) {
    this.microphone.Volume = event.detail.value;
  }

  AlarmSirenClicked(event: Event) {
    this.speakerphone.ActivityStream.next(!this.speakerphone.IsActive);
  }

  MicrophoneClicked(event: Event) {
    this.microphone.ActivityStream.next(!this.microphone.IsActive);
  }
}
