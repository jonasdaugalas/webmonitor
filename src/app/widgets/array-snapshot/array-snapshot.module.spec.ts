import { ArraySnapshotModule } from './array-snapshot.module';

describe('ArraySnapshotModule', () => {
  let arraySnapshotModule: ArraySnapshotModule;

  beforeEach(() => {
    arraySnapshotModule = new ArraySnapshotModule();
  });

  it('should create an instance', () => {
    expect(arraySnapshotModule).toBeTruthy();
  });
});
