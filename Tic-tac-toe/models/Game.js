import mongoose, { Schema } from "mongoose";

const GameSchema = new Schema(
  {
    player1: { type: Schema.Types.ObjectId, ref: "Player", required: true },
    player2: { type: Schema.Types.ObjectId, ref: "Player" },
    status: { type: String, enum: ["open", "active", "finished"], default: "open", index: true },
    winner: { type: Schema.Types.ObjectId, ref: "Player" },
    createdAt: { type: Date, default: Date.now },
    endedAt: { type: Date }
  },
  { timestamps: false }
);

export default mongoose.models.Game || mongoose.model("Game", GameSchema);