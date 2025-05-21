import { OpenAI } from "openai";
import config from "@/config";
import axios from "axios";

const openai = new OpenAI({
  baseURL: config.api.openrouter.baseUrl,
  apiKey: config.env.openrouterApiKey,
  defaultHeaders: {
    "HTTP-Referer": config.env.appUrl || "http://localhost:3000",
    "X-Title": "Token Info Query",
  },
});

interface Tweet {
  text: string;
  created_at: string;
  views: number;
  favorites: number;
  author?: {
    name: string;
    screen_name: string;
    followers_count: number;
  };
}

interface TwitterApiResponse {
  timeline?: Tweet[];
  user?: {
    name: string;
    screen_name: string;
    blue_verified: boolean;
    desc: string;
    sub_count: number;
  };
  tweets?: Tweet[];
}

async function searchTwitter(query: string): Promise<Tweet[]> {
  try {
    const response = await axios.get(
      `https://twitter-api45.p.rapidapi.com/search.php`,
      {
        params: {
          query,
          search_type: "Top",
        },
        headers: {
          "x-rapidapi-key": config.env.rapidApiKey,
          "x-rapidapi-host": "twitter-api45.p.rapidapi.com",
        },
      }
    );

    if (!response.data?.timeline) {
      return [];
    }

    return response.data.timeline.map((tweet: any) => ({
      text: tweet.text,
      created_at:
        new Date(tweet.created_at).toLocaleString("en-US", {
          hour12: false,
        }) + " UTC",
      views: tweet.views,
      favorites: tweet.favorites,
      author: {
        name: tweet.user_info.name,
        screen_name: tweet.user_info.screen_name,
        followers_count: tweet.user_info.followers_count,
      },
    }));
  } catch (error) {
    console.error("Twitter search API error:", error);
    return [];
  }
}

async function getUserTimeline(
  screenname: string
): Promise<TwitterApiResponse | null> {
  try {
    const response = await axios.get(
      `https://twitter-api45.p.rapidapi.com/timeline.php`,
      {
        params: { screenname },
        headers: {
          "x-rapidapi-key": config.env.rapidApiKey,
          "x-rapidapi-host": "twitter-api45.p.rapidapi.com",
        },
      }
    );

    if (!response.data) {
      return null;
    }

    const result: TwitterApiResponse = {
      user: {
        name: response.data.user?.name,
        screen_name: screenname,
        blue_verified: response.data.user?.blue_verified,
        desc: response.data.user?.desc,
        sub_count: response.data.user?.sub_count,
      },
      tweets: [],
    };

    if (response.data.timeline && Array.isArray(response.data.timeline)) {
      result.tweets = response.data.timeline.map((tweet: any) => ({
        text: tweet.text,
        created_at:
          new Date(tweet.created_at).toLocaleString("en-US", {
            hour12: false,
          }) + " UTC",
        views: tweet.views,
        favorites: tweet.favorites,
      }));
    }

    return result;
  } catch (error) {
    console.error("Twitter timeline API error:", error);
    return null;
  }
}

async function generateSummary(
  tweets: Tweet[],
  type: "search" | "account",
  symbol: string
): Promise<string> {
  try {
    const promptPrefix =
      type === "account"
        ? `请总结关于 ${symbol} 的账号推文:`
        : `请总结关于 ${symbol} 的搜索推文:`;

    const promptSuffix =
      type === "account"
        ? `提供简短的要点总结。保持简洁直接,去除所有不必要的词语。`
        : `提供关于叙事观点和风险内容的极简要点总结。不总结主观价格预测和个人收益的内容。保持简洁直接,去除所有不必要的词语。格式如下：
- 叙事观点：
- 风险内容：`;

    const tweetData = tweets.map(
      (tweet, index) => `
Tweet ${index + 1}:
Content: ${tweet.text}
Time: ${tweet.created_at}
${
  tweet.author
    ? `Author: ${tweet.author.name} (@${tweet.author.screen_name})
Followers: ${tweet.author.followers_count}`
    : ""
}
Engagement: ${tweet.views} views / ${tweet.favorites} likes
---`
    );

    const prompt = `${promptPrefix}\n\n${tweetData.join(
      "\n"
    )}\n\n${promptSuffix}`;

    const response = await openai.chat.completions.create({
      model: "deepseek/deepseek-r1:free",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that analyzes cryptocurrency Twitter data.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 1.0,
      max_tokens: 3000,
    });

    return response.choices[0].message.content || "No summary available.";
  } catch (error) {
    console.error("Error generating summary:", error);
    return "Failed to generate summary.";
  }
}

export async function analyzeTwitter(
  symbol: string,
  contract: string,
  twitterHandle?: string
) {
  let accountSummary = "";
  let searchSummary = "";

  // Get tweets from Twitter account if handle is provided
  if (twitterHandle) {
    const timelineResult = await getUserTimeline(twitterHandle);
    if (timelineResult?.tweets?.length) {
      accountSummary = await generateSummary(
        timelineResult.tweets,
        "account",
        symbol
      );
    }
  }

  // Search for tweets about the contract address
  const searchTweets = await searchTwitter(contract);
  if (searchTweets.length) {
    searchSummary = await generateSummary(searchTweets, "search", symbol);
  }

  return {
    search_summary: searchSummary || undefined,
    account_summary: accountSummary || undefined,
  };
}
