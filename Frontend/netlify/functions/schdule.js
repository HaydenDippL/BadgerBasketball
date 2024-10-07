import { DateTime } from "luxon";
import { logging } from "../helpers/logging";

export async function handler(event, context) {
    const date = DateTime.fromFormat(req.queryStringParameters.date, "yyyy-MM-dd");
    const gym = req.queryStringParameters.gym;
    const gym_facility = req.queryStringParameters.gym_facility;
    const session_id = req.queryStringParameters.session_id;
    const device = req.queryStringParameters.device;
    const browser = req.queryStringParameters.browser;
    const IP = req.ip; // FIXME: IP handling

    if (!date.isValid) {
        res.status(400).send("Ensure that the date query is a valid date of the form \"yyyy-mm-dd\" where \"2025-01-01\" represents January 1rst, 2025.");
    }

    if (gym !== "Bakke" && gym !== "Nick") {
        res.status(400).send("Ensure that the gym query parameter is either \"Bakke\" or \"Nick\".");
    }

    if (gym_facility !== "Courts") {
        res.status(400).send("Ensure that the gym_facility query parameter is \"Courts\".");
    }

    let schedule;
    try {
        schedule = await call_recwell(gym, date);
    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }

    // logging(query.toISODate(), gym, gym_facility, session_id, IP, now.toISODate(), now.toISOTime().substring(0, 8), device, browser)

    return {
        statusCode: 200,
        body: JSON.stringify(schedule)
    };
}

// https://stackoverflow.com/questions/44195322/a-plain-javascript-way-to-decode-html-entities-works-on-both-browsers-and-node
// Sometimes characters from the recwell api come out as weird encodings, this decodes them
function decodeEntities(encodedString) {
    var translate_re = /&(nbsp|amp|quot|lt|gt|&#39;);/g;
    var translate = {
        "nbsp": " ",
        "amp" : "&",
        "quot": "\"",
        "lt"  : "<",
        "gt"  : ">",
        "&#39;" : "\'"
    };

    return encodedString.replace(translate_re, function(match, entity) {
        return translate[entity];;
    }).replace(/&#(\d+);/gi, function(match, numStr) {
        var num = parseInt(numStr, 10);
        return String.fromCharCode(num);
    });
}

// Returns the filtered schedule form the Recwell Servers
async function call_recwell(gym, date) {
    const RECWELL_URL = "https://uwmadison.emscloudservice.com/web/AnonymousServersApi.aspx/CustomBrowseEvents";

    const date_str = date.toFormat("yyyy-MM-dd");
    let BuildingId;
    let Title;
    let EncryptD;
    if (gym === "Bakke") {
        BuildingId = 1112;
        Title = "Bakke Recreation and Wellbeing Center";
        EncryptD = "https://uwmadison.emscloudservice.com/web/CustomBrowseEvents.aspx?data=meoZqrqZMvHKSLWaHS%2f4bjdroAMc1geNvtL12O1chw1fIP%2bOGy79Y1bkm2DPPKqmpSFHyPvFHX3LAJJHEfBPycyxctYlpcHD4rIwd%2byAtBNWXsKhJT9UDchzs%2bSc3Ze6JFHimlPlQrL2Jk7LFEkj3FoTWmA0BKzQQk0%2beDFO2IBZSiNnDXPGZQ%3d%3d";
    } else if (gym == "Nick") {
        BuildingId = 1109;
        Title = "Nicholas Recreation Center";
        EncryptD = "https://uwmadison.emscloudservice.com/web/CustomBrowseEvents.aspx?data=RtFXo1hK2Mh0UPlwkh3Aua7auJ66NvvBNBlUULUwM7vu4XjCwc5WoatHUWdz5pRofwluz9ZmHCNbHsgQ9uEDZjArIem0ShC%2fuM4gJbohNWkNGhzqKkAwrHDWzuEbcQxjHc8CzLweyL05oQ7ToCjKkM5TC%2b639V3qHwqgx1EhbWU%3d";
    }

    const headers = new Headers();
    headers.append("Content-Type", "application/json");

    const body = {
        date: date_str,
        data: {
          BuildingId: BuildingId,
          GroupTypeId: -1,
          GroupId: -1,
          EventTypeId: -1,
          RoomId: -1,
          StatusId: -1,
          ZeroDisplayOnWeb: 1,
          HeaderUrl: "",
          Title: Title,
          Format: 0,
          Rollup: 0,
          PageSize: 250,
          DropEventsInPast: false,
          EncryptD: EncryptD
        }
    };

    return await fetch(RECWELL_URL, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body)
    })
        .then(async (resp) => {
            const json_content = await resp.json();
            if (!resp.ok) throw new Error(`Network response was not OK: ${resp.status}` + (json_content) ? `\nRecwell API Response: ${json_content}` : "");
            else return json_content;
        })
        .then(data => JSON.parse(data.d))
        .then(data => {
            const events = data.DailyBookingResults;
            return events
                .filter(event => event['Room'].substring(0, 5).toLowerCase() === 'court' && event['EventStart'].split('T')[0] === date_str)
                .map(event => {
                    return {
                        'EventName': decodeEntities(event['EventName'].trim()),
                        'Location': decodeEntities(event['Room'].trim()),
                        'EventStart': decodeEntities(event['EventStart'].trim()),
                        'EventEnd': decodeEntities(event['EventEnd'].trim())
                    };
                })
        })
        .catch(error => {
            console.error(error);
            return error;
        });
}