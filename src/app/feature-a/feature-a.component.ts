import { Component, OnInit } from '@angular/core';
import { WebWorkerService } from '../core/web-worker/web-worker.service';

@Component({
  selector: 'app-feature-a',
  templateUrl: './feature-a.component.html',
  styleUrls: ['./feature-a.component.sass']
})
export class FeatureAComponent implements OnInit {
  constructor(private webWorkerService: WebWorkerService) {}

  ngOnInit() {
    console.log('FEATURE A ONINIT');
    // this.webWorkerService.onMessage().subscribe(e => {
    //   console.log('RECEBEUOOOOO: ', e.data);
    // });
    this.webWorkerService.postMessage([2, 3]);
  }
}
