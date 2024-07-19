import { Component, OnInit } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular'; // Angular Data Grid Component
import { webSocket } from 'rxjs/webSocket';

import {
  ColDef,
  FirstDataRenderedEvent,
  GetRowIdFunc,
  GetRowIdParams,
  GridApi,
  GridReadyEvent,
  SparklineColumnFormatter,
} from 'ag-grid-community'; // Column Definition Type Interface
import 'ag-grid-charts-enterprise';
import { CustomChartCellComponent } from './custom-chart-cell/custom-chart-cell.component';
import { bufferCount, filter, map, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';

type CoinApiQuoteMessage = {
  time_exchange: Date;
  time_coinapi: Date;
  ask_price: number;
  ask_size: number;
  bid_size: number;
  bid_price: number;
  symbol_id: string;
  sequence: number;
};

type GridRowData = {
  exchangeId: string;
  price: number;
  priceHistory: number[];
  balanceHistory: number[];
  trendHistory: { time: number; trend: number; value: number }[];
};

@Component({
  selector: 'app-grid-demo',
  standalone: true,
  imports: [AgGridAngular, CommonModule],
  templateUrl: './grid-demo.component.html',
  styleUrl: './grid-demo.component.scss',
})
export class GridDemoComponent implements OnInit {
  private gridApi!: GridApi;
  popupParent: HTMLElement | null = document.body;
  price$: Observable<{ current: number; higher: boolean }> | undefined;
  detailCellRenderer: any = CustomChartCellComponent;
  rowData: GridRowData[] = [];
  colDefs: ColDef[] = [
    {
      field: 'exchangeId',
      cellRenderer: 'agGroupCellRenderer',
      headerName: 'Exchange',
    },
    {
      field: 'price',
      enableCellChangeFlash: true,
      cellRenderer: 'agAnimateShowChangeCellRenderer',
    },
    {
      field: 'trendHistory',
      cellRenderer: CustomChartCellComponent,
      cellRendererParams: {},
    },

    {
      field: 'balanceHistory',
      cellRenderer: 'agSparklineCellRenderer',
      cellRendererParams: {
        sparklineOptions: {
          type: 'column',
          formatter: barFormatter,
        },
      },
    },
    {
      field: 'priceHistory',
      cellRenderer: 'agSparklineCellRenderer',
      cellRendererParams: {
        sparklineOptions: {
          type: 'area',
          fill: 'rgba(216, 204, 235, 0.0)',
          stroke: '#0099FF',
        },
      },
    },
  ];

  ngOnInit(): void {
    const subject = webSocket(
      `wss://ws.coinapi.io/v1/?apikey=${environment.coinApiKey}` // APAN TODO: remove secret key
    );

    // Observable
    this.price$ = subject.asObservable().pipe(
      map((msg) => {
        return msg as CoinApiQuoteMessage;
      }),
      filter((msg) => msg.symbol_id == 'COINBASE_SPOT_BTC_USDT'),
      map((msg) => msg.ask_price),
      bufferCount(2),
      map(([a, b]) => ({ current: (a + b) / 2, higher: b > a }))
    );

    // Subscription
    subject.subscribe({
      next: (msg) => {
        const parsedMsg = msg as CoinApiQuoteMessage;
        if (!parsedMsg.symbol_id) return;
        const row = this.gridApi.getRowNode(parsedMsg.symbol_id);
        if (!row) {
          this.rowData = [
            ...this.rowData,
            {
              exchangeId: parsedMsg.symbol_id,
              price: parsedMsg.ask_price,
              priceHistory: [parsedMsg.bid_size],
              balanceHistory: [parsedMsg.bid_size - parsedMsg.ask_size],
              trendHistory: [
                {
                  time: 0,
                  trend: parsedMsg.bid_size,
                  value: parsedMsg.bid_size - parsedMsg.ask_size,
                },
              ],
            },
          ];
        } else {
          row.setDataValue('priceHistory', [
            ...(row.data.priceHistory.length > 10
              ? row.data.priceHistory.slice(1)
              : row.data.priceHistory),
              parsedMsg.bid_size - parsedMsg.ask_size,
          ]);

          row.setDataValue('price', Number(parsedMsg.ask_price.toFixed()));

          row.setDataValue('balanceHistory', [
            ...(row.data.balanceHistory.length > 10
              ? row.data.balanceHistory.slice(1)
              : row.data.balanceHistory),
            parsedMsg.bid_size - parsedMsg.ask_size,
          ]);

          const lastTrendEntry =
            row.data.trendHistory[row.data.trendHistory.length - 1];
          row.setDataValue('trendHistory', [
            ...(row.data.trendHistory.length > 10
              ? row.data.trendHistory.slice(1)
              : row.data.trendHistory),
            {
              time: lastTrendEntry.time + 1,
              trend: parsedMsg.ask_size - parsedMsg.bid_size,
              value: parsedMsg.bid_size - parsedMsg.ask_size,
            },
          ]);
        }
      }, // Called whenever there is a message from the server.
      error: (err) => console.error(err), // Called if at any point WebSocket API signals some kind of error.
      complete: () => console.warn('complete'), // Called when connection is closed (for whatever reason).
    });

    subject.next({
      type: 'hello',
      subscribe_data_type: ['quote'],
      subscribe_filter_asset_id: ['BTC/USDT'],
      subscribe_update_limit_ms_quote: 1000,
      subscribe_filter_exchange_id: [
        'BINANCE',
        'BITMAX',
        'HITBTC',
        'COINBASE',
        'OKEX',
        'KRAKEN',
      ],
    });
  }

  getRowId: GetRowIdFunc = (params: GetRowIdParams<GridRowData>) =>
    String(params.data.exchangeId);

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
  }

  // Expanding first row
  onFirstDataRendered(params: FirstDataRenderedEvent) {
    // let isFirst = true;
    // params.api.forEachNode(function (node) {
    //   node.setExpanded(isFirst);
    //   isFirst = false;
    // });
  }
}

const barFormatter: SparklineColumnFormatter = (params) => {
  return { fill: params.yValue > 0 ? 'lightgreen' : 'coral' };
};
