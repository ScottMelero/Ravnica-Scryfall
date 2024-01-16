const xlsx = require("xlsx");
const axios = require("axios");

console.log("big query inc..");

// Store each request's response JSON in an array

// For each card in "data"
// if data["id"] is in uniqueIds, skip this card
// store "id:" in uniqueIds set
// process data to remove unused JSON properties and
// add it to our result array of JSONs
const query =
  "(game:paper) (block:grn OR block:rtr OR block:rav) (flavor:/^[^s]/ OR type=land OR (id=azorius OR id=boros OR id=dimir OR id=golgari OR id=gruul OR id=izzet OR id=orzhov OR id=rakdos OR id=selesnya OR id=simic) OR (watermark=azorius OR watermark=boros OR watermark=dimir OR watermark=golgari OR watermark=gruul OR watermark=izzet OR watermark=orzhov OR watermark=rakdos OR watermark=selesnya OR watermark=simic) OR (lore=azorius OR lore=boros OR lore=dimir OR lore=golgari OR lore=gruul OR lore=izzet OR lore=orzhov OR lore=rakdos OR lore=selesnya OR lore=simic))";
var result = [];
var responses = [];
var promises = [];

console.log("querying...");
queryScryfall(query);

/**
 * query scryfall for all the cards we want
 * @param {String} query query for scryfall
 * @param {Int} page the page of query to get
 */
function queryScryfall(query, currentPage = 1) {
  promises.push(
    axios
      .get("https://api.scryfall.com/cards/search", {
        params: {
          q: query, //insert scryfall query here
          unique: "art",
          order: "color",
          page: currentPage,
        },
      })
      .then(function (response) {
        var data = response.data;
        if (currentPage == 1) console.log("total cards in response: " + response.data.total_cards);
        // console.log(response.data);

        data.data.forEach((card) => {
          responses.push(card);
          // console.log("added card " + card.name + " to responses.");
        });

        if (Object.hasOwn(data, "next_page")) {
          console.log("moving to next page");
          queryScryfall(query, currentPage + 1);
        } else {
          console.log("done with queries");
        }
      })
      .catch(function (error) {
        console.log("error occured: " + error);
      })
  );

  Promise.all(promises).then(() => {
    processResponses(responses);
    // should output 2444
  });
}

/**
 * processes "responses" then produces a .xlsx with all the card data we want
 * @param {Array} responses responses from Scryfall
 */
function processResponses(cardData) {
  var result = [];

  var uniqueIds = new Set();

  cardData.forEach((card) => {
      
    // Should be redundant
    if (card.id in uniqueIds) return;
        
    uniqueIds.add(card.id);

    var cardFiltered = {};
    cardFiltered.Name = card.name;
    cardFiltered.Image = "=image(INDIRECT(ADDRESS(ROW(), COLUMN() + 10, 4)))"; // Formula for geeting the image from a url in the cell 10 columns to the right
    cardFiltered.Artist = card.artist;
    cardFiltered.Flavor = card.flavor_text;
    cardFiltered.Guild = findGuild(card);
    cardFiltered.Colors = getColorIdentity(card.color_identity);
    cardFiltered.Type = card.type_line;
    if (Object.hasOwn(card, "power")) cardFiltered.PowerToughness = card.power + "/" + card.toughness;
    cardFiltered.OracleText = card.oracle_text;
    cardFiltered.Watermark = card.watermark;
    cardFiltered.Set = card.set_name;
    cardFiltered.ImageLink = card.image_uris.art_crop;

    result.push(cardFiltered);
  });

  // turn our result array into a sheet
  outputXLSX(result);
}

/**
 * produces a .xlsx with all the card data we want
 * @param {Array} result array of JSON objects representing cards
 */
function outputXLSX(result) {
  const newWorkBook = xlsx.utils.book_new();
  const newWorkSheet = xlsx.utils.json_to_sheet(result);
  xlsx.utils.book_append_sheet(newWorkBook, newWorkSheet, "New Sheet");
  xlsx.writeFile(newWorkBook, "ravnica_scryfall.xlsx");
}



/**
 * returns the color identity in english instead of scryfall's syntax
 * @param {Array} colors colors of the card in scryfall syntax
 */
function getColorIdentity(colors) {
    switch (colors.toString()) {
        case "U,W":
            return "Azorius";
        case "R,W":
            return "Boros";
        case "B,U":
            return "Dimir";
        case "B,G":
            return "Golgari";
        case "G,R":
            return "Gruul";
        case "R,U":
            return "Izzet";
        case "B,W":
            return "Orzhov";
        case "B,R":
            return "Rakdos";
        case "G,W":
            return "Selesnya";
        case "G,U":
            return "Simic";
        case "W":
            return "White";
        case "U":
            return "Blue";
        case "B":
            return "Black";
        case "R":
            return "Red";
        case "G":
            return "Green";
        case "B,R,U,W":
            return "Yore-Tiller";
        case "B,G,R,U":
            return "Glint-Eye";
        case "B,G,R,W":
            return "Dune-Brood";
        case "G,R,U,W":
            return "Ink-Treader";
        case "B,G,U,W":
            return "Witch-Maw";
        case "B,G,R,U,W":
            return "All Colors"
        case "":
            return "Colorless"
        default:
            return "Tricolor";
      }
}

/**
 * returns either, azorius, boros, dimir, golgari, gruul, izzet, orzhov, rakdos, selesnya, simic, or guildless
 * @param {JSON} card a card to have the guild determined for
 */
function findGuild(card) {
  // return the guild affiliation of the card, planeswalker watermarks get in the way
  if (Object.hasOwn(card, "watermark") && card.watermark != "planeswalker") return card.watermark[0].toUpperCase() + card.watermark.slice(1);

  // TODO make logic to add multiple guild affiliations, like on fuse cards
  if (card.color_identity.length == 3) return "Combo";

  switch (card.color_identity.toString()) {
    case "U,W":
        return "Azorius";
    case "R,W":
        return "Boros";
    case "B,U":
        return "Dimir";
    case "B,G":
        return "Golgari";
    case "G,R":
        return "Gruul";
    case "R,U":
        return "Izzet";
    case "B,W":
        return "Orzhov";
    case "B,R":
        return "Rakdos";
    case "G,W":
        return "Selesnya";
    default:
      return "Guildless";
  }
}
