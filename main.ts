import { serve } from "https://deno.land/std@0.74.0/http/server.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { decode } from "https://deno.land/std@0.74.0/encoding/utf8.ts";

const PORT = 4321;
const s = serve({ port: PORT});

const db = new DB("./db/sqlite.db");
db.query(
  "CREATE TABLE IF NOT EXISTS characters (\
    id INTEGER PRIMARY KEY AUTOINCREMENT, \
    logo_url TEXT, \
    name TEXT, \
    description TEXT, \
    role TEXT, \
    stamina_value INTEGER, \
    intelect_value INTEGER, \
    created DATETIME)"
);
/* db.query(
  "INSERT INTO characters (logo_url, name, description, role, stamina_value, intelect_value, created) VALUES (?,?,?,?,?,?,?)",
  [
    "https://assets.funnygames.org/2/742/53579/300x300/swords-and-sandals-2-emperors-reign.jpg",
    "Durgesh",
    "Just some black dude with red eyes",
    "Bard",
    "12",
    "8",
    Date.now()
  ]
); */

interface CharacterProps {
  logo_url: string;
  name: string;
  description: string;
  role: string;
  stamina_value: number;
  intelect_value: number;
  created: Date;
};
const isCharacterProps = (body: any): body is CharacterProps => {
  if((body as CharacterProps).logo_url &&
      (body as CharacterProps).name &&
      (body as CharacterProps).description &&
      (body as CharacterProps).role &&
      (body as CharacterProps).stamina_value &&
      (body as CharacterProps).intelect_value &&
      (body as CharacterProps).created
    ){
    return true
  }
  return false
}


console.log(`Listening on <http://localhost>:${PORT}/`);

for await (const req of s) {
  const params = req.url.split("?");
  const bad_request = { body: "Error 400: bad request.", status: 400 };

  if (params.length > 2) {
    req.respond(bad_request);
    continue;
  }
  const url = params[0];
  const search_params = new URLSearchParams(params[1]);

  if (url == "/api/v1/characters") {
    let count = 10;
    let request_count = search_params.get("count");

    if (request_count) {
      if (parseInt(request_count) > 100) {
        req.respond(bad_request);
        continue;
      } else {
        count = parseInt(request_count);
      }
    }

    const results: CharacterProps[] = [];
    for (const [
      logo_url,
      name,
      description,
      role,
      stamina_value,
      intelect_value,
      created
    ] of db.query(
      "SELECT logo_url, name, description, role, stamina_value, intelect_value, created \
        FROM characters \
        ORDER BY created DESC \
        LIMIT ?",
      [count]
      )) {
        results.push({
          logo_url,
          name,
          description,
          role,
          stamina_value,
          intelect_value,
          created
        });
    }

    req.respond({
      body: JSON.stringify(results),
      status: 200,
    });
    continue;
  }

  if (url == "/api/v1/characters/add") {
    let password_valid = false;
    const password = "supesecuredpassword";
    let request_password = search_params.get("pw");
    if (request_password) {
      if (request_password == password) {
        password_valid = true;
      }
    }
    if (password_valid == false) {
      req.respond({
        body: "Not Allowed. Wrong Password.",
        status: 405,
      });
      continue;
    }
    // validated can add
    else {
      const character = JSON.parse(decode(await Deno.readAll(req.body)));
      console.log("Adding:")
      console.log(character);

      if (!isCharacterProps(character)) {
        req.respond({
          body: "Not a Character. You are missing fields.",
          status: 406,
        });
        continue;
      } else {
      // write into database
        db.query(
          "INSERT INTO characters (logo_url, name, description, role, stamina_value, intelect_value, created) VALUES (?,?,?,?,?,?,?)",
          [
            character.logo_url,
            character.name,
            character.description,
            character.role,
            character.stamina_value,
            character.intelect_value,
            character.created
          ]
        );

        req.respond({
          body: "Success",
          status: 200,
        });
        continue;
      }
    }
  }
}

db.close();
