var fs = require('fs');

var import_default = '';
var logo = '';
var main_header = '';
var navigator = '';
var navigator_side = '';
var footer = '';
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
fs.readFile("header/contentsSideNav.html", "utf-8", function(error, data) {
    contentsSideNav = data;
});