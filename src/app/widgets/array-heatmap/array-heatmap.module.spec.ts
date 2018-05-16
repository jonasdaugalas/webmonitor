import { ArrayHeatmapModule } from './array-heatmap.module';

describe('ArrayHeatmapModule', () => {
  let arrayHeatmapModule: ArrayHeatmapModule;

  beforeEach(() => {
    arrayHeatmapModule = new ArrayHeatmapModule();
  });

  it('should create an instance', () => {
    expect(arrayHeatmapModule).toBeTruthy();
  });
});
