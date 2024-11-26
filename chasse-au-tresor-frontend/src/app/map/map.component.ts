import { AfterViewInit, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ICON_TYPE, Player, ItemPosition, TeamRiddle } from '../reference/types';
import { NotificationsService } from '../core/notifications.service';
import L from 'leaflet';
import { MapService } from '../core/map.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
})
export class MapComponent implements OnInit, OnChanges, OnDestroy {
  @Input() player: Player | null = null;
  @Input() allTeams: boolean = false;
  @Input() resolvedTeamRiddles: TeamRiddle[] = [];

  private map: L.Map | undefined;

  positionSubscription: Subscription | undefined;
  positionSubscriptionTeamId: string | undefined;

  constructor(private notificationsService: NotificationsService, private mapService: MapService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['player'] && changes['player'].currentValue) {
      const newTeamId = (changes['player'].currentValue as Player).team?._id;
      if (newTeamId && this.positionSubscriptionTeamId !== newTeamId) {
        this.positionSubscriptionTeamId = newTeamId;
        this.listenForPositionUpdates(newTeamId);
      }
    }
    if (changes['allTeams'] && changes['allTeams'].currentValue) {
      const newTeamId = 'all';
      if (newTeamId && this.positionSubscriptionTeamId !== newTeamId) {
        this.positionSubscriptionTeamId = newTeamId;
        this.listenForPositionUpdates(newTeamId);
      }
    }
    if (changes['resolvedTeamRiddles'] && changes['resolvedTeamRiddles'].currentValue) {
      const teamRiddles: TeamRiddle[] = changes['resolvedTeamRiddles'].currentValue;

      this.mapService.updateMarkerTeamRiddles(teamRiddles, true);

      // console.log(teamRiddles);
    }
    // console.log(`ngOnChanges(${JSON.stringify(changes, null, 2)})`);
  }

  ngOnInit(): void {
    this.initMap();
  }

  async ngOnDestroy(): Promise<void> {
    console.log('destroyMap');

    this.positionSubscription?.unsubscribe();
    await this.map?.off();
    await this.map?.remove();
    console.log('destroyMap done');
  }

  initMap() {
    console.log('initMap');
    L.Icon.Default.imagePath = 'assets/leaflet/';

    this.map = L.map('map').setView([43.6045, 1.4442], 13); // Position Toulouse
    // console.log(this.map);

    var Stadia_OSMBright = L.tileLayer('https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png', {
      minZoom: 0,
      maxZoom: 20,
      attribution:
        '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      // ext: 'png',
    });

    var Stadia_AlidadeSatellite = L.tileLayer(
      'https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.jpg',
      {
        minZoom: 0,
        maxZoom: 20,
        attribution:
          '&copy; CNES, Distribution Airbus DS, © Airbus DS, © PlanetObserver (Contains Copernicus Data) | &copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        // ext: 'jpg'
      }
    );
    var OpenStreetMap_France = L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
      maxZoom: 20,
      attribution:
        '&copy; OpenStreetMap France | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    });

    this.mapService.setMap(this.map);

    //Stadia_OSMBright.addTo(this.map);
    //Stadia_AlidadeSatellite.addTo(this.map);
    OpenStreetMap_France.addTo(this.map);
  }

  listenForPositionUpdates(newTeamId: string) {
    this.mapService.listenForPositionUpdates(newTeamId);

    this.positionSubscription = this.mapService.positions$.subscribe((data) => {
      console.log('playerPositionUpdated');
      // console.log(data);
      // Ajouter ou mettre à jour les marqueurs sur la carte
      if (data?.positions) {
        this.mapService.updateMarkerPlayers(data?.positions, newTeamId != 'all', data?.color);
      }
    });
  }

  invalidateMapSize(): void {
    if (this.map) {
      this.map.invalidateSize();
    }
  }
}
