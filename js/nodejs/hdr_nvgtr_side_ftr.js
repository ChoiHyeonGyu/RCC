var fs = require('fs');
var ejs = require('ejs');

var import_default = '';
var logo = '';
var main_header = '';
var navigator = '';
var navigator_side = '';
var footer = '';
var loading = '';
var contentsSideNav = '';

fs.readFile("header/import_default.html", "utf-8", function(error, data) {
    import_default = data;
});
fs.readFile("header/logo.html", "utf-8", function(error, data) {
    logo = data;
});
fs.readFile("header/main_header.html", "utf-8", function(error, data) {
    main_header = data;
});
fs.readFile("header/navigator.html", "utf-8", function(error, data) {
    navigator = data;
});
fs.readFile("header/navigator_side.html", "utf-8", function(error, data) {
    navigator_side = data;
});
fs.readFile("footer.html", "utf-8", function(error, data) {
    footer = data;
});
fs.readFile("header/loading.html", "utf-8", function(error, data) {
    loading = data;
});
fs.readFile("header/contentsSideNav.html", "utf-8", function(error, data) {
    contentsSideNav = data;
});

function getImport_default(){
    return import_default;
}
function getLogo(){
    return logo;
}
function getMain_header(user){
    return ejs.render(main_header, { user: user });
}
function getNavigator(){
    return navigator;
}
function getNavigator_side(){
    return navigator_side;
}
function getFooter(){
    return footer;
}
function getLoading(){
    return loading;
}
function getContentsSideNav(){
    return contentsSideNav;
}

module.exports = {
    import_default: getImport_default,
    logo: getLogo,
    main_header: getMain_header,
    navigator: getNavigator,
    navigator_side: getNavigator_side,
    footer: getFooter,
    loading: getLoading,
    contentsSideNav: getContentsSideNav
};