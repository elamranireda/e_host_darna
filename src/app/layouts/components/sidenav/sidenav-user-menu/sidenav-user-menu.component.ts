import { Component, OnInit } from '@angular/core';
import { AppPopoverRef } from '@app/components/app-popover/app-popover-ref';
import { MatRippleModule } from '@angular/material/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidenav-user-menu',
  templateUrl: './sidenav-user-menu.component.html',
  styleUrls: ['./sidenav-user-menu.component.scss'],
  imports: [MatRippleModule, RouterLink, MatIconModule],
  standalone: true
})
export class SidenavUserMenuComponent implements OnInit {
  constructor(private readonly popoverRef: AppPopoverRef) {}

  ngOnInit(): void {}

  close(): void {
    /** Wait for animation to complete and then close */
    setTimeout(() => this.popoverRef.close(), 250);
  }
}
