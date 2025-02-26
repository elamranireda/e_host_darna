import {ChangeDetectorRef, Component, DestroyRef, HostBinding, inject, Input, OnInit} from '@angular/core';
import {
  NavigationDropdown,
  NavigationItem,
  NavigationLink
} from '../../../../core/navigation/navigation-item.interface';
import {filter} from 'rxjs/operators';
import {ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive} from '@angular/router';
import {NavigationService} from '../../../../core/navigation/navigation.service';
import {MatIconModule} from '@angular/material/icon';
import {MatRippleModule} from '@angular/material/core';
import {AsyncPipe, NgClass, NgFor, NgIf} from '@angular/common';
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
  selector: 'menu-navigation-item',
  templateUrl: './menu-navigation-item.component.html',
  styleUrls: ['./menu-navigation-item.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    MatRippleModule,
    RouterLinkActive,
    RouterLink,
    MatIconModule,
    NgClass,
    NgFor,
    AsyncPipe
  ]
})
export class MenuNavigationItemComponent implements OnInit {
  @Input({required: true}) item!: NavigationItem;
  @Input({required: true}) level!: number;
  isOpen: boolean = false;
  isActive: boolean = false;

  isLink = this.navigationService.isLink;
  isDropdown = this.navigationService.isDropdown;
  isSubheading = this.navigationService.isSubheading;

  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private navigationService: NavigationService
  ) {
  }

  @HostBinding('class')
  get levelClass() {
    return `item-level-${this.level}`;
  }

  ngOnInit() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        filter(() => this.isDropdown(this.item)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.onRouteChange()
      });

    this.navigationService.openChange$
      .pipe(
        filter(() => this.isDropdown(this.item)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((item) => this.onOpenChange(item));
  }

  toggleOpen(route: string) {
    this.router.navigate([route]);
  }

  onOpenChange(item: NavigationDropdown) {
    if (this.isChildrenOf(this.item as NavigationDropdown, item)) {
      return;
    }

    if (this.hasActiveChilds(this.item as NavigationDropdown)) {
      return;
    }

    if (this.item !== item) {
      this.isOpen = false;
      this.cd.markForCheck();
    }
  }

  onRouteChange() {
    if (this.hasActiveChilds(this.item as NavigationDropdown)) {
      this.isActive = true;
      this.isOpen = true;
      this.navigationService.triggerOpenChange(this.item as NavigationDropdown);
      this.cd.markForCheck();
    } else {
      this.isActive = false;
      this.isOpen = false;
      this.navigationService.triggerOpenChange(this.item as NavigationDropdown);
      this.cd.markForCheck();
    }
  }

  isChildrenOf(parent: NavigationDropdown, item: NavigationDropdown): boolean {
    if (parent.children.indexOf(item) !== -1) {
      return true;
    }

    return parent.children
      .filter((child) => this.isDropdown(child))
      .some((child) => this.isChildrenOf(child as NavigationDropdown, item));
  }

  hasActiveChilds(parent: NavigationDropdown): boolean {
    return parent.children.some((child) => {
      if (this.isDropdown(child)) {
        return this.hasActiveChilds(child);
      }

      if (this.isLink(child) && !this.isFunction(child.route)) {
        return this.router.isActive(child.route as string, false);
      }
    });
  }

  isFunction(prop: NavigationLink['route']): boolean {
    return prop instanceof Function;
  }
}
