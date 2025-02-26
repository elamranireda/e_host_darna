import {Component, Input, OnInit} from '@angular/core';
import { stagger60ms } from '@vex/animations/stagger.animation';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {NgIf} from "@angular/common";
import {TranslatePipe} from "@ngx-translate/core";

@Component({
  selector: 'vex-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
  animations: [stagger60ms, fadeInUp400ms],
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatExpansionModule, NgIf, TranslatePipe]
})
export class FaqComponent implements OnInit {
  @Input() questions: string[] = [];
  @Input() email: string = 'support@example.com';
  @Input() phone: string =  '+1 (840) 423-3404';
  constructor() {}

  ngOnInit() {}
}
