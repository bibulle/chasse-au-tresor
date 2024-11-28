import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Riddle extends Document {
  @Prop({ required: true })
  text: string;

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
}

export const RiddleSchema = SchemaFactory.createForClass(Riddle);
