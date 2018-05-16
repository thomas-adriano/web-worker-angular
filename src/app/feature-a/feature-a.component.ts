import { Component, OnInit } from '@angular/core';
import { WebWorkerService } from '../core/web-worker/web-worker.service';

declare const WorkerGlobalScope: any;
@Component({
  selector: 'app-feature-a',
  templateUrl: './feature-a.component.html',
  styleUrls: ['./feature-a.component.sass']
})
export class FeatureAComponent implements OnInit {
  constructor(private webWorkerService: WebWorkerService) {}

  ngOnInit() {
    this.webWorkerService.addPropertyToWorkerGlobalScope((scope: any) => {
      scope.blah = () => console.log('BLAH');
    });

    this.webWorkerService.onMessage(e => {
      console.log('RECEBEUOOOOO: ', e.data);
      blah();
    });

    this.webWorkerService.postMessage([2, 3]);
  }
}
