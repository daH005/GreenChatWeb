import { APIUser } from "./apiDataInterfaces.js"
import { requestUser } from "./http/functions.js";

export var thisUser: APIUser = await requestUser();
