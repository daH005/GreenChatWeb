import { requestToCheckEmail,
         requestToSendEmailCode,
         requestToCheckEmailCode,
         requestToLogin,
         requestUserInfo,
         requestUserAvatar,
         requestToEditUserInfo,
         requestToEditUserAvatar,
         requestUserChats,
         requestChatHistory,
         requestNewJWT,
       } from "../../common/http/functions.js";

export const FUNCTIONS_ARGS_AND_FETCH_ARGS = [
    [
        // in
        [
            requestToCheckEmail.options,
            {
                email: "dan005@mail.ru",
            }
        ],
        // out
        [
            "http://localhost:5181/user/login/email/check?email=dan005%40mail.ru", // %40 = @
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
            requestToSendEmailCode.options,
            {
                code: 5150,
            }
        ],
        // out
        [
            "http://localhost:5181/user/login/email/code/send",
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
            requestToCheckEmailCode.options,
            {
                code: 1122,
            }
        ],
        // out
        [
            "http://localhost:5181/user/login/email/code/check?code=1122",
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
            requestToLogin.options,
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
            requestToEditUserInfo.options,
            {
                firstName: "dan",
                lastName: "shev",
            }
        ],
        // out
        [
            "http://localhost:5181/user/info/edit",
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
            requestToEditUserAvatar.options,
            new File(["foo"], "file.jpg"),
        ],
        // out
        [
            "http://localhost:5181/user/avatar/edit",
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
            "http://localhost:5181/chat/history?chatId=1&offsetFromEnd=1",
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
