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
import {
  Component,
  DoCheck,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService } from '../../../core/services/confirmation.service';
import { NurseService } from '../../shared/services';
import { CameraService } from '../../../core/services/camera.service';
import { BeneficiaryDetailsService } from '../../../core/services/beneficiary-details.service';
import { HttpServiceService } from 'src/app/app-modules/core/services/http-service.service';
import { SetLanguageComponent } from 'src/app/app-modules/core/components/set-language.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-nurse-mmu-tm-referred-worklist',
  templateUrl: './nurse-mmu-tm-referred-worklist.component.html',
  styleUrls: ['./nurse-mmu-tm-referred-worklist.component.css'],
})
export class NurseMmuTmReferredWorklistComponent
  implements OnInit, DoCheck, OnDestroy
{
  rowsPerPage = 5;
  activePage = 1;
  pagedList: any = [];
  rotate = true;

  blankTable = [1, 2, 3, 4, 5];
  beneficiaryList: any;
  filteredBeneficiaryList: any = [];
  filterTerm: any;
  currentLanguageSet: any;
  currentPage!: number;
  displayedColumns: any = [
    'sno',
    'beneficiaryID',
    'beneficiaryName',
    'gender',
    'age',
    'status',
    'fatherName',
    'district',
    'phoneNo',
    'image',
  ];
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  dataSource = new MatTableDataSource<any>();

  constructor(
    private nurseService: NurseService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private cameraService: CameraService,
    private beneficiaryDetailsService: BeneficiaryDetailsService,
    public httpServiceService: HttpServiceService,
  ) {}

  ngOnInit() {
    this.assignSelectedLanguage();
    localStorage.setItem('currentRole', 'Nurse');
    this.removeBeneficiaryDataForNurseVisit();
    this.getNurseWorklist();
    this.beneficiaryDetailsService.reset();
  }
  ngDoCheck() {
    this.assignSelectedLanguage();
  }
  assignSelectedLanguage() {
    const getLanguageJson = new SetLanguageComponent(this.httpServiceService);
    getLanguageJson.setLanguage();
    this.currentLanguageSet = getLanguageJson.currentLanguageObject;
  }
  ngOnDestroy() {
    localStorage.removeItem('currentRole');
  }

  removeBeneficiaryDataForNurseVisit() {
    localStorage.removeItem('visitCode');
    localStorage.removeItem('beneficiaryGender');
    localStorage.removeItem('benFlowID');
    localStorage.removeItem('visitCategory');
    localStorage.removeItem('visitReason');
    localStorage.removeItem('beneficiaryRegID');
    localStorage.removeItem('visitID');
    localStorage.removeItem('beneficiaryID');
    localStorage.removeItem('doctorFlag');
    localStorage.removeItem('nurseFlag');
    localStorage.removeItem('pharmacist_flag');
    localStorage.removeItem('specialistFlag');
    localStorage.removeItem('visitCat');
    localStorage.removeItem('mmuReferredVisitCode');
    localStorage.removeItem('referredVisitCode');
  }

  getNurseWorklist() {
    this.nurseService.getMMUNurseWorklist().subscribe(
      (res: any) => {
        if (res.statusCode === 200 && res.data !== null) {
          const benlist = this.loadDataToBenList(res.data);
          this.beneficiaryList = benlist;
          this.filteredBeneficiaryList = benlist;
          this.dataSource.data = [];
          this.dataSource.data = benlist;
          this.dataSource.paginator = this.paginator;
          this.dataSource.data.forEach((sectionCount: any, index: number) => {
            sectionCount.sno = index + 1;
          });
          this.filterTerm = null;
        } else this.confirmationService.alert(res.errorMessage, 'error');
        this.dataSource.data = [];
        this.dataSource.paginator = this.paginator;
      },
      (err) => {
        this.confirmationService.alert(err, 'error');
      },
    );
  }

  loadDataToBenList(data: any) {
    data.forEach((element: any) => {
      element.genderName = element.genderName || 'Not Available';
      element.age = element.age || 'Not Available';
      element.benVisitNo = element.benVisitNo || 'Not Available';
      element.districtName = element.districtName || 'Not Available';
      element.villageName = element.villageName || 'Not Available';
      element.fatherName = element.fatherName || 'Not Available';
      element.preferredPhoneNum = element.preferredPhoneNum || 'Not Available';
    });
    return data;
  }

  pageChanged(event: any): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.pagedList = this.filteredBeneficiaryList.slice(startItem, endItem);
  }

  patientImageView(benregID: any) {
    this.beneficiaryDetailsService
      .getBeneficiaryImage(benregID)
      .subscribe((data: any) => {
        if (data && data.benImage) this.cameraService.viewImage(data.benImage);
        else
          this.confirmationService.alert(
            this.currentLanguageSet.alerts.info.imageNotFound,
          );
      });
  }

  loadNursePatientDetails(beneficiary: any) {
    localStorage.removeItem('visitCategory');
    localStorage.removeItem('visitReason');
    if (beneficiary.nurseFlag === 100) {
      this.confirmationService
        .confirm(
          `info`,
          this.currentLanguageSet.alerts.info.confirmtoProceedFurther,
        )
        .subscribe((result) => {
          if (result) {
            localStorage.setItem('visitCode', beneficiary.visitCode);
            localStorage.setItem('beneficiaryGender', beneficiary.genderName);
            localStorage.setItem('visitCategory', 'NCD screening');
            localStorage.setItem('visitID', beneficiary.benVisitID);
            localStorage.setItem('nurseFlag', beneficiary.nurseFlag);
            localStorage.setItem(
              'beneficiaryRegID',
              beneficiary.beneficiaryRegID,
            );
            localStorage.setItem('benFlowID', beneficiary.benFlowID);
            localStorage.setItem('beneficiaryID', beneficiary.beneficiaryID);
            localStorage.setItem('specialistFlag', beneficiary.specialist_flag);
            this.router.navigate([
              '/nurse-doctor/attendant/nurse/patient/',
              beneficiary.beneficiaryRegID,
            ]);
          }
        });
    } else {
      this.confirmationService
        .confirm(
          `info`,
          this.currentLanguageSet.alerts.info.confirmtoProceedFurther,
        )
        .subscribe((result) => {
          if (result) {
            localStorage.setItem('beneficiaryGender', beneficiary.genderName);
            localStorage.setItem(
              'beneficiaryRegID',
              beneficiary.beneficiaryRegID,
            );
            localStorage.setItem('benFlowID', beneficiary.benFlowID);
            localStorage.setItem('beneficiaryID', beneficiary.beneficiaryID);
            localStorage.setItem('specialistFlag', beneficiary.specialist_flag);

            localStorage.setItem('visitCode', beneficiary.referredVisitCode);
            localStorage.setItem('visitCat', beneficiary.VisitCategory);
            localStorage.setItem('visitID', beneficiary.referred_visit_id);
            localStorage.setItem(
              'mmuReferredVisitCode',
              beneficiary.referredVisitCode,
            );

            this.router.navigate([
              '/nurse-doctor/attendant/nurse/patient/',
              beneficiary.beneficiaryRegID,
            ]);
          }
        });
    }
  }

  filterBeneficiaryList(searchTerm: string) {
    if (!searchTerm) {
      this.filteredBeneficiaryList = this.beneficiaryList;
      this.dataSource.data = this.filteredBeneficiaryList;
      this.dataSource.paginator = this.paginator;
      this.dataSource.data.forEach((sectionCount: any, index: number) => {
        sectionCount.sno = index + 1;
      });
    } else {
      this.filteredBeneficiaryList = [];
      this.dataSource.data = [];
      this.dataSource.paginator = this.paginator;
      this.beneficiaryList.forEach((item: any) => {
        console.log('item', JSON.stringify(item, null, 4));
        for (const key in item) {
          if (
            key === 'beneficiaryID' ||
            key === 'benName' ||
            key === 'genderName' ||
            key === 'fatherName' ||
            key === 'districtName' ||
            key === 'preferredPhoneNum' ||
            key === 'villageName'
          ) {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.filteredBeneficiaryList.push(item);
              this.dataSource.data.push(item);
              this.dataSource.paginator = this.paginator;
              this.dataSource.data.forEach(
                (sectionCount: any, index: number) => {
                  sectionCount.sno = index + 1;
                },
              );
              break;
            }
          } else {
            if (key === 'benVisitNo') {
              const value: string = '' + item[key];
              if (value === '1') {
                const val = 'First visit';
                if (val.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
                  this.filteredBeneficiaryList.push(item);
                  this.dataSource.data.push(item);
                  this.dataSource.paginator = this.paginator;
                  this.dataSource.data.forEach(
                    (sectionCount: any, index: number) => {
                      sectionCount.sno = index + 1;
                    },
                  );
                  break;
                }
              } else {
                const val = 'Revisit';
                if (val.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
                  this.filteredBeneficiaryList.push(item);
                  this.dataSource.data.push(item);
                  this.dataSource.paginator = this.paginator;
                  this.dataSource.data.forEach(
                    (sectionCount: any, index: number) => {
                      sectionCount.sno = index + 1;
                    },
                  );
                  break;
                }
              }
            }
          }
        }
      });
    }
  }
}
