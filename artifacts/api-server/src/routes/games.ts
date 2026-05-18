import { Router } from "express";

const router = Router();

router.get("/games/free", async (req, res) => {
  try {
    const url = "https://www.gamerpower.com/api/giveaways?type=game&sort-by=date";
    const response = await fetch(url, {
      headers: { "User-Agent": "OriginServices/1.0" },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      req.log.warn({ status: response.status }, "GamerPower API returned non-OK status");
      res.status(502).json({ error: "Upstream API error" });
      return;
    }

    const data = await response.json();

    const games = (Array.isArray(data) ? data : [])
      .filter((g: any) => g.status === "Active")
      .slice(0, 12)
      .map((g: any) => ({
        id: g.id,
        title: g.title,
        thumbnail: g.thumbnail,
        image: g.image,
        description: g.description,
        platforms: g.platforms,
        store: g.store,
        endDate: g.end_date,
        openGiveawayUrl: g.open_giveaway_url,
        worth: g.worth,
        type: g.type,
      }));

    res.json(games);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch free games");
    res.status(500).json({ error: "Failed to fetch games" });
  }
});

export default router;
