import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Observer, Subscribable, Subscriber } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebWorkerService implements EventTarget, OnDestroy {
  private worker: Worker;
  private onMessageFn: (
    workerGlobalScope: any,
    evt: MessageEvent,
    postMessage: (a: any) => void
  ) => void;
  private lastOnMessageFn: (
    workerGlobalScope: any,
    evt: MessageEvent,
    postMessage: (a: any) => void
  ) => void;
  private onErrorFn: (workerGlobalScope: any, evt: ErrorEvent) => void;
  private lastOnErrorFn: (workerGlobalScope: any, evt: ErrorEvent) => void;
  private onMessageErrorFn: (workerGlobalScope: any, evt: ErrorEvent) => void;
  private lastOnMessageErrorFn: (
    workerGlobalScope: any,
    evt: ErrorEvent
  ) => void;
  private workerGlobalScopeConsumer: (workerGlobalScope: any) => void;
  private lastWorkerGlobalScopeConsumer: (workerGlobalScope: any) => void;
  private constants = [];
  private lastConstants = [];
  private importedScripts: string[] = [];
  /**
   * indica se um novo script foi adicionado. É utilizado para saber se o worker
   * deve ser recriado ou não
   */
  private scriptAdded: boolean;
  /**
   * indica se houve alguma alteração ainda não incorporada nas propriedades do webworker.
   * Alterações são incorporadas ao executar o postMessage();
   */
  private dirty = false;
  private onMessageReceivedObservable: Observable<MessageEvent>;
  private onMessageReceivedObserver: Observer<MessageEvent>;

  constructor() {
    this.onMessageReceivedObservable = new Observable(observer => {
      this.onMessageReceivedObserver = observer;
    });
  }

  ngOnDestroy() {
    this.onMessageReceivedObserver.complete();
  }

  public postMessage(message: any, transfer?: any[]): void {
    if (!message || !this.onMessageFn) {
      return;
    }
    if (!this.worker || this.workerPropertiesChanged()) {
      console.log('CREATED');
      this.worker = new Worker(URL.createObjectURL(this.getScriptBlob()));
      this.worker.onmessage = (evt: MessageEvent) => {
        this.onMessageReceivedObserver.next(evt);
      };
      this.worker.onerror = (evt: ErrorEvent) => {
        this.onMessageReceivedObserver.error(evt);
      };
      // como o worker foi recriado, seta esta flag para false
      this.scriptAdded = false;
      this.dirty = false;
    }
    this.worker.postMessage(message, transfer);
  }

  public importScript(script: string) {
    let newStr = script;
    if (!script.startsWith("'")) {
      // a url destes scripts devem estar entre aspas simples
      newStr = "'" + script + "'";
    }
    this.importedScripts.push(newStr);
    // novo script adicionado, seta a flag para true para indicar a necessidade
    // da criacao de um novo worker
    this.scriptAdded = true;
    this.dirty = true;
  }

  public importScripts(scripts: string[]) {
    scripts.forEach(s => {
      this.importScript(s);
    });
  }

  public prepareWorkerGlobalScope(c: (workerGlobalScope: any) => void) {
    this.dirty = true;
    this.lastWorkerGlobalScopeConsumer = this.workerGlobalScopeConsumer;
    this.workerGlobalScopeConsumer = c;
  }

  public defineConstant(name: string, value: any) {
    this.dirty = true;
    this.constants.push({ name, value });
  }

  public onMessageReceived(): Observable<MessageEvent> {
    return this.onMessageReceivedObservable;
  }

  public onMessage(
    fn: (
      workerGlobalScope: any,
      evt: MessageEvent,
      postMessage?: (a: any) => void
    ) => void
  ): void {
    this.dirty = true;
    this.lastOnMessageFn = this.onMessageFn;
    this.onMessageFn = fn;
  }

  public onMessageError(
    fn: (workerGlobalScope: any, evt: ErrorEvent) => void
  ): void {
    this.dirty = true;
    this.lastOnMessageErrorFn = this.onMessageErrorFn;
    this.onMessageErrorFn = fn;
  }

  public onError(fn: (workerGlobalScope: any, evt: ErrorEvent) => void): void {
    this.dirty = true;
    this.lastOnErrorFn = this.onErrorFn;
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

  private workerPropertiesChanged(): boolean {
    const onMessageFirstChange = !this.lastOnMessageFn && !!this.onMessageFn;
    const onMessageChanged =
      onMessageFirstChange ||
      (this.lastOnMessageFn
        ? this.lastOnMessageFn.toString() !== this.onMessageFn.toString()
        : false);

    const onMessageErrorFirstChange =
      !this.lastOnMessageErrorFn && !!this.onMessageErrorFn;
    const onMessageErrorChanged =
      onMessageErrorFirstChange ||
      (this.lastOnMessageErrorFn
        ? this.lastOnMessageErrorFn.toString() !==
          this.onMessageErrorFn.toString()
        : false);

    const onErrorFirstChange = !this.lastOnErrorFn && !!this.onErrorFn;
    const onErrorChanged =
      onErrorFirstChange ||
      (this.lastOnErrorFn
        ? this.lastOnErrorFn.toString() !== this.onErrorFn.toString()
        : false);

    const workerGlobalScopeConsumerFirstChange =
      !this.lastWorkerGlobalScopeConsumer && !!this.workerGlobalScopeConsumer;
    const workerGlobalScopeConsumerChanged =
      workerGlobalScopeConsumerFirstChange ||
      (this.lastWorkerGlobalScopeConsumer
        ? this.lastWorkerGlobalScopeConsumer.toString() !==
          this.workerGlobalScopeConsumer.toString()
        : false);

    const constantsFirstChange =
      !this.lastConstants.length && !!this.constants.length;
    const constantsChanged =
      constantsFirstChange ||
      (this.lastConstants
        ? this.lastConstants.toString() !== this.constants.toString()
        : false);

    return (
      this.dirty &&
      (onMessageChanged ||
        onMessageErrorChanged ||
        onErrorChanged ||
        workerGlobalScopeConsumerChanged ||
        constantsChanged ||
        this.scriptAdded)
    );
  }

  private interpolateConstants() {
    if (!this.constants) {
      return '';
    }

    return this.constants
      .map(e => {
        let val = e.value;
        if (typeof val === 'string') {
          val = `'${val}'`;
        }
        return `const ${e.name} = ${val};`;
      })
      .join('\n');
  }

  private getScriptBlob() {
    return new Blob(
      [
        `
        importScripts(${this.importedScripts.join(', ')});

        ${this.interpolateConstants()}

        ${
          this.workerGlobalScopeConsumer
            ? '(' + this.workerGlobalScopeConsumer.toString() + ')(this)'
            : undefined
        };

        onmessage = function(evt) {
          (${this.onMessageFn.toString()})(this, evt, postMessage);
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
  }
}
