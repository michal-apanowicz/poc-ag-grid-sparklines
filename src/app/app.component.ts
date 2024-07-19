import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GridDemoComponent } from './grid-demo/grid-demo.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GridDemoComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'ag-demo';
}
