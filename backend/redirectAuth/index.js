module.exports = function (app) {
    require("./facebook/facbook")(app);
    require("./instagram/instagram")(app);
    require("../SocialLogin/google")(app);
    require("../SocialLogin/facebook")(app);
}
