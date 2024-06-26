const xlsx = require("xlsx");
const axios = require("axios");

console.log("big query inc..");

// Store each request's response JSON in an array

// For each card in "data"
// if data["id"] is in uniqueIds, skip this card
// store "id:" in uniqueIds set
// process data to remove unused JSON properties and
// add it to our result array of JSONs

// All named characters from Ravnica (source: mtg wiki)
const namedCharacters = "lore=\"Agrus Kos\" OR lore=\"Alquist Proft\" OR lore=\"Ambrellin\" OR lore=\"Ambroz Benakov\" OR lore=\"Amzu\" OR lore=\"Andra\" OR lore=\"Anzrag\" OR lore=\"Araithia Shokta\" OR lore=\"Ari Shokta\" OR lore=\"Arrus\" OR lore=\"Baas\" OR lore=\"Babolax\" OR lore=\"Barrin Grevik\" OR lore=\"Bartek\" OR lore=\"Bayul\" OR lore=\"Bell Borca\" OR lore=\"Bilagru\" OR lore=\"Biracazir\" OR lore=\"Bitsy\" OR lore=\"Blim\" OR lore=\"Bori Andon\" OR lore=\"Boruvo\" OR lore=\"Bosco\" OR lore=\"Bougrat\" OR lore=\"Bozak\" OR lore=\"Branko\" OR lore=\"Bruvac\" OR lore=\"Castan\" OR lore=\"Cecilee\" OR lore=\"Circu\" OR lore=\"Crixizix\" OR lore=\"Damir\" OR lore=\"Dars Gostok\" OR lore=\"Darux\" OR lore=\"Delney\" OR lore=\"Durri\" OR lore=\"Duskana\" OR lore=\"Emil\" OR lore=\"Etrata\" OR lore=\"Ezrim\" OR lore=\"Fblthp\" OR lore=\"Ferrous Rokiric\" OR lore=\"Florin Ozbolt\" OR lore=\"Fonn Zunich\" OR lore=\"Forenzad\" OR lore=\"Gan Shokta\" OR lore=\"Geetra\" OR lore=\"Gerava\" OR lore=\"Ghired\" OR lore=\"Gorev Hadszak\" OR lore=\"Govan Radley\" OR lore=\"Grimbly Wothis\" OR lore=\"Grugg Brothers\" OR lore=\"Helligan\" OR lore=\"Helsk\" OR lore=\"Igort Uriklatz\" OR lore=\"Ilharg\" OR lore=\"Ilona\" OR lore=\"Iv\'g\'nork\" OR lore=\"Jace Beleren\" OR lore=\"Janik\" OR lore=\"Javy\" OR lore=\"Jebun Kirescu\" OR lore=\"Jek\" OR lore=\"Jiri\" OR lore=\"Jitka Wothis\" OR lore=\"Johrum\" OR lore=\"Judith\" OR lore=\"Juri\" OR lore=\"Kal\" OR lore=\"Kaluzax\" OR lore=\"Karlov\" OR lore=\"Kaust\" OR lore=\"Kel\" OR lore=\"Kelen Jek\" OR lore=\"Kodolaag\" OR lore=\"Krenko\" OR lore=\"Kuba\" OR lore=\"Kylox\" OR lore=\"Leighbet\" OR lore=\"Lonis\" OR lore=\"Lord Kazmyr\" OR lore=\"Madarrak\" OR lore=\"Maladola\" OR lore=\"Maree\" OR lore=\"Marvo\" OR lore=\"Massacre Girl\" OR lore=\"Mazena\" OR lore=\"Mazirek\" OR lore=\"Medge\" OR lore=\"Melek\" OR lore=\"Melisk\" OR lore=\"Merret\" OR lore=\"Migellic\" OR lore=\"Mindosz\" OR lore=\"Miri\" OR lore=\"Mirko Vosk\" OR lore=\"Mizzix\" OR lore=\"Modar Bejiri\" OR lore=\"Morska\" OR lore=\"Myczil Savod Zunich\" OR lore=\"Myczil Zunich\" OR lore=\"Nebun\" OR lore=\"Nelly Borca\" OR lore=\"Nhillosh\" OR lore=\"Nikya\" OR lore=\"Oana Vitellius I\" OR lore=\"Ossett Weslyn\" OR lore=\"Otrovac\" OR lore=\"Palla\" OR lore=\"Parisha\" OR lore=\"Pel Javya\" OR lore=\"Phaskin\" OR lore=\"Pivlic\" OR lore=\"Project Kraj\" OR lore=\"Ptero Zallik\" OR lore=\"Radomir\" OR lore=\"Raiche Belas\" OR lore=\"Relov\" OR lore=\"Rezajaelis Agnaus\" OR lore=\"Rinni\" OR lore=\"Ritjit\" OR lore=\"Roalesk\" OR lore=\"Ruric Thar\" OR lore=\"Ruzi\" OR lore=\"Sadruna\" OR lore=\"Sarusin\" OR lore=\"Senka\" OR lore=\"Shattergang Brothers\" OR lore=\"Shokol Wenslauv\" OR lore=\"Skrygix\" OR lore=\"Sobeslav\" OR lore=\"Sophia\" OR lore=\"Squelch\" OR lore=\"Stanslov\" OR lore=\"Storrev\" OR lore=\"Sulli Valenco\" OR lore=\"Suniel\" OR lore=\"Symond Halm\" OR lore=\"Tajic\" OR lore=\"Tamsyn Sweene\" OR lore=\"Tanek\" OR lore=\"Tarem\" OR lore=\"Terrik\" OR lore=\"Tesak\" OR lore=\"Teyo Verada\" OR lore=\"The Cozen\" OR lore=\"Tibor and Lumia\" OR lore=\"Tolsimir Wolfblood\" OR lore=\"Trenz\" OR lore=\"Trifon\" OR lore=\"Trijiro\" OR lore=\"Troyan\" OR lore=\"Ulasht\" OR lore=\"Vadax Gor\" OR lore=\"Varolz\" OR lore=\"Vazozav\" OR lore=\"Vict Gharti\" OR lore=\"Voja Fenstalker\" OR lore=\"Vor Golozar\" OR lore=\"Vorel\" OR lore=\"Wrizfar Barkfeather\" OR lore=\"Wyoryn\'vili\" OR lore=\"Xeddick\" OR lore=\"Yaraghiya\" OR lore=\"Yarus\" OR lore=\"Yeva\" OR lore=\"Yzaak\" OR lore=\"Zlovol\" OR lore=\"Zomaj Hauc\""

// The sets to search
const qSets = "(set:clu OR set:mkm OR set:rvr OR (set:mkc new:art) OR block:grn OR block:rtr OR block:rav)"

// The filters to be "AND"ed with the sets
const qFilters = "(flavor:/^[^s]/ OR type=land OR (set:rvr new:art) OR (id=azorius OR id=boros OR id=dimir OR id=golgari OR id=gruul OR id=izzet OR id=orzhov OR id=rakdos OR id=selesnya OR id=simic))"

// Filters to search all cards, regardless of set. Used for Guild watermarks, "Lore" searches, and irregular cards (like planes)
const qAllSets = "(type=plane type=ravnica) OR (watermark = azorius OR watermark = boros OR watermark = dimir OR watermark = golgari OR watermark = gruul OR watermark = izzet OR watermark = orzhov OR watermark = rakdos OR watermark = selesnya OR watermark = simic) OR (lore = azorius OR lore = boros OR lore = dimir OR lore = golgari OR lore = gruul OR lore = izzet OR lore = orzhov OR lore = rakdos OR lore = selesnya OR lore = simic) OR (lore = Domri OR lore =\"Ral Zarek\" OR lore=Vraska " /*+ "OR" + namedCharacters*/ + " )"


//const query = "(" + qSets + qFilters + ") OR " + qAllSets

const query =
    "(type=plane type=ravnica) OR ((set:mkm OR set:rvr OR (set:mkc new:art) OR set:clu OR block:grn OR block:rtr OR block:rav) (flavor:/^[^s]/ OR type=land OR (id=azorius OR id=boros OR id=dimir OR id=golgari OR id=gruul OR id=izzet OR id=orzhov OR id=rakdos OR id=selesnya OR id=simic))) OR (watermark=azorius OR watermark=boros OR watermark=dimir OR watermark=golgari OR watermark=gruul OR watermark=izzet OR watermark=orzhov OR watermark=rakdos OR watermark=selesnya OR watermark=simic) OR (lore=azorius OR lore=boros OR lore=dimir OR lore=golgari OR lore=gruul OR lore=izzet OR lore=orzhov OR lore=rakdos OR lore=selesnya OR lore=simic)"
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
        console.log("error occured: " + error + ", " + error.response.data.details);
      })
  );

  Promise.all(promises).then(() => {
    processResponses(responses);
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
      
    try {
        cardFiltered.Name = card.name;
        cardFiltered.Image = "=image(INDIRECT(ADDRESS(ROW(), COLUMN() + 10)))"; // Formula for geeting the image from a url in the cell 10 columns to the right
        cardFiltered.Artist = card.artist;
        cardFiltered.Flavor = card.flavor_text;
        cardFiltered.Guild = findGuild(card);
        cardFiltered.Colors = getColorIdentity(card.color_identity);
        cardFiltered.Type = card.type_line;
        if (Object.hasOwn(card, "power")) cardFiltered.PowerToughness = card.power + "/" + card.toughness;
        cardFiltered.OracleText = card.oracle_text;
        cardFiltered.Watermark = card.watermark;
        cardFiltered.Set = card.set_name;
        if (!Object.hasOwn(card, "image_uris")) {
            cardFiltered.ImageLink = card.card_faces[0].image_uris.art_crop;
            cardFiltered.BackImage = "=image(INDIRECT(ADDRESS(ROW(), COLUMN() + 1)))";
            cardFiltered.BackFaceImageLink = card.card_faces[1].image_uris.art_crop;
        }
        else cardFiltered.ImageLink = card.image_uris.art_crop;
    } catch (TypeError) {
        console.log(card.name + " throws " + TypeError);
        return;
    }
    

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
