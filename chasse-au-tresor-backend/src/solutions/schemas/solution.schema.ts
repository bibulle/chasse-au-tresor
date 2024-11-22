import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Solution extends Document {
  @Prop({ ref: 'Player', required: true })
  player: Types.ObjectId;

  @Prop({ type: String })
  photo: string;

  @Prop({ type: String, default: '' })
  text: string;

  @Prop({ type: Boolean, default: undefined })
  validated: boolean;
}

export const SolutionSchema = SchemaFactory.createForClass(Solution);
