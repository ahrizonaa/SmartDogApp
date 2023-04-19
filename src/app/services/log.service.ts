import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, skip } from 'rxjs';
import { Device, DeviceInfo } from '@capacitor/device';

@Injectable({
  providedIn: 'root',
})
export class LogService {
  LogStream!: BehaviorSubject<any>;
  Logs: any[] = [];
  urlLocal: string = 'http://localhost:8080/nimblewear/log';
  urlProd: string =
    'https://charmee-webservices-7sgqd.ondigitalocean.app/nimblewear/log';
  deviceInfo!: DeviceInfo;

  constructor(private http: HttpClient) {
    this.initLogStream();
    this.getDeviceInfo();
  }

  addLog(log: any) {
    this.Logs.push(log);
    this.LogStream.next(log);
    this.postLog(log);
  }

  private postLog(log: any): void {
    this.http
      .post(this.urlLocal, {
        log: log.toString(),
        clientDateTime: new Date().toISOString(),
        deviceInfo: this.deviceInfo,
      })
      .subscribe((res: any) => {
        if (!res.acknowledged) {
          throw new Error('Logging error');
        }
      });
  }

  initLogStream() {
    this.LogStream = new BehaviorSubject<any>({}).pipe(
      skip(1)
    ) as BehaviorSubject<any>;
  }

  async getDeviceInfo() {
    this.deviceInfo = await Device.getInfo();
  }
}
