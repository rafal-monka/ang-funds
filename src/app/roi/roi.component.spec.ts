/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { RoiComponent } from './roi.component';

describe('RoiComponent', () => {
  let component: RoiComponent;
  let fixture: ComponentFixture<RoiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
