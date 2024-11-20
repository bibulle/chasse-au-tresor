import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Player extends Document {
  @Prop({ required: true, unique: true }) // Le nom doit être unique
  username: string;

  @Prop({ ref: 'Team' })
  team: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  latitude: number;

  @Prop({ type: Number, default: 0 })
  longitude: number;
}

export const PlayerSchema = SchemaFactory.createForClass(Player);
