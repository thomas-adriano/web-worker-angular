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
    const scripts = [
      'http://localhost:4200/assets/libs/smoother.js',
      'http://localhost:4200/assets/libs/js-objectdetect/js/objectdetect-ww.js',
      'http://localhost:4200/assets/libs/js-objectdetect/js/objectdetect.frontalface.js'
    ];

    this.webWorkerService.importScripts(scripts);

    this.webWorkerService.prepareWorkerGlobalScope((workerGlobalScope: any) => {
      workerGlobalScope.blah = () => console.log('say blah');
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
