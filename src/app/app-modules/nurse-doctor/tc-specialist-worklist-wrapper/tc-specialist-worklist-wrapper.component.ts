/*
 * AMRIT – Accessible Medical Records via Integrated Technology
 * Integrated EHR (Electronic Health Records) Solution
 *
 * Copyright (C) "Piramal Swasthya Management and Research Institute"
 *
 * This file is part of AMRIT.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */
import { Component, DoCheck, OnInit } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { SetLanguageComponent } from '../../core/components/set-language.component';
import { HttpServiceService } from '../../core/services/http-service.service';

@Component({
  selector: 'app-tc-specialist-worklist-wrapper',
  templateUrl: './tc-specialist-worklist-wrapper.component.html',
  styleUrls: ['./tc-specialist-worklist-wrapper.component.css'],
})
export class TcSpecialistWorklistWrapperComponent implements OnInit, DoCheck {
  currentLanguageSet: any;
  constructor(public httpServiceService: HttpServiceService) {}

  ngOnInit() {
    this.assignSelectedLanguage();
  }
  getChangedTab: any;
  public tabChanged(tabChangeEvent: MatTabChangeEvent): void {
    console.log('changedtab', tabChangeEvent.index);
    if (tabChangeEvent.index === 0) this.getChangedTab = 'current';
    else this.getChangedTab = 'future';
  }
  ngDoCheck() {
    this.assignSelectedLanguage();
  }
  assignSelectedLanguage() {
    const getLanguageJson = new SetLanguageComponent(this.httpServiceService);
    getLanguageJson.setLanguage();
    this.currentLanguageSet = getLanguageJson.currentLanguageObject;
  }
}
