import { Component, OnInit } from '@angular/core';
import { WebWorkerService } from '../core/web-worker/web-worker.service';

declare const WorkerGlobalScope: any;
declare const objectdetect: any, Smoother: any;
@Component({
  selector: 'app-feature-a',
  templateUrl: './feature-a.component.html',
  styleUrls: ['./feature-a.component.sass']
})
export class FeatureAComponent implements OnInit {
  constructor(private webWorkerService: WebWorkerService) {}

  ngOnInit() {
    const scripts = ['http://localhost:4200/assets/libs/smoother.js'];

    this.webWorkerService.prepareWorkerGlobalScope((workerGlobalScope: any) => {
      workerGlobalScope.blah = () => console.log('say blah');
    });

    this.webWorkerService.importScripts(scripts);
    this.webWorkerService.defineConstant('niceConstant', 55);

    this.webWorkerService.onMessage((workerGlobalScope, evt, postMessage) => {
      console.log('main to webworker: ', evt.data);
      postMessage('MESSAGE RESULT');
    });
    this.webWorkerService.onMessageReceived().subscribe(msgEvt => {
      console.log('webworker to main:', msgEvt.data);
    });
    this.webWorkerService.postMessage('first postMessage');

    setTimeout(() => {
      this.webWorkerService.postMessage('nothing changed');
    }, 1000);

    setTimeout(() => {
      this.webWorkerService.prepareWorkerGlobalScope(
        (workerGlobalScope: any) => {
          workerGlobalScope.blah = () => console.log('say bleh');
        }
      );
      this.webWorkerService.postMessage('workerGlobalScope changed');
    }, 2000);

    setTimeout(() => {
      this.webWorkerService.postMessage('nothing changed');
    }, 3000);

    setTimeout(() => {
      this.webWorkerService.importScript(
        'http://localhost:4200/assets/libs/js-objectdetect/js/objectdetect-ww.js'
      );
      this.webWorkerService.postMessage('scripts changed');
    }, 4000);

    setTimeout(() => {
      this.webWorkerService.postMessage('nothing changed');
    }, 5000);

    setTimeout(() => {
      this.webWorkerService.onMessage((workerGlobalScope, e) => {
        console.log('onMessage 2', e.data);
      });
      this.webWorkerService.postMessage('onMessage changed');
    }, 6000);

    setTimeout(() => {
      this.webWorkerService.postMessage('nothing changed');
    }, 7000);

    setTimeout(() => {
      this.webWorkerService.onMessageError((workerGlobalScope, e) => {
        console.log('onMessageError 2', e);
      });
      this.webWorkerService.postMessage('onMessageError changed');
    }, 8000);

    setTimeout(() => {
      this.webWorkerService.postMessage('nothing changed');
    }, 9000);

    setTimeout(() => {
      this.webWorkerService.onError((workerGlobalScope, e) => {
        console.log('onError 2', e);
      });
      this.webWorkerService.postMessage('onError changed');
    }, 10000);

    setTimeout(() => {
      this.webWorkerService.postMessage('nothing changed');
    }, 11000);

    setTimeout(() => {
      this.webWorkerService.defineConstant('anooother', 'hehe');
      this.webWorkerService.postMessage('constants changed');
    }, 12000);

    setTimeout(() => {
      this.webWorkerService.postMessage('nothing changed');
    }, 13000);
  }

  private testObjectDetect() {
    const scripts = [
      'http://localhost:4200/assets/libs/smoother.js',
      'http://localhost:4200/assets/libs/js-objectdetect/js/objectdetect-ww.js',
      'http://localhost:4200/assets/libs/js-objectdetect/js/objectdetect.frontalface.js'
    ];

    this.webWorkerService.importScripts(scripts);

    this.webWorkerService.prepareWorkerGlobalScope((workerGlobalScope: any) => {
      workerGlobalScope.blah = () => console.log('say bleh');
    });

    this.webWorkerService.onMessage((workerGlobalScope, e) => {
      console.log('onMessage');
      workerGlobalScope.blah();
      const width = 500;
      const height = 500;
      const detector = new workerGlobalScope.objectdetect.detector(
        width,
        height,
        1.1,
        workerGlobalScope.objectdetect.frontalface
      );
      console.log(e.data);
      const coords = detector.detect(e.data, 1);
      console.log(coords);
    });

    const width = 500;
    const height = 500;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    const video = document.createElement('video');
    video.width = width;
    video.height = height;
    context.drawImage(video, 0, 0, width, height);
    const imageData = context.getImageData(0, 0, width, height).data;
    this.webWorkerService.postMessage(imageData);
  }
}
