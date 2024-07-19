import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomChartCellComponent } from './custom-chart-cell.component';

describe('CustomChartCellComponent', () => {
  let component: CustomChartCellComponent;
  let fixture: ComponentFixture<CustomChartCellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomChartCellComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomChartCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
