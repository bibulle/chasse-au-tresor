import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Hint extends Document {
  @Prop({ type: String })
  description: string;

  @Prop({ type: Number, default: 0 })
  cost: number;

  @Prop({ type: Boolean, default: false })
  isPurchased: boolean;

  @Prop({ type: Number, default: 1 })
  order: number;

  @Prop({ type: Boolean, required: true, default: true })
  unlockSolution: boolean;
}

export const HintSchema = SchemaFactory.createForClass(Hint);
