import { Component, OnDestroy, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { TeamRiddlesService } from '../core/team-riddles.service';
import { NotificationsService } from '../core/notifications.service';
import { HeaderComponent } from './header/header.component';
import { Router } from '@angular/router';
import { PlayerService } from '../core/player.service';
import { RiddleComponent } from './riddle/riddle.component';
import { Player, PlayerPosition, TeamRiddle } from '../reference/types';
import { CommonModule } from '@angular/common';
import { firstValueFrom, Subscription } from 'rxjs';
import { UserNotificationsService } from '../core/user-notifications.service';
import { MapComponent } from '../map/map.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, HeaderComponent, RiddleComponent, HeaderComponent, MapComponent],
})
export class DashboardComponent implements OnInit, OnDestroy {
  player: Player | null = null;
  teamId: string | undefined;
  currentTeamRiddle: TeamRiddle | null = null;

  userSubscription: Subscription | undefined;
  riddleSubscription: Subscription | undefined;
  geoLocalisationId: number | null = null;
  private geoLocalisationUser = '';



  constructor(
    private riddleService: TeamRiddlesService,
    private notificationsService: NotificationsService,
    private router: Router,
    private playerService: PlayerService,
    private userNotificationsService: UserNotificationsService
  ) {}

  async ngOnInit(): Promise<void> {
    // Récupérer les informations du joueur depuis localStorage
    const player = JSON.parse(localStorage.getItem('createdUser') || '{}');

    if (!player.username) {
      this.router.navigate(['/create-user']);
    }

    this.initPlayer(player.username);

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
    this.player = await firstValueFrom(this.playerService.loadUser(username));
    if (!this.player) {
      localStorage.removeItem('createdUser');
      this.router.navigate(['/create-user']);
      return;
    }

    this.playerService.listenForUserUpdates(username);

    // S'abonner aux données de l'utilisateur
    this.userSubscription = this.playerService.user$.subscribe((user) => {
      if (user) {
        if (this.player?.team?._id !== user.team?._id && user.team?.name) {
          this.userNotificationsService.success(
            `Bienvenu dans l'équipe <b>${user.team?.name}</b>`
          );
        } else if (
          this.player?.team?._id !== user.team?._id &&
          !user.team?.name
        ) {
          this.userNotificationsService.success(`Changement d'équipe`);
        }
        this.player = user;
        // console.log(this.player);
        this.trackPosition(this.player.username);
        this.subscribeTeamRiddle(this.player);
      } else {
        window.location.reload();
      }
    });
  }

  async subscribeTeamRiddle(player: Player) {
    if (player.team?._id && this.teamId !== player.team?._id) {
      // this.riddleService.stopListenForRiddleUpdates(this.teamId);
      if (this.riddleSubscription) {
        this.riddleSubscription.unsubscribe();
      }

      this.teamId = player.team?._id;
      this.currentTeamRiddle = await firstValueFrom(
        this.riddleService.loadCurrentTeamRiddle(this.teamId)
      );
      this.riddleService.listenForCurrentTeamRiddleUpdates(this.teamId);
      this.riddleSubscription = this.riddleService.currentTeamRiddle$.subscribe(
        (teamRiddle) => {
          this.currentTeamRiddle = teamRiddle;
        }
      );
    }
  }


  trackPosition(playerId: string) {
    if (navigator.geolocation) {
      if (this.geoLocalisationId !== null) {
        if (this.geoLocalisationUser === playerId) {
          return;
        }
        navigator.geolocation.clearWatch(this.geoLocalisationId);
      }

      this.geoLocalisationUser = playerId;
      this.geoLocalisationId = navigator.geolocation.watchPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          // Envoyer la position au backend
          this.notificationsService.updatePosition(
            playerId,
            latitude,
            longitude
          );
        }
      );
    } else {
      this.userNotificationsService.error(
        'La géolocalisation n’est pas supportée par ce navigateur.', null
      );
    }
  }
}
