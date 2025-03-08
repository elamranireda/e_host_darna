import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  standalone: true,
  imports: [MatButtonModule, MatIconModule]
})
export class FooterComponent implements OnInit, OnDestroy {
  constructor() {}

  ngOnInit() {}

  ngOnDestroy(): void {}
}
