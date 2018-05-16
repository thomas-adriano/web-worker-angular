import { Component, OnInit } from '@angular/core';
import { WebWorkerService } from '../core/web-worker/web-worker.service';

declare const WorkerGlobalScope: any;
declare const objectdetect, Smoother;
@Component({
  selector: 'app-feature-a',
  templateUrl: './feature-a.component.html',
  styleUrls: ['./feature-a.component.sass']
})
export class FeatureAComponent implements OnInit {
  constructor(private webWorkerService: WebWorkerService) {}

  ngOnInit() {
    this.webWorkerService.prepareWorkerGlobalScope((workerGlobalScope: any) => {
      workerGlobalScope.blah = () => console.log('BLAH');
    });

    this.webWorkerService.importScript('\'http://localhost:4200/assets/libs/smoother.js\'');
    this.webWorkerService.importScript(
      '\'http://localhost:4200/assets/libs/js-objectdetect/js/objectdetect.js\''
    );
    this.webWorkerService.importScript(
      '\'http://localhost:4200/assets/libs/js-objectdetect/js/objectdetect.frontalface.js\''
    );

    this.webWorkerService.onMessage((workerGlobalScope, e) => {
      console.log('RECEBEUOOOOO: ', e.data);
      workerGlobalScope.blah();
      const detector = new workerGlobalScope.objectdetect.detector(
        500,
        500,
        1.1,
        workerGlobalScope.objectdetect.frontalface
      );
    });

    this.webWorkerService.postMessage([2, 3]);
  }
}
