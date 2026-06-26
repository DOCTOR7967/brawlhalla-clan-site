const API_KEY = "A27820UWGN2V3AO4A0MI";

function fetchJson(url) {
  return new Promise((resolve) => {
    https.get(url, {
      headers: {
        "Authorization": API_KEY
      }
    }, (res) => {
      let data = "";

      res.on("data", (c) => (data += c));

      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(null);
        }
      });
    }).on("error", () => resolve(null));
  });
}
