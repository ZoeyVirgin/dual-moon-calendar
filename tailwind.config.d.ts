declare const _default: {
    content: string[];
    theme: {
        extend: {
            colors: {
                accent: {
                    DEFAULT: string;
                    hover: string;
                };
                event: {
                    s: string;
                    a: string;
                    b: string;
                    c: string;
                };
            };
            fontFamily: {
                sans: [string, string, string];
            };
            animation: {
                'fade-in': string;
                'fade-out': string;
                'slide-up': string;
            };
            keyframes: {
                fadeIn: {
                    '0%': {
                        opacity: string;
                    };
                    '100%': {
                        opacity: string;
                    };
                };
                fadeOut: {
                    '0%': {
                        opacity: string;
                    };
                    '100%': {
                        opacity: string;
                    };
                };
                slideUp: {
                    '0%': {
                        opacity: string;
                        transform: string;
                    };
                    '100%': {
                        opacity: string;
                        transform: string;
                    };
                };
            };
        };
    };
    plugins: any[];
};
export default _default;
