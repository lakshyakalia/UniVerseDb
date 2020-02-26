import { TestBed } from '@angular/core/testing';

import { SaveDataService } from './vendor.service';

describe('SaveDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SaveDataService = TestBed.get(SaveDataService);
    expect(service).toBeTruthy();
  });
});
