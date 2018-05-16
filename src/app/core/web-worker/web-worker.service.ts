import { Injectable } from '@angular/core';
import { Observable, Observer, Subscribable, Subscriber } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebWorkerService implements EventTarget {
  private worker: Worker;
  private onMessageObservervable: Observable<MessageEvent>;
  private onMessageSubscriber: Subscriber<MessageEvent>;

  constructor() {
    const blob = new Blob(
      [
        `
        onmessage = function(e) { console.log(e.data) };
        onerror = function(e) { e.data[0].next(e.data.slice(1)[0]) };
      `
      ],
      { type: 'text/javascript' }
    );

    this.worker = new Worker(URL.createObjectURL(blob));

    this.onMessageObservervable = new Observable(subscriber => {
      console.log('observer create');
      this.onMessageSubscriber = subscriber;
    });
    this.onMessageObservervable.subscribe();
  }

  public postMessage(message: any, transfer?: any[]): void {
    if (!message) {
      return;
    }
    console.log('postmessage');
    debugger;
    this.worker.postMessage([this.onMessageSubscriber, message], transfer);
  }

  public onMessage(): Observable<MessageEvent> {
    return this.onMessageObservervable;
  }

  public onError(): Observable<ErrorEvent> {
    return new Observable(observer => {
      this.worker.onerror = (e: ErrorEvent) => {
        observer.next(e);
      };
    });
  }

  public terminate(): void {
    this.worker.terminate();
  }

  public addEventListener(): void {}

  public removeEventListener(): void {}

  public dispatchEvent(evt: Event): boolean {
    return false;
  }
}
