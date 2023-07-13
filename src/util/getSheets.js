"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExtraData = exports.getSheet = void 0;
const fs_1 = __importDefault(require("fs"));
const config_json_1 = require("../../config.json");
function getSheet(name) {
    const data = fs_1.default.readFileSync(config_json_1.DATA_PATH, { encoding: 'utf8', flag: 'r' });
    const sheet = JSON.parse(data)["sheets"][name];
    return sheet;
}
exports.getSheet = getSheet;
function getExtraData() {
    const data = fs_1.default.readFileSync(config_json_1.DATA_PATH, { encoding: 'utf8', flag: 'r' });
    return JSON.parse(data)["data"];
}
exports.getExtraData = getExtraData;
