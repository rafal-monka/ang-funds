/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TfisComponent } from './tfis.component';

describe('TfisComponent', () => {
  let component: TfisComponent;
  let fixture: ComponentFixture<TfisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TfisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TfisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
