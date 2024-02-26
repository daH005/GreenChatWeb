import { assertEqualsObjects } from "./common.js";
import { HTTP_BASE_URL } from "../_config.js";
import { makeRequestingUrlAndOptions,
         requestRegistration,
         requestCheckUsername,
         requestCheckEmail,
         requestSendEmailCode,
         requestCheckEmailCode,
         requestAuthByUsernameAndPassword,
         requestUserInfo,
         requestUserChats,
         requestChatHistory,
         requestNewJWTToken,
       } from "../_http.js";
import { JWTToken } from "../_localStorage.js";

JWTToken.get = () => {
    return "testToken";
}

function testPositiveMakeRequestingUrlAndOptions() {
    let data = [
        [
            // in
            [
                requestRegistration.options,
                {
                    username: "dan005",
                    password: "Mypass",
                    firstName: "Danil",
                    lastName: "Shevelev",
                    email: "email.123@mail.ru",
                    code: 5150,
                }
            ],
            // out
            [
                "http://localhost:5181/user/new",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username: "dan005",
                        password: "Mypass",
                        firstName: "Danil",
                        lastName: "Shevelev",
                        email: "email.123@mail.ru",
                        code: 5150,
                    })
                }
            ]
        ],
        [
            // in
            [
                requestCheckUsername.options,
                {
                    username: "dan005",
                }
            ],
            // out
            [
                "http://localhost:5181/user/new/check/username?username=dan005",
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            ]
        ],
        [
            // in
            [
                requestCheckEmail.options,
                {
                    email: "dan005@mail.ru",
                }
            ],
            // out
            [
                "http://localhost:5181/user/new/check/email?email=dan005%40mail.ru",  // @ = %40
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            ]
        ],
        [
            // in
            [
                requestSendEmailCode.options,
                {
                    code: 5150,
                }
            ],
            // out
            [
                "http://localhost:5181/user/new/code/send",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        code: 5150,
                    })
                }
            ]
        ],
        [
            // in
            [
                requestCheckEmailCode.options,
                {
                    code: 1122,
                }
            ],
            // out
            [
                "http://localhost:5181/user/new/code/check?code=1122",
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            ]
        ],
        [
            // in
            [
                requestAuthByUsernameAndPassword.options,
                {
                    username: "dan005",
                    password: "Mypass",
                }
            ],
            // out
            [
                "http://localhost:5181/user/auth",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username: "dan005",
                        password: "Mypass",
                    })
                }
            ]
        ],
        [
            // in
            [
                requestUserInfo.options,
                {
                    id: 100
                }
            ],
            // out
            [
                "http://localhost:5181/user/info?id=100",
                {
                    method: "GET",
                    headers: {
                        "Authorization": "Bearer testToken",
                        "Content-Type": "application/json",
                    },
                }
            ]
        ],
        [
            // in
            [
                requestUserInfo.options,
                null
            ],
            // out
            [
                "http://localhost:5181/user/info",
                {
                    method: "GET",
                    headers: {
                        "Authorization": "Bearer testToken",
                        "Content-Type": "application/json",
                    },
                }
            ]
        ],
        [
            // in
            [
                requestUserChats.options,
                null
            ],
            // out
            [
                "http://localhost:5181/user/chats",
                {
                    method: "GET",
                    headers: {
                        "Authorization": "Bearer testToken",
                        "Content-Type": "application/json",
                    },
                }
            ]
        ],
        [
            // in
            [
                requestChatHistory.options,
                {
                    chatId: 1,
                    offsetFromEnd: 1,
                }
            ],
            // out
            [
                "http://localhost:5181/chats/1/history?chatId=1&offsetFromEnd=1",
                {
                    method: "GET",
                    headers: {
                        "Authorization": "Bearer testToken",
                        "Content-Type": "application/json",
                    },
                }
            ]
        ],
        [
            // in
            [
                requestNewJWTToken.options,
                null
            ],
            // out
            [
                "http://localhost:5181/user/refreshToken",
                {
                    method: "POST",
                    headers: {
                        "Authorization": "Bearer testToken",
                        "Content-Type": "application/json",
                    },
                }
            ]
        ],
    ];
    for (let i in data) {
        let outputData = makeRequestingUrlAndOptions(...data[i][0]);
        assertEqualsObjects(outputData, data[i][1]);
    }
}
testPositiveMakeRequestingUrlAndOptions();
