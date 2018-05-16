import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FeatureARoutingModule } from './feature-a-routing.module';
import { FeatureAComponent } from './feature-a.component';
import { WebWorkerService } from '../core/web-worker/web-worker.service';

@NgModule({
  imports: [FeatureARoutingModule],
  declarations: [FeatureAComponent],
  providers: [WebWorkerService]
})
export class FeatureAModule {}
