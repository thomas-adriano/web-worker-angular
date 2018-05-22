import { Injectable } from '@angular/core';
import { Observable, Observer, Subscribable, Subscriber } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebWorkerService implements EventTarget {
  private worker: Worker;
  private onMessageFn: (workerGlobalScope: any, evt: MessageEvent) => void;
  private onErrorFn: (workerGlobalScope: any, evt: ErrorEvent) => void;
  private onMessageErrorFn: (workerGlobalScope: any, evt: ErrorEvent) => void;
  private workerGlobalScopeConsumer: (workerGlobalScope: any) => void;
  private importedScripts: string[] = [];

  constructor() {}

  public postMessage(message: any, transfer?: any[]): void {
    if (!message || !this.onMessageFn) {
      return;
    }
    const blob = new Blob(
      [
        `
        importScripts(${this.importedScripts.join(', ')});

        ${
          this.workerGlobalScopeConsumer
            ? '(' + this.workerGlobalScopeConsumer.toString() + ')(this)'
            : undefined
        };

        onmessage = function(evt) {
          (${this.onMessageFn.toString()})(this, evt);
        };
        
        onmessageerror = function(evt) {
          ${
            this.onMessageErrorFn
              ? '(' + this.onMessageErrorFn.toString() + ')(this, evt)'
              : undefined
          };
        }

        onerror = function(evt) {
          ${
            this.onErrorFn
              ? '(' + this.onErrorFn.toString() + ')(this, evt)'
              : undefined
          };
        }
      `
      ],
      { type: 'text/javascript' }
    );

    this.worker = new Worker(URL.createObjectURL(blob));
    this.worker.postMessage(message, transfer);
  }

  public importScript(script: string) {
    let newStr = script;
    if (!script.startsWith("'")) {
      // a url destes scripts devem estar entre aspas simples
      newStr = "'" + script + "'";
    }
    this.importedScripts.push(newStr);
  }

  public importScripts(scripts: string[]) {
    scripts.forEach(s => {
      this.importScript(s);
    });
  }

  public prepareWorkerGlobalScope(c: (workerGlobalScope: any) => void) {
    this.workerGlobalScopeConsumer = c;
  }

  public onMessage(
    fn: (workerGlobalScope: any, evt: MessageEvent) => void
  ): void {
    this.onMessageFn = fn;
  }

  public onMessageError(
    fn: (workerGlobalScope: any, evt: ErrorEvent) => void
  ): void {
    this.onMessageErrorFn = fn;
  }

  public onError(fn: (workerGlobalScope: any, evt: ErrorEvent) => void): void {
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
