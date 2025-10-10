import mongoose, { Schema } from "mongoose";

const MoveSchema = new Schema(
  {
    gameId: { type: Schema.Types.ObjectId, ref: "Game", required: true, index: true },
    playerId: { type: Schema.Types.ObjectId, ref: "Player", required: true },
    position: { type: Number, required: true, min: 0, max: 8 },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: false }
);

// Ensure unique position per game
MoveSchema.index({ gameId: 1, position: 1 }, { unique: true });

export default mongoose.models.Move || mongoose.model("Move", MoveSchema);