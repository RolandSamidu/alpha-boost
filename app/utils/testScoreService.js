import { ScoreService } from "../../services/scoreService";

export const testScoreService = async () => {
  try {
    console.log("Testing ScoreService...");

    const testScore = await ScoreService.saveScore(
      "TestPlayer",
      "Test Game",
      100,
      ["Silent Letters", "Transpositions"]
    );
    console.log("Score saved:", testScore);

    const allScores = await ScoreService.getAllScores();
    console.log("All scores:", allScores);

    const playerStats = await ScoreService.getPlayerStats("TestPlayer");
    console.log("Player stats:", playerStats);

    await ScoreService.savePlayerName("TestPlayer");
    const savedName = await ScoreService.getPlayerName();
    console.log("Saved player name:", savedName);

    console.log("✅ ScoreService test completed successfully!");
    return true;
  } catch (error) {
    console.error("❌ ScoreService test failed:", error);
    return false;
  }
};
