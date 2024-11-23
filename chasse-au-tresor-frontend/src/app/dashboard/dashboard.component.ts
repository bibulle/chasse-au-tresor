import { Component, OnDestroy, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { RiddleService } from '../core/riddle.service';
import { NotificationsService } from '../core/notifications.service';
import { HeaderComponent } from './header/header.component';
import { Router } from '@angular/router';
import { PlayerService } from '../core/player.service';
import { RiddleComponent } from './riddle/riddle.component';
import { Player, TeamRiddle } from '../reference/types';
import { CommonModule } from '@angular/common';
import { firstValueFrom, Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, HeaderComponent, RiddleComponent, HeaderComponent],
})
export class DashboardComponent implements OnInit, OnDestroy {
  player: Player | null = null;
  teamId : string | undefined;
  currentTeamRiddle: TeamRiddle | null = null;

  userSubscription: Subscription | undefined;
  riddleSubscription: Subscription | undefined;

  private map: any;
  private markers: Map<string, L.Marker> = new Map();

  constructor(
    private riddleService: RiddleService,
    private positionService: NotificationsService,
    private router: Router,
    private userService: PlayerService
  ) {}

  async ngOnInit(): Promise<void> {
    // Récupérer les informations du joueur depuis localStorage
    const player = JSON.parse(localStorage.getItem('createdUser') || '{}');

    if (!player.username) {
      this.router.navigate(['/create-user']);
    }

    this.initPlayer(player.username);

    this.initMap();
    this.listenForPositionUpdates();
  }

  async ngOnDestroy(): Promise<void> {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.riddleSubscription) {
      this.riddleSubscription.unsubscribe();
    }
}
  async initPlayer(username: string) {
    this.player = await firstValueFrom(this.userService.loadUser(username));
    if (!this.player) {
      localStorage.removeItem('createdUser');
      this.router.navigate(['/create-user']);
      return;
    }

    this.userService.listenForUserUpdates(username);

    // S'abonner aux données de l'utilisateur
    this.userSubscription = this.userService.user$.subscribe((user) => {
      if (user) {
        this.player = user;
        this.subscribeTeamRiddle(this.player);
      }
    });
  }

  async subscribeTeamRiddle(player:Player) {
    if (player.team?._id && this.teamId !== player.team?._id) {
      // this.riddleService.stopListenForRiddleUpdates(this.teamId);
      if (this.riddleSubscription) {
        this.riddleSubscription.unsubscribe();
      }

      this.teamId = player.team?._id;
      this.currentTeamRiddle = await firstValueFrom(this.riddleService.loadCurrentRiddle(this.teamId));
      this.riddleService.listenCurrentForRiddleUpdates(this.teamId);
      this.riddleSubscription = this.riddleService.currentRiddle$.subscribe((teamRiddle) => {
        this.currentTeamRiddle = teamRiddle;
      });
    }
}

  initMap() {
    L.Icon.Default.imagePath = 'assets/leaflet/';

    this.map = L.map('map').setView([43.6045, 1.4442], 13); // Position Toulouse
    var Stadia_OSMBright = L.tileLayer(
      'https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png',
      {
        minZoom: 0,
        maxZoom: 20,
        attribution:
          '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        // ext: 'png',
      }
    );
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
    var OpenStreetMap_France = L.tileLayer(
      'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
      {
        maxZoom: 20,
        attribution:
          '&copy; OpenStreetMap France | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }
    );

    Stadia_OSMBright.addTo(this.map);
    //Stadia_AlidadeSatellite.addTo(this.map);
    // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //   // attribution: '© OpenStreetMap contributors',
    // }).addTo(this.map);
  }

  listenForPositionUpdates() {
    this.positionService.onPositionUpdated().subscribe((data: any) => {
      const { playerId, latitude, longitude } = data;

      // Ajouter ou mettre à jour le marqueur sur la carte
      if (this.markers.has(playerId)) {
        const marker = this.markers.get(playerId);
        marker?.setLatLng([latitude, longitude]);
      } else {
        const newMarker = L.marker([latitude, longitude]).addTo(this.map);
        this.markers.set(playerId, newMarker);
      }
    });
  }

  simulatePositionUpdate() {
    const playerId = 'player-1'; // Remplacez par l'ID réel du joueur
    const latitude = 43.6045 + Math.random() * 0.01; // Simulez des coordonnées
    const longitude = 1.4442 + Math.random() * 0.01;

    this.positionService.updatePosition(playerId, latitude, longitude);
  }

  trackPosition(playerId: string) {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition((position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        // Envoyer la position au backend
        this.positionService.updatePosition(playerId, latitude, longitude);
      });
    } else {
      alert('La géolocalisation n’est pas supportée par ce navigateur.');
    }
  }
}
