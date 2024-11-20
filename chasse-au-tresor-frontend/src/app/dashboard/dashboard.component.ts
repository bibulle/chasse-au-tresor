import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { RiddleService } from '../core/riddle.service';
import { PositionService } from '../core/positions.service';
import { HeaderComponent } from './header/header.component';
import { Router } from '@angular/router';
import { UserService } from '../core/user.service';
import { RiddleComponent } from "./riddle/riddle.component";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [HeaderComponent, RiddleComponent],
})
export class DashboardComponent implements OnInit {
  player: any;
  playerName = ''; // Nom du joueur
  currentRiddle = 'énigme courante'; // Énigme courante

  private map: any;
  private markers: Map<string, L.Marker> = new Map();

  constructor(
    private riddleService: RiddleService,
    private positionService: PositionService,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadPlayerData();
    this.initMap();
    this.listenForPositionUpdates();

    const playerId = 'player-1'; // Remplacez par l'ID réel du joueur
    this.trackPosition(playerId);
  }

  async loadPlayerData() {
    // Récupérer les informations du joueur depuis localStorage
    const player = JSON.parse(localStorage.getItem('createdUser') || '{}');

    this.userService.getUserByUsername(player.username).subscribe({
      next: (p) => {
        console.log('player', p);
        this.playerName = p?.username;
        if (!p?.username) {
          console.log('routing');
          localStorage.removeItem('createdUser');
          this.router.navigate(['/create-user']);
        } else {
          this.player = p;
        }
      },
      error: (err) => {
        console.error("Erreur en récuperant l'utilisateur:", err);
        localStorage.removeItem('createdUser');
        this.router.navigate(['/create-user']);
      },
    });

    this.currentRiddle = 'Trouver le trésor caché'; // À remplacer par une API
  }

  initMap() {
    L.Icon.Default.imagePath = 'assets/leaflet/'

    this.map = L.map('map').setView([43.6045, 1.4442], 13, ); // Position Toulouse
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
    var Stadia_AlidadeSatellite = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.jpg', {
      minZoom: 0,
      maxZoom: 20,
      attribution: '&copy; CNES, Distribution Airbus DS, © Airbus DS, © PlanetObserver (Contains Copernicus Data) | &copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      // ext: 'jpg'
    });
    var OpenStreetMap_France = L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
      maxZoom: 20,
      attribution: '&copy; OpenStreetMap France | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

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
