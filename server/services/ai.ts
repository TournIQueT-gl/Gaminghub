import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export interface HashtagsResponse {
  hashtags: string[];
}

export interface ModerationResponse {
  isToxic: boolean;
  score: number;
  categories: string[];
}

export interface BioResponse {
  bio: string;
}

export class AIService {
  async generateHashtags(content: string): Promise<HashtagsResponse> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a gaming hashtag expert. Generate relevant hashtags for gaming social media posts. Return only a JSON object with a 'hashtags' array containing 3-5 hashtags without the # symbol.",
          },
          {
            role: "user",
            content: `Generate hashtags for this gaming post: "${content}"`,
          },
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || '{"hashtags": []}');
      return {
        hashtags: result.hashtags || [],
      };
    } catch (error) {
      console.error("Error generating hashtags:", error);
      return { hashtags: [] };
    }
  }

  async moderateContent(content: string): Promise<ModerationResponse> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a content moderation expert for gaming platforms. Analyze content for toxicity, harassment, hate speech, and inappropriate behavior. Return a JSON object with 'isToxic' (boolean), 'score' (0-1), and 'categories' (array of detected issues).",
          },
          {
            role: "user",
            content: `Moderate this gaming content: "${content}"`,
          },
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || '{"isToxic": false, "score": 0, "categories": []}');
      return {
        isToxic: result.isToxic || false,
        score: Math.max(0, Math.min(1, result.score || 0)),
        categories: result.categories || [],
      };
    } catch (error) {
      console.error("Error moderating content:", error);
      return { isToxic: false, score: 0, categories: [] };
    }
  }

  async generateGamerBio(gamePreferences: string[]): Promise<BioResponse> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a gaming profile expert. Create engaging, personalized bios for gamers based on their game preferences. Keep bios concise (2-3 sentences), professional, and gaming-focused. Return a JSON object with a 'bio' field.",
          },
          {
            role: "user",
            content: `Generate a gaming bio for someone who plays: ${gamePreferences.join(", ")}`,
          },
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || '{"bio": ""}');
      return {
        bio: result.bio || "Passionate gamer exploring virtual worlds.",
      };
    } catch (error) {
      console.error("Error generating bio:", error);
      return { bio: "Passionate gamer exploring virtual worlds." };
    }
  }
}

export const aiService = new AIService();
