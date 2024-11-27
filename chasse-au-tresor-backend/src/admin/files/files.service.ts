/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from 'fs';
import { Model, Types } from 'mongoose';
import * as path from 'path';
import { Hint } from 'src/hints/schemas/hint.schema';
import { Player } from 'src/players/schemas/player.schema';
import { Riddle } from 'src/riddles/schemas/riddle.schema';
import { TeamRiddle } from 'src/riddles/schemas/team-riddle.schema';
import { Solution } from 'src/solutions/schemas/solution.schema';
import { Team } from 'src/teams/schemas/team.schema';

@Injectable()
export class FilesService {
  readonly logger = new Logger(FilesService.name);

  constructor(
    @InjectModel(Team.name) private readonly teamModel: Model<Team>,
    @InjectModel(Player.name) private readonly playerModel: Model<Player>,
    @InjectModel(Riddle.name) private readonly riddleModel: Model<Riddle>,
    @InjectModel(Hint.name) private readonly hintModel: Model<Hint>,
    @InjectModel(TeamRiddle.name)
    private readonly teamRiddleModel: Model<TeamRiddle>,
    @InjectModel(Solution.name) private readonly solutionModel: Model<Solution>,
  ) {}

  // Gestion de l'importation
  async handleImport(file: Express.Multer.File): Promise<void> {
    const jsonData = file.buffer.toString();
    let parsedData;

    try {
      parsedData = JSON.parse(jsonData);
    } catch (err) {
      throw new Error("Le fichier fourni n'est pas un JSON valide.");
    }

    // Convertir les IDs en ObjectId si nécessaire
    if (parsedData.teams) {
      parsedData.teams = parsedData.teams.map((team) => {
        team._id = new Types.ObjectId('' + team._id);
        team.players = team.players.map((id) => {
          return new Types.ObjectId('' + id);
        });
        return team;
      });
    }
    if (parsedData.players) {
      parsedData.players = parsedData.players.map((player) => {
        player._id = new Types.ObjectId('' + player._id);
        player.team = new Types.ObjectId('' + player.team);
        return player;
      });
    }
    if (parsedData.riddles) {
      parsedData.riddles = parsedData.riddles.map((riddle) => {
        riddle._id = new Types.ObjectId('' + riddle._id);
        return riddle;
      });
    }
    if (parsedData.teamRiddles) {
      parsedData.teamRiddles = parsedData.teamRiddles.map((teamRiddle) => {
        teamRiddle._id = new Types.ObjectId('' + teamRiddle._id);
        teamRiddle.team = new Types.ObjectId('' + teamRiddle.team);
        teamRiddle.riddle = new Types.ObjectId('' + teamRiddle.riddle);
        teamRiddle.solutions = teamRiddle.solutions.map((id) => {
          return new Types.ObjectId('' + id);
        });
        teamRiddle.hints = teamRiddle.hints.map((id) => {
          return new Types.ObjectId('' + id);
        });
        return teamRiddle;
      });
    }
    if (parsedData.hints) {
      parsedData.hints = parsedData.hints.map((hint) => {
        hint._id = new Types.ObjectId('' + hint._id);
        return hint;
      });
    }
    if (parsedData.solutions) {
      parsedData.solutions = parsedData.solutions.map((solution) => {
        solution._id = new Types.ObjectId('' + solution._id);
        return solution;
      });
    }

    // Clear existing data
    await this.teamModel.deleteMany({});
    await this.playerModel.deleteMany({});
    await this.riddleModel.deleteMany({});
    await this.hintModel.deleteMany({});
    await this.teamRiddleModel.deleteMany({});
    await this.solutionModel.deleteMany({});

    // Insert new data
    if (parsedData.teams) await this.teamModel.insertMany(parsedData.teams);
    if (parsedData.players) await this.playerModel.insertMany(parsedData.players);
    if (parsedData.riddles) await this.riddleModel.insertMany(parsedData.riddles);
    if (parsedData.hints) await this.hintModel.insertMany(parsedData.hints);
    if (parsedData.teamRiddles) await this.teamRiddleModel.insertMany(parsedData.teamRiddles);
    if (parsedData.solutions) await this.solutionModel.insertMany(parsedData.solutions);
  }

  // Gestion de l'exportation
  async handleExport(): Promise<string> {
    const teams = await this.teamModel.find().lean();
    const players = await this.playerModel.find().lean();
    const riddles = await this.riddleModel.find().lean();
    const hints = await this.hintModel.find().lean();
    const teamRiddles = await this.teamRiddleModel.find().lean();
    const solutions = await this.solutionModel.find().lean();

    return JSON.stringify({ teams, players, riddles, teamRiddles, solutions }, null, 2);
  }
}
