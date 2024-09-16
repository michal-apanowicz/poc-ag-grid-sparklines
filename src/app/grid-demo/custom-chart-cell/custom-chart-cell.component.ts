import { Component } from '@angular/core';
import { AgCharts } from 'ag-charts-angular';
import { AgChartOptions } from 'ag-charts-enterprise';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-custom-chart-cell',
  standalone: true,
  imports: [AgCharts],
  templateUrl: './custom-chart-cell.component.html',
  styleUrl: './custom-chart-cell.component.scss',
})
export class CustomChartCellComponent implements ICellRendererAngularComp {
  public options: AgChartOptions;

  constructor() {
    this.options = {
      height: 40,
      width: 200,
      minHeight: 0,
      minWidth: 0,
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
      data: [],
      seriesArea: {
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
      },
      contextMenu: { enabled: false },
      toolbar: { enabled: false },
      annotations: { enabled: false },
      series: [
        {

          type: 'bar',
          xKey: 'time',
          yKey: 'value',
          itemStyler: (params) => ({
            fill: params.datum.value > 0 ? 'lightgreen' : 'coral',
          }),
          tooltip: {
            enabled: false,
          },
        },
        {
          type: 'line',
          xKey: 'time',
          yKey: 'trend',

          marker: {
            enabled: false,
          },
          strokeWidth: 1,
          stroke: '#0099FF',
          tooltip: {
            showArrow: false,
            position: {
              type: 'pointer',
            },
            renderer: function ({ datum, yKey }) {
              return `<div class="ag-sparkline-tooltip-wrapper">
                <div class="ag-sparkline-tooltip" style="opacity: 1">
                  <span class="ag-sparkline-tooltip-content">
                    ${datum[yKey]}
                  </span>
                </div>
              </div>`;
            },
          },
        },
      ],

      animation: { enabled: false },
      legend: { enabled: false },
      background: { visible: false },
      axes: [
        {
          type: 'category',
          position: 'bottom',
          label: { enabled: false },
          crosshair: { enabled: false },
        },
        {
          type: 'number',
          position: 'left',
          label: { enabled: false },
          crosshair: { enabled: false },
          gridLine: {
            enabled: false,
          },
          crossLines: [
            {
              type: 'line',
              value: 0,
              stroke: 'lightgray',
              strokeWidth: 2,
            },
          ],
          min: -100,
          max:100
        },
      ],
    };
  }

  agInit(params: ICellRendererParams): void {
    this.refresh(params);
    // console.log('APAN (params.data): ', params.data);
  }

  refresh(params: ICellRendererParams<any, any, any>): boolean {
    this.options = { ...this.options, data: params.data.trendHistory };
    return true;
  }
}

// <div class="ag-sparkline-tooltip-wrapper" style="left: 692px; top: 575px;"><div class="ag-sparkline-tooltip" style="opacity: 1">
// <span class="ag-sparkline-tooltip-content">-190</span>
// </div></div>

// <div class="ag-chart-tooltip ag-chart-tooltip-no-interaction ag-chart-tooltip-wrap-hyphenate ag-chart-tooltip-hidden" aria-hidden="true" style="transform: translate(67px, -25px);">
// <div class="ag-chart-tooltip-title" style="color: white; background-color: #2b5c95">value</div><div class="ag-chart-tooltip-content">4.0: -20.0</div></div>
