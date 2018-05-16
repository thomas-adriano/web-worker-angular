import { FeatureAModule } from './feature-a.module';

describe('FeatureAModule', () => {
  let featureAModule: FeatureAModule;

  beforeEach(() => {
    featureAModule = new FeatureAModule();
  });

  it('should create an instance', () => {
    expect(featureAModule).toBeTruthy();
  });
});
