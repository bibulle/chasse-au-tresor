import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Team extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  color: string; // Code couleur (ex. : #FF5733)

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Player' }] })
  players: Types.ObjectId[];

  @Prop({ default: 0 })
  score: number;

  @Prop({
    type: { latitude: Number, longitude: Number },
    default: { latitude: 0, longitude: 0 },
  })
  position: { latitude: number; longitude: number };
}

export const TeamSchema = SchemaFactory.createForClass(Team);
