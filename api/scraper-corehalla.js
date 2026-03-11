const axios = require("axios");
const cheerio = require("cheerio");

async function getPlayer(id) {

const url = `https://corehalla.com/stats/player/${id}`;

const { data } = await axios.get(url,{
headers:{
"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
"Accept":"text/html,application/xhtml+xml"
}
});

const $ = cheerio.load(data);

const result = {};


// ========================
// PLAYER INFO
// ========================

result.player = {
name: $("h1.font-bold").clone().children().remove().end().text().trim(),
id: $("span.text-xs").text().replace("#","").trim(),
flag: "https://corehalla.com" + $("h1 img").attr("src")
};


// ========================
// ACCOUNT INFO
// ========================

result.account = {};

$("p.text-sm").each((i,el)=>{

const label = $(el).text().trim();

const value = $(el)
.parent()
.parent()
.find(".font-semibold")
.first()
.text()
.trim();

if(label==="Account level") result.account.level = value;
if(label==="Account XP") result.account.xp = value;
if(label==="Game time") result.account.gameTime = value;

});


// ========================
// MAIN LEGENDS
// ========================

result.mainLegends = [];

$("img[src*='roster/legends']").each((i,el)=>{

result.mainLegends.push({
name: $(el).attr("alt"),
icon: "https://corehalla.com"+$(el).attr("src")
});

});


// ========================
// RANKED
// ========================

result.ranked = {};

const banner = $("img[src*='ranked-banners']");

result.ranked.rank = banner.attr("alt");
result.ranked.banner = banner.attr("src")
? "https://corehalla.com"+banner.attr("src")
: null;

const eloText = $(".text-5xl").first().text().trim();

if(eloText.includes("/")){
const parts = eloText.split("/");
result.ranked.elo = parts[0].trim();
result.ranked.peak = parts[1].replace("Peak","").trim();
}

const winText = $("span:contains('W')").first().text();
const lossText = $("span:contains('L')").first().text();

result.ranked.wins = winText.split("W")[0].trim();
result.ranked.losses = lossText.split("L")[0].trim();

$("p.text-sm").each((i,el)=>{

const label = $(el).text().trim();

const value = $(el)
.parent()
.parent()
.find(".font-semibold")
.text()
.trim();

if(label==="1v1 Games") result.ranked.games = value;
if(label==="Winrate") result.ranked.winrate = value;
if(label==="Total Glory") result.ranked.totalGlory = value;
if(label==="Glory from rating") result.ranked.gloryFromRating = value;
if(label==="Glory from wins") result.ranked.gloryFromWins = value;
if(label==="Elo reset") result.ranked.eloReset = value;

});


// ========================
// OVERALL STATS
// ========================

result.overall = {};

const gamesCard = $("p:contains('games')").first().closest("div");

result.overall.totalGames = gamesCard
.find(".text-5xl")
.text()
.replace("games","")
.trim();

const wins = gamesCard.find("span:contains('W')").text();
const losses = gamesCard.find("span:contains('L')").text();

result.overall.wins = wins.split("W")[0].trim();
result.overall.losses = losses.split("L")[0].trim();


// ========================
// COMBAT STATS
// ========================

result.combat = {};

$("p.font-bold").each((i,el)=>{

const text = $(el).text();

if(text.includes("KOs"))
result.combat.kos = text.replace("KOs","").trim();

if(text.includes("Falls"))
result.combat.falls = text.replace("Falls","").trim();

if(text.includes("Suicides"))
result.combat.suicides = text.replace("Suicides","").trim();

if(text.includes("Team KOs"))
result.combat.teamKos = text.replace("Team KOs","").trim();

if(text.includes("Damage dealt"))
result.combat.damageDealt = text.replace("Damage dealt","").trim();

if(text.includes("Damage taken"))
result.combat.damageTaken = text.replace("Damage taken","").trim();

});


// ========================
// RETURN
// ========================

return result;

}


getPlayer("122711961")
.then(data=>console.log(JSON.stringify(data,null,2)))
.catch(console.error);