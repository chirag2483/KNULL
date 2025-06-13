const cfContestSchema = mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    contestId: Number,
    contestName: String,
    rank: Number,
    oldRating: Number,
    newRating: Number,
    ratingChange: Number,
    contestTime: Date
  });
  
  cfContestSchema.index({ userId: 1, contestId: 1 }, { unique: true });
  
  export default mongoose.model("CFContestHistory", cfContestSchema);
  