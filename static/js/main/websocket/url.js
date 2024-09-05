export var WEBSOCKET_URL = ""; // <- WEBSOCKET_URL // Comment For Nginx
if (!WEBSOCKET_URL) {
    WEBSOCKET_URL = "wss://localhost:5180";
}
else {
    let protocol = window.location.protocol;
    if (protocol == "https:") {
        protocol = "wss";
    }
    else {
        protocol = "ws";
    }
    let hostAndPort = window.location.host;
    WEBSOCKET_URL = protocol + "://" + hostAndPort + WEBSOCKET_URL;
    console.log("WEBSOCKET_URL -", WEBSOCKET_URL);
}
