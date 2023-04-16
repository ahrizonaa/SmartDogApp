import { Injectable } from '@angular/core';
import { BehaviorSubject, skip } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LogService {
  LogStream!: BehaviorSubject<any>;
  Logs: any[] = [];

  constructor() {
    this.initLogStream();
  }

  addLog(log: any) {
    this.Logs.push(log);
    this.LogStream.next(log);
  }

  initLogStream() {
    this.LogStream = new BehaviorSubject<any>({}).pipe(
      skip(1)
    ) as BehaviorSubject<any>;
  }
}
