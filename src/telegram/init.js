import WebApp from "@twa-dev/sdk";

export const initTelegramApp = () => {
    WebApp.enableClosingConfirmation();
    WebApp.setHeaderColor("#222222");
    WebApp.setBackgroundColor("#ffffff");

    // Ready event
    WebApp.ready();
};

export const getUserData = () => {
    // Birinchi usul: WebApp.initDataUnsafe
    let user = WebApp.initDataUnsafe?.user;
    
    // Ikkinchi usul: window.Telegram.WebApp
    if (!user && typeof window !== 'undefined' && window.Telegram?.WebApp) {
        user = window.Telegram.WebApp.initDataUnsafe?.user;
    }
    
    // Uchinchi usul: initData ni parse qilish
    if (!user && WebApp.initData) {
        try {
            const initData = new URLSearchParams(WebApp.initData);
            const userStr = initData.get('user');
            if (userStr) {
                user = JSON.parse(decodeURIComponent(userStr));
            }
        } catch (error) {
            console.error("Error parsing initData:", error);
        }
    }
    
    // Debug uchun
    console.log("WebApp.initDataUnsafe:", WebApp.initDataUnsafe);
    console.log("WebApp.initData:", WebApp.initData);
    console.log("Found user:", user);
    
    return user || null;
};

export const sendDataToBot = (data) => {
    WebApp.sendData(JSON.stringify(data));
};

export const closeApp = () => {
    WebApp.close();
};

export const hello = () => {
    WebApp.showAlert("Hey there!");
};
