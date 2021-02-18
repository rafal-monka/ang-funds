/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TableLoComponent } from './table-lo.component';

describe('TableLoComponent', () => {
  let component: TableLoComponent;
  let fixture: ComponentFixture<TableLoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableLoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableLoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
