import auth from "./auth";
import furry from "./furry";
import animals from "./animals";
import music from "./music";
import games from "./games";
import base from "./base";

export default { ...auth, ...furry, ...animals, ...music, ...games, ...base };
