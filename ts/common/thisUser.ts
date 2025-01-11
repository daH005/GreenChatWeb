import { User } from "./apiDataInterfaces.js"
import { userById } from "./users.js";

export var thisUser: User = await userById();
