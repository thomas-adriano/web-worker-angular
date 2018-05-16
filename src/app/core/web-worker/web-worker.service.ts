import { Injectable } from '@angular/core';
import { Observable, Observer, Subscribable, Subscriber } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebWorkerService implements EventTarget {
  private worker: Worker;
  private onMessageFn: Function;
  private onErrorFn: Function;
  private workerGlobalScopeConsumer: Function;

  constructor() {}

  public postMessage(message: any, transfer?: any[]): void {
    if (!message || !this.onMessageFn) {
      return;
    }
    const blob = new Blob(
      [
        `
        ${
          this.workerGlobalScopeConsumer
            ? '(' + this.workerGlobalScopeConsumer.toString() + ')(this)'
            : undefined
        };
        onmessage = ${this.onMessageFn.toString()};
        onerror = ${this.onErrorFn ? this.onErrorFn.toString() : undefined};
      `
      ],
      { type: 'text/javascript' }
    );

    this.worker = new Worker(URL.createObjectURL(blob));
    this.worker.postMessage(message, transfer);
  }

  public addPropertyToWorkerGlobalScope(c: Function) {
    console.log(c.toString());
    this.workerGlobalScopeConsumer = c;
  }

  public onMessage(fn: Function): void {
    this.onMessageFn = fn;
  }

  public onError(fn: Function): void {
    this.onErrorFn = fn;
  }

  public terminate(): void {
    if (!this.worker) {
      return;
    }
    this.worker.terminate();
  }

  public addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject
  ): void {
    if (!this.worker) {
      return;
    }
    this.worker.addEventListener(type, listener);
  }

  public removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject
  ): void {
    if (!this.worker) {
      return;
    }
    this.worker.removeEventListener(type, listener);
  }

  public dispatchEvent(evt: Event): boolean {
    if (!this.worker) {
      return false;
    }
    return this.worker.dispatchEvent(evt);
  }
}
