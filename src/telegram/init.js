import WebApp from "@twa-dev/sdk";

export const initTelegramApp = () => {
    WebApp.enableClosingConfirmation();
    WebApp.setHeaderColor("#222222");
    WebApp.setBackgroundColor("#ffffff");

    // Ready event
    WebApp.ready();
};

export const getUserData = () => {
    // Debug uchun
    console.log("WebApp.initDataUnsafe:", WebApp.initDataUnsafe);
    console.log("WebApp.initDataUnsafe?.user:", WebApp.initDataUnsafe?.user);
    
    const user = WebApp.initDataUnsafe?.user;
    
    if (user) {
        console.log("User ID:", user.id);
        console.log("User object:", JSON.stringify(user, null, 2));
    } else {
        console.warn("Telegram user data topilmadi!");
        // Alternativ usul - initData orqali
        if (WebApp.initData) {
            console.log("Trying to parse initData:", WebApp.initData);
        }
    }
    
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
