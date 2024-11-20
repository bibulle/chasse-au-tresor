import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { RiddleService } from '../core/riddle.service';
import { PositionService } from '../core/positions.service';
import { HeaderComponent } from './header/header.component';
import { Router } from '@angular/router';
import { UserService } from '../core/user.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [HeaderComponent ]
})
export class DashboardComponent implements OnInit {
  player:any;
  playerName = ''; // Nom du joueur
  currentRiddle = 'enigme courante'; // Enigme courante

  private map: any;
  private markers: Map<string, L.Marker> = new Map();

  constructor(
    private riddleService: RiddleService,
    private positionService: PositionService,
    private router: Router,
    private userService: UserService,
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
          localStorage.removeItem('createdUser')
          this.router.navigate(['/create-user']);
        } else {
          this.player = p;
        }
      },
      error: (err) => {
        console.error('Erreur en récuperant l\'utilisateur:', err);
        localStorage.removeItem('createdUser')
        this.router.navigate(['/create-user']);
      },
    });



    this.currentRiddle = 'Trouver le trésor caché'; // À remplacer par une API
  }

  initMap() {
    this.map = L.map('map').setView([43.6045, 1.4442], 13); // Position Toulouse

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      // attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);
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
