export const initAuth = () => {
    //const CLIENT_ID = process.env.OAUTH_CLIENT_ID;
    const CLIENT_ID =
        "249961649717-9pe5tkj6tjb9s50fvtcooi9vg8rmrud0.apps.googleusercontent.com";
    return window.gapi.auth2.init({
        client_id: CLIENT_ID,
        scope: "https://www.googleapis.com/auth/analytics.readonly",
    });
};

export const checkSignedIn = () => {
    return new Promise((resolve, reject) => {
        initAuth() //calls the previous function
            .then(() => {
                const auth = window.gapi.auth2.getAuthInstance(); //returns the GoogleAuth object
                resolve(auth.isSignedIn.get()); //returns whether the current user is currently signed in
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const renderButton = () => {
    window.gapi.signin2.render("signin-button", {
        scope: "profile email",
        width: 240,
        height: 50,
        longtitle: true,
        theme: "dark",
        onsuccess: onSuccess,
        onfailure: onFailure,
    });
};

export const onSuccess = (googleUser) => {
    console.log("Logged in as: " + googleUser.getBasicProfile().getName());
};

export const onFailure = (error) => {
    console.error(error);
};
