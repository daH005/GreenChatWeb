import { assertEqualsObjects } from "./common.js";
import { HTTP_BASE_URL } from "../_config.js";
import { makeRequestingUrlAndOptions,
         requestCheckEmail,
         requestSendEmailCode,
         requestCheckEmailCode,
         requestLogin,
         requestUserInfo,
         requestUserAvatar,
         requestUserEditInfo,
         requestUserEditAvatar,
         requestUserChats,
         requestChatHistory,
         requestNewJWT,
       } from "../_http.js";
import { JWT } from "../_localStorage.js";

JWT.get = () => {
    return "testToken";
}

function testPositiveMakeRequestingUrlAndOptions() {
    let data = [
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
                "http://localhost:5181/user/login/email/check?email=dan005%40mail.ru",  // %40 = @
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
                "http://localhost:5181/user/login/code/send",
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
                "http://localhost:5181/user/login/code/check?code=1122",
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
                requestLogin.options,
                {
                    username: "dan005",
                    password: "Mypass",
                }
            ],
            // out
            [
                "http://localhost:5181/user/login",
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
                    userId: 100
                }
            ],
            // out
            [
                "http://localhost:5181/user/info?userId=100",
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
                requestUserAvatar.options,
                {
                    userId: 1,
                }
            ],
            // out
            [
                "http://localhost:5181/user/avatar?userId=1",
                {
                    method: "GET",
                    headers: {
                        "Authorization": "Bearer testToken",
                    },
                }
            ]
        ],
        [
            // in
            [
                requestUserEditInfo.options,
                {
                    firstName: "dan",
                    lastName: "shev",
                }
            ],
            // out
            [
                "http://localhost:5181/user/edit/info",
                {
                    method: "PUT",
                    headers: {
                        "Authorization": "Bearer testToken",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        firstName: "dan",
                        lastName: "shev",
                    }),
                }
            ]
        ],
        [
            // in
            [
                requestUserEditAvatar.options,
                new File(["foo"], "file.jpg"),
            ],
            // out
            [
                "http://localhost:5181/user/edit/avatar",
                {
                    method: "PUT",
                    headers: {
                        "Authorization": "Bearer testToken",
                    },
                    body: new File(["foo"], "file.jpg"),
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
                requestNewJWT.options,
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
        console.log(data[i][1][0]);

        let outputData = makeRequestingUrlAndOptions(...data[i][0]);
        assertEqualsObjects(outputData, data[i][1]);
    }
}
testPositiveMakeRequestingUrlAndOptions();
