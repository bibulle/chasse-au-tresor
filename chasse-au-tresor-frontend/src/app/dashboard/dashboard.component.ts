import { Component, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import * as L from 'leaflet';
import { TeamRiddlesService } from '../core/team-riddles.service';
import { NotificationsService } from '../core/notifications.service';
import { HeaderComponent } from './header/header.component';
import { Router } from '@angular/router';
import { PlayerService } from '../core/player.service';
import { RiddleComponent } from './riddle/riddle.component';
import { Player, ItemPosition, TeamRiddle } from '../reference/types';
import { CommonModule } from '@angular/common';
import { firstValueFrom, Subscription } from 'rxjs';
import { UserNotificationsService } from '../core/user-notifications.service';
import { MapComponent } from '../map/map.component';
import { HintsComponent } from './hints/hints.component';
import { TeamsService } from '../core/teams.service';
import { MatDialog } from '@angular/material/dialog';
import { SolutionPopupComponent } from './solution-popup/solution-popup.component';
import { OptionalRiddlePopupComponent } from './optional-riddle-popup/optional-riddle-popup.component';
import { Rejection, SolutionsService } from '../core/solutions.service';
import { SolutionRejectedPopupComponent } from './solution-rejected-popup/solution-rejected-popup.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, HeaderComponent, RiddleComponent, HeaderComponent, MapComponent, HintsComponent],
})
export class DashboardComponent implements OnInit, OnDestroy {
  player: Player | null = null;
  teamId: string | undefined;

  showHints = false;

  currentTeamRiddle: TeamRiddle | null = null;
  resolvedTeamRiddles: TeamRiddle[] = [];
  optionalTeamRiddles: TeamRiddle[] = [];

  userSubscription: Subscription | undefined;
  teamSubscription: Subscription | undefined;
  riddleCurrentSubscription: Subscription | undefined;
  riddleResolvedSubscription: Subscription | undefined;
  riddleOptionalSubscription: Subscription | undefined;
  rejectedSolutionSubscription: Subscription | undefined;
  geoLocalisationId: number | null = null;
  private geoLocalisationUser = '';

  constructor(
    private teamsService: TeamsService,
    private riddleService: TeamRiddlesService,
    private solutionService: SolutionsService,
    private notificationsService: NotificationsService,
    private router: Router,
    private dialog: MatDialog,
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
    if (this.riddleCurrentSubscription) {
      this.riddleCurrentSubscription.unsubscribe();
    }
    if (this.riddleResolvedSubscription) {
      this.riddleResolvedSubscription.unsubscribe();
    }
    if (this.riddleOptionalSubscription) {
      this.riddleOptionalSubscription.unsubscribe();
    }
    if (this.teamSubscription) {
      this.teamSubscription.unsubscribe();
    }
    if (this.rejectedSolutionSubscription) {
      this.rejectedSolutionSubscription.unsubscribe();
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
          this.userNotificationsService.success(`Bienvenu dans l'équipe <b>${user.team?.name}</b>`);
        } else if (this.player?.team?._id !== user.team?._id && !user.team?.name) {
          this.userNotificationsService.success(`Changement d'équipe`);
        }
        this.player = user;
        // console.log(this.player);
        this.trackPosition(this.player.username);
        this.subscribeRejectedSolution(this.player._id);
        if (this.player.team?._id && this.teamId !== this.player.team?._id) {
          this.subscribeTeam(this.player);
          this.subscribeTeamRiddle(this.player);
        }
      } else {
        window.location.reload();
      }
    });
  }

  async subscribeTeam(player: Player) {
    console.log(`subscribeTeam(${player.team?._id})`);

    if (this.teamSubscription) {
      this.teamSubscription.unsubscribe();
    }

    this.teamId = player.team?._id;
    if (this.teamId) {
      this.teamsService.listenForTeamsUpdates(this.teamId);
      this.teamSubscription = this.teamsService.teams$.subscribe((teams) => {
        const team = teams?.find((t) => t._id === this.teamId);
        if (this.player && team) {
          this.player.team = team;
        }
      });
    }
  }

  async subscribeTeamRiddle(player: Player) {
    console.log(`subscribeTeamRiddle(${player.team?._id})`);
    // this.riddleService.stopListenForRiddleUpdates(this.teamId);
    if (this.riddleCurrentSubscription) {
      this.riddleCurrentSubscription.unsubscribe();
    }
    if (this.riddleResolvedSubscription) {
      this.riddleResolvedSubscription.unsubscribe();
    }
    if (this.riddleOptionalSubscription) {
      this.riddleOptionalSubscription.unsubscribe();
    }

    this.teamId = player.team?._id;
    if (this.teamId) {
      this.currentTeamRiddle = await firstValueFrom(this.riddleService.loadCurrentTeamRiddle(this.teamId));
      this.riddleService.listenForCurrentTeamRiddleUpdates(this.teamId);
      this.riddleCurrentSubscription = this.riddleService.currentTeamRiddle$.subscribe((teamRiddle) => {
        this.currentTeamRiddle = teamRiddle;
      });
      this.resolvedTeamRiddles = await firstValueFrom(this.riddleService.loadResolvedTeamRiddle(this.teamId));
      this.riddleResolvedSubscription = this.riddleService.resolvedTeamRiddleSubject$.subscribe((teamRiddle) => {
        this.resolvedTeamRiddles = teamRiddle ? teamRiddle : [];
        // check if new Resolved riddle
        this.sendPopupIfNewResolvedRiddle(this.resolvedTeamRiddles);
      });
      this.optionalTeamRiddles = await firstValueFrom(this.riddleService.loadOptionalTeamRiddle(this.teamId));
      this.riddleOptionalSubscription = this.riddleService.optionalTeamRiddleSubject$.subscribe((teamRiddle) => {
        this.optionalTeamRiddles = teamRiddle ? teamRiddle : [];
        // check if new Resolved riddle
        this.sendPopupIfNewOptionalRiddle(this.optionalTeamRiddles);
      });
    }
  }

  async subscribeRejectedSolution(playerId: string) {
    if (!playerId) {
      return;
    }

    console.log(`subscribeRefusedSolution(${playerId})`);
    if (this.rejectedSolutionSubscription) {
      this.rejectedSolutionSubscription.unsubscribe();
    }

    this.solutionService.listenForRejectedSolution(playerId);
    this.rejectedSolutionSubscription = this.solutionService.rejectedSolution$.subscribe((rejection) => {
      this.sendPopupIfRejectedSolution(rejection);
    });
  }

  toggleHints() {
    console.log(`toggleHints()`);
    this.showHints = !this.showHints;
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
      this.geoLocalisationId = navigator.geolocation.watchPosition((position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        // Envoyer la position au backend
        this.notificationsService.updatePosition(playerId, latitude, longitude);
      });
    } else {
      this.userNotificationsService.error('La géolocalisation n’est pas supportée par ce navigateur.', null);
    }
  }

  sendPopupIfNewResolvedRiddle(resolvedTeamRiddles: TeamRiddle[]) {
    const lastResolved = resolvedTeamRiddles.sort((tr1, tr2) => tr1.order - tr2.order).at(-1);
    if (!lastResolved) {
      return;
    }

    const previousResolvedId = localStorage.getItem('lastResolvedRiddleId');

    if (previousResolvedId !== lastResolved._id) {
      localStorage.setItem('lastResolvedRiddleId', lastResolved._id);

      const dialogRef = this.dialog.open(SolutionPopupComponent, {
        //width: '400px',
        data: {
          lastResolved: lastResolved,
        },
      });

      dialogRef.afterClosed().subscribe(() => {
        console.log('Popup fermée.');
      });
    }
  }

  sendPopupIfRejectedSolution(rejection: Rejection | null) {
    if (!rejection) {
      return;
    }

    const dialogRef = this.dialog.open(SolutionRejectedPopupComponent, {
      //width: '400px',
      data: {
        rejection: rejection,
      },
    });

    dialogRef.afterClosed().subscribe(() => {
      console.log('Popup fermée.');
    });
  }

  sendPopupIfNewOptionalRiddle(optionalTeamRiddles: TeamRiddle[]) {
    const lastOptional = optionalTeamRiddles.sort((tr1, tr2) => tr1.order - tr2.order).at(-1);
    if (!lastOptional) {
      return;
    }

    const localS = localStorage.getItem('lastOptionalRiddleId');
    let previousOptionalIds: String[] = [];
    if (localS) {
      previousOptionalIds = JSON.parse(localS);
    }

    if (!previousOptionalIds.find((s) => s === lastOptional._id)) {
      previousOptionalIds.push(lastOptional._id);
      localStorage.setItem('lastOptionalRiddleId', JSON.stringify(previousOptionalIds));

      const dialogRef = this.dialog.open(OptionalRiddlePopupComponent, {
        //width: '400px',
        data: {
          lastOptional: lastOptional,
        },
      });

      dialogRef.afterClosed().subscribe(() => {
        console.log('Popup fermée.');
      });
    }
  }
}
