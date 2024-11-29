import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Riddle extends Document {
  @Prop({ type: String, required: true })
  text: string;

  @Prop({ type: String })
  title: string;

  @Prop({ type: Number, default: 0 })
  gain: number;

  @Prop({ type: String })
  photo: string;

  @Prop({ type: Number, default: 43.604429 })
  latitude: number;

  @Prop({ type: Number, default: 1.443812 })
  longitude: number;

  @Prop({ type: String })
  trivia: string;

  @Prop({ type: Boolean, required: true, default: false })
  solutionLocked: boolean;
}

export const RiddleSchema = SchemaFactory.createForClass(Riddle);
