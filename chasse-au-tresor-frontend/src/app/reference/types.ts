export class Player {
  _id: string = '';
  username: string = '';
  latitude = 0;
  longitude = 0;
  team: Team | undefined;
  isAdmin?: boolean;
}

export class Team {
  _id = '';
  name = '';
  players: Player[] = [];
  color = '';
  score = 0;
  position: Position = new Position();
}
export class Position {
  latitude = 0;
  longitude = 0;
}

export class Riddle {
  _id = '';
  text = '';
  gain = 0;
  photo?: string;
}

export class TeamRiddle {
  _id = '';
  riddle: Riddle | undefined;
  team: Team | undefined;
  order = 0;
  resolved = false;
  solutions: Solution[] = [];
}
export class Solution {
  _id = '';
  player: Player | undefined;
  photo: string = '';
  text: string = '';
  validated: boolean | undefined;
}

export class Version {
  version = '';
  github_url = '';
  name = '';
  copyright = '';
}

export class PlayerPositionsUpdate {
  team = '';
  color = '';
  positions: PlayerPosition[] = [];
}
export class PlayerPosition {
  playerId = '';
  latitude = 0;
  longitude = 0;
}
