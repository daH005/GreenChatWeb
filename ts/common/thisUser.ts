import { User } from "./apiDataInterfaces.js"
import { requestUser } from "./http/functions.js";

export var thisUser: User = await requestUser();
