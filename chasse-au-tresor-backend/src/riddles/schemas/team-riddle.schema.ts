import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class TeamRiddle extends Document {
  @Prop({ ref: 'Team', required: true })
  team: Types.ObjectId;

  @Prop({ ref: 'Riddle', required: true })
  riddle: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  order: number;

  @Prop({ type: Boolean, default: false })
  resolved: boolean;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Solution' }] })
  solutions: Types.ObjectId[];
}

export const TeamRiddleSchema = SchemaFactory.createForClass(TeamRiddle);
