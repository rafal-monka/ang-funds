/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { EtfValueRateComponent } from './etf-value-rate.component';

describe('EtfValueRateComponent', () => {
  let component: EtfValueRateComponent;
  let fixture: ComponentFixture<EtfValueRateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EtfValueRateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EtfValueRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
