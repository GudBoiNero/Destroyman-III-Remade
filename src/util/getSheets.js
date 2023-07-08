"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getData = exports.getSheet = void 0;
const fs_1 = __importDefault(require("fs"));
function getSheet(name) {
    const data = fs_1.default.readFileSync('res/latest.data.json', { encoding: 'utf8', flag: 'r' });
    const sheet = JSON.parse(data)["sheets"][name];
    return sheet;
}
exports.getSheet = getSheet;
function getData(name) {
    const data = fs_1.default.readFileSync('res/latest.data.json', { encoding: 'utf8', flag: 'r' });
    const sheet = JSON.parse(data)["data"][name];
    return sheet;
}
exports.getData = getData;
