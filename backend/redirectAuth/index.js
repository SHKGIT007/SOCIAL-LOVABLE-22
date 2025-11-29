module.exports = function (app) {
    require("./facebook/facbook")(app);
    require("./instagram/instagram")(app);
    require("./google/google")(app);
}