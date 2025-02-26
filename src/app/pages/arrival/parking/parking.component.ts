import {Component, OnInit} from '@angular/core';
import {scaleIn400ms} from '@vex/animations/scale-in.animation';
import {fadeInRight400ms} from '@vex/animations/fade-in-right.animation';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {CommonModule, NgFor} from '@angular/common';
import {MatTabsModule} from '@angular/material/tabs';
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";


@Component({
  selector: 'ehost-home',
  templateUrl: './parking.component.html',
  styleUrls: ['./parking.component.scss'],
  animations: [scaleIn400ms, fadeInRight400ms],
  standalone: true,
  imports: [MatTabsModule, NgFor, RouterLinkActive, RouterLink, RouterOutlet, CommonModule, MatIconModule, MatButtonModule]
})
export class ParkingComponent implements OnInit {


  loading: boolean = true;

  constructor() {
  }

  ngOnInit(): void {
  }
}
