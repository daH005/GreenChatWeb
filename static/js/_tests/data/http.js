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
       } from "../../common/http/functions.js";

export const COMMON_COOKIE_VALUE = "COMMON_COOKIE_VALUE";

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
            "https://localhost:5181/user/login/email/check?email=dan005%40mail.ru", // %40 = @
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
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
            "https://localhost:5181/user/login/email/code/send",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": COMMON_COOKIE_VALUE,
                },
                body: JSON.stringify({
                    code: 5150,
                }),
                credentials: "include",
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
            "https://localhost:5181/user/login/email/code/check?code=1122",
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
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
            "https://localhost:5181/user/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": COMMON_COOKIE_VALUE,
                },
                body: JSON.stringify({
                    username: "dan005",
                    password: "Mypass",
                }),
                credentials: "include",
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
            "https://localhost:5181/user/info?userId=100",
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
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
            "https://localhost:5181/user/info",
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
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
            "https://localhost:5181/user/avatar?userId=1",
            {
                method: "GET",
                headers: {},
                credentials: "include",
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
            "https://localhost:5181/user/info/edit",
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": COMMON_COOKIE_VALUE,
                },
                body: JSON.stringify({
                    firstName: "dan",
                    lastName: "shev",
                }),
                credentials: "include",
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
            "https://localhost:5181/user/avatar/edit",
            {
                method: "PUT",
                headers: {
                    "X-CSRF-TOKEN": COMMON_COOKIE_VALUE,
                },
                body: new File(["foo"], "file.jpg"),
                credentials: "include",
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
            "https://localhost:5181/user/chats",
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
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
            "https://localhost:5181/chat/history?chatId=1&offsetFromEnd=1",
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            }
        ]
    ],
];
