import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WriteDataComponent } from './write-data.component';

describe('WriteDataComponent', () => {
  let component: WriteDataComponent;
  let fixture: ComponentFixture<WriteDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WriteDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WriteDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
