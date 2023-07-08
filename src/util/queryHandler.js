"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringToken = exports.RangeToken = exports.NumberToken = exports.Token = void 0;
const consoleColors_1 = __importDefault(require("./consoleColors"));
const replaceAll_1 = require("./replaceAll");
const SEPERATOR = ";";
class Token {
    /**
     * @param {String} property
     */
    constructor(property = "") {
        this.property = "";
        this.property = property;
    }
}
exports.Token = Token;
class NumberToken extends Token {
    /**
     * @param {String} property
     * @param {Number} value
     */
    constructor(property, value) {
        super(property);
        this.value = 0;
        this.value = value;
    }
}
exports.NumberToken = NumberToken;
class RangeToken extends Token {
    /**
     * @param {String} property
     * @param {Number} min
     * @param {Number} max
     */
    constructor(property, min, max) {
        super(property);
        this.min = 0;
        this.max = 0;
        this.min = min;
        this.max = max;
    }
}
exports.RangeToken = RangeToken;
class StringToken extends Token {
    /**
     * @param {String} property
     * @param {String} value
     */
    constructor(property, value) {
        super(property);
        this.value = "";
        this.value = value;
    }
}
exports.StringToken = StringToken;
function tokenize(query) {
    let err = "";
    let tokens = [];
    const statements = query.split(SEPERATOR).filter((val) => val != "");
    console.log(consoleColors_1.default.FG_GREEN +
        "Query: " +
        consoleColors_1.default.FG_MAGENTA +
        query +
        consoleColors_1.default.RESET);
    query = (0, replaceAll_1.replaceAll)(query, " ", "");
    statements.forEach((stmt) => {
        var _a, _b;
        let token = new Token();
        let property;
        let value;
        try {
            // get 'agi' from 'agi=1:100'
            property = new RegExp(/([\w]*)=/).exec(stmt)[1];
            // get '1:100' from 'agi=1:100', '20' from 'str=20', or '1+' from 'mtl=1+'
            value = new RegExp(/=(\w*.?[\w]*)/).exec(stmt)[1];
        }
        catch (error) {
            err = error;
            tokens = [];
            return {
                err: err,
                tokens: tokens
            };
        }
        // Handle single number
        // Regex tests if the string is only numbers
        if (new RegExp(/^\d+$/).test(value) == true) {
            token = new NumberToken(property, parseInt(value));
        }
        // Handle greater than or lesser thans ->
        // ex. 5+
        // ex. -50
        // ex. +25
        else if (value.startsWith("-") ||
            value.startsWith("+") ||
            value.endsWith("-") ||
            value.endsWith("+")) {
            let min = 0, max = 100;
            if (value.startsWith("+") || value.endsWith("+")) {
                let num = value.slice(0);
                min = parseInt(num);
                max = 100;
            }
            else if (value.startsWith("-") || value.endsWith("-")) {
                let num = value.slice(0);
                max = parseInt(num);
                min = 0;
            }
            token = new RangeToken(property, min, max);
        }
        else if (new RegExp(/^[^0-9]+$/).test(value)) {
            token = new StringToken(property, value);
        }
        // Handle range -> ex. 5:100
        else {
            let lHand = (_a = new RegExp(/([\d]*):/).exec(value)) === null || _a === void 0 ? void 0 : _a[1];
            let rHand = (_b = new RegExp(/:([\d]*)/).exec(value)) === null || _b === void 0 ? void 0 : _b[1];
            console.log(lHand, rHand);
            if (lHand && rHand) {
                token = new RangeToken(property, parseInt(lHand), parseInt(rHand));
            }
        }
        if (token) {
            tokens.push(token);
        }
    });
    return {
        err: err,
        tokens: tokens
    };
}
exports.default = tokenize;
