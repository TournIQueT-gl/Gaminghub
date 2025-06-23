import { MemoryStorage } from './memory-storage';

export async function quickSeed(storage: MemoryStorage) {
  console.log("Quick seeding basic data...");
  
  try {
    // Ensure main user exists
    await storage.upsertUser({
      id: "dev-user-123",
      email: "dev@example.com",
      firstName: "Dev",
      lastName: "User",
      username: "DevUser",
      profileImageUrl: null,
    });

    // Create sample posts
    await storage.createPost({
      userId: "dev-user-123",
      content: "Just hit Diamond rank in Valorant! The grind was worth it 🎯",
      hashtags: ["valorant", "diamond", "ranking", "fps"],
      gameTag: "Valorant"
    });

    await storage.createPost({
      userId: "dev-user-123", 
      content: "Looking for a squad to play some ranked matches tonight. Anyone interested?",
      hashtags: ["lfg", "ranked", "squad"],
      gameTag: "Valorant"
    });

    // Create sample clans
    await storage.createClan({
      name: "Elite Gamers",
      description: "Competitive gaming clan focused on FPS games",
      leaderId: "dev-user-123",
      isPublic: true,
      requirements: "Diamond+ rank in any FPS game",
    });

    // Create sample game library entries
    await storage.addGameToLibrary({
      userId: "dev-user-123",
      gameId: "valorant",
      title: "Valorant",
      platform: "PC",
      isFavorite: true,
      isPlaying: true,
      hoursPlayed: 245,
      lastPlayed: new Date(),
      addedAt: new Date(),
    });

    await storage.addGameToLibrary({
      userId: "dev-user-123",
      gameId: "cs2",
      title: "Counter-Strike 2",
      platform: "PC", 
      isFavorite: false,
      isPlaying: false,
      hoursPlayed: 120,
      lastPlayed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      addedAt: new Date(),
    });

    console.log("Quick seed completed successfully!");
    return true;
  } catch (error) {
    console.error("Error in quick seed:", error);
    return false;
  }
}