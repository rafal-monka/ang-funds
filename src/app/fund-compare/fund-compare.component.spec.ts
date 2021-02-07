/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { FundCompareComponent } from './fund-compare.component';

describe('FundCompareComponent', () => {
  let component: FundCompareComponent;
  let fixture: ComponentFixture<FundCompareComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FundCompareComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FundCompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
