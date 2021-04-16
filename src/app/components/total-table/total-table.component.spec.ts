/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TotalTableComponent } from './total-table.component';

describe('TotalTableComponent', () => {
  let component: TotalTableComponent;
  let fixture: ComponentFixture<TotalTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TotalTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TotalTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
