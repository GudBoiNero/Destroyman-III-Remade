"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceAllInList = exports.replaceAll = void 0;
function replaceAll(string, searchString, replaceString) {
    // While string has searchValue- call String.replace
    while (string.includes(searchString)) {
        string = string.replace(searchString, replaceString);
    }
    return string;
}
exports.replaceAll = replaceAll;
function replaceAllInList(string, searchList, replaceString) {
    // For all in searchList replaceAll
    for (let index = 0, length = searchList.length; index < length; index++) {
        string = module.exports.replaceAll(string, searchList[index], replaceString);
    }
    return string;
}
exports.replaceAllInList = replaceAllInList;
