/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            screens: {
                '3xl': '1750px',
                '4xl': '1900px'
            }
        },
    },
    daisyui: {
        themes: [
            "dark",
            {
                dark: {
                    ...require("daisyui/src/colors/themes")["[data-theme=dark]"],
                    primary: "#3E7DC1",
                },
            },
            {
                light: {
                    ...require("daisyui/src/colors/themes")["[data-theme=light]"],
                    primary: "#071d49",
                },
            }
        ]
    },
    plugins: [require("daisyui")],
}