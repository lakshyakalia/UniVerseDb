import { TestBed } from '@angular/core/testing';

import { UniverseDataService } from './universe-data.service';

describe('UniverseDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UniverseDataService = TestBed.get(UniverseDataService);
    expect(service).toBeTruthy();
  });
});
