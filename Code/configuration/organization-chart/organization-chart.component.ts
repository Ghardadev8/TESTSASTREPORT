import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { SessionService } from '@app/core/service/session.service';
import { UtilityService } from '@app/core/service/utility.service';
import { SharedModule } from '@app/shared/shared.module';
import html2canvas from 'html2canvas';
import $ from "jquery";
import { TreeNode } from 'primeng/api';
import { OrganizationChartModule } from 'primeng/organizationchart';
@Component({
  selector: 'app-organization-chart',
  standalone: true,
  imports : [SharedModule, OrganizationChartModule ],
  templateUrl: './organization-chart.component.html',
  styleUrls: ['./organization-chart.component.scss'],
})
export class OrganizationChartComponent implements OnInit {
  structureLevelId: number //= ConfigHierarchy.ShoppingMall;
  filter:any = {
    Hierarchy: null
  };
  
  organizationNode: TreeNode<any>[] = [];
  chartZoom = 0.9;

  private subscriptions: any[] = [];
  constructor(
    public session: SessionService,
    private utility: UtilityService,
    private zone: NgZone,
    private ref: ChangeDetectorRef,
  ) {
    // this.utility.setTitle(this.session.PageContext.Description);
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    for (let index = 0; index < this.subscriptions.length; index++) {
      this.subscriptions[index].unsubscribe();
    }
  }

  ngAfterViewInit() {
    this.ref.detach();
  }

  ngAfterViewChecked() {
    this.ref.detectChanges();
  }

  ngAfterContentInit() {
    this.ref.detectChanges();
  }

  setDefaultFilter() {
    this.ref.detectChanges();
    let t = setTimeout(() => {
      clearTimeout(t);
      this.filter.Hierarchy = {
        Level1Id: this.utility.hierarchies_data[0][0].Id,
        Level2Id: this.utility.hierarchies_data[1][0].Id,
      };

      this.ref.detectChanges();
      this.GetOrganizationChart();
    }, 500);
  }

  GetOrganizationChart() {
    this.utility.showLoader = true;
    this.organizationNode = [];
    this.zone.runOutsideAngular(() => {
      let filter = {
        LevelId: this.filter?.Hierarchy?.Level2Id
      };
      // let subscription = this.groupMasterService
      //   .GetOrganizationChart(filter)
      //   .subscribe((response: any) => {
      //     subscription.unsubscribe();
      //     this.zone.run(() => {
      //       this.utility.showLoader = false;
      //       if (response.MessageType == MessageType.Success) {
      //         this.organizationNode = response.Result;
      //         this.ScrollChartToCenter();
      //       } else {
      //         this.utility.DisplayMessage(
      //           response.Message,
      //           response.MessageType,
      //         );
      //       }
      //     });
      //   });
    });
  }

  ScrollChartToCenter() {
    let t = setTimeout(() => {
      clearTimeout(t);
      var d = document.getElementById('divOrganizationChart')!;
      d.scrollLeft = (d.scrollWidth - d.clientWidth) / 2;
    }, 100);
  }

  zoomIn() {
    if (this.chartZoom < 2) {
      this.chartZoom = this.chartZoom + 0.1;
    }
  }

  zoomOut() {
    if (this.chartZoom > 0.1) {
      this.chartZoom = this.chartZoom - 0.1;
    }
  }

  zoomReset() {
    this.chartZoom = 1;
  }

  exportToImage () {
    var utilityAlias = this.utility;
    utilityAlias.showLoader = true;
    //@ts-ignore
    var chartContainerWidth = $('#divOrganizationChart')[0].scrollWidth;
    //@ts-ignore
    $('#divOrganizationChart').css('width', chartContainerWidth + 100 + 'px');
    var downloadLink = document.createElement('a');
    downloadLink.setAttribute('download', 'Organization.png');

    html2canvas(document.getElementById('divOrganizationChart')!).then(
      function (canvas) {
        //@ts-ignore
        $('#divOrganizationChart').css('width', 'auto');
        var img = canvas.toDataURL('image/png', 1.0);
        let url = img.replace(
          /^data:image\/png/,
          'data:application/octet-stream',
        );
        downloadLink.setAttribute('href', url);
        downloadLink.click();
        utilityAlias.showLoader = false;
      },
    );
  };
}
