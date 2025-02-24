import {Component, OnInit} from '@angular/core';

import {ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {CommonModule, NgFor} from '@angular/common';
import {MatTabsModule} from '@angular/material/tabs';

import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {SidenavItemComponent} from "../../layouts/components/sidenav/sidenav-item/sidenav-item.component";

export interface FriendSuggestion {
  name: string;
  imageSrc: string;
  friends: number;
  added: boolean;
}

@Component({
  selector: 'vex-home',
  templateUrl: './home.component.html',
  animations: [],
  standalone: true,
  imports: [MatTabsModule, NgFor, RouterLinkActive, RouterLink, RouterOutlet, CommonModule, MatIconModule, MatButtonModule, SidenavItemComponent]
})
export class HomeComponent implements OnInit {

  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe(data => {
      console.log(data);
    });
  }

  ngOnInit(): void {

  }

}
