//app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
//import { ToastsComponent } from './shared/components/toasts.component';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet, /*ToastsComponent*/],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {}
