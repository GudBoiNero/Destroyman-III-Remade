"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringToken = exports.RangeToken = exports.NumberToken = exports.Token = void 0;
const replaceAll_1 = require("./replaceAll");
const SEPERATOR = ";";
class Token {
    constructor(property = "") {
        this.property = property;
    }
}
exports.Token = Token;
class NumberToken extends Token {
    constructor(property, value) {
        super(property);
        this.value = value;
    }
}
exports.NumberToken = NumberToken;
class RangeToken extends Token {
    constructor(property, min, max) {
        super(property);
        this.min = min;
        this.max = max;
    }
}
exports.RangeToken = RangeToken;
class StringToken extends Token {
    constructor(property, value) {
        super(property);
        this.value = value;
    }
}
exports.StringToken = StringToken;
function tokenize(query) {
    let stack = [];
    let tokens = [];
    const statements = query.split(SEPERATOR).filter((val) => val != "");
    /**console.log(
        consoleColors.FG_GREEN +
        "Query: " +
        consoleColors.FG_MAGENTA +
        query +
        consoleColors.RESET
    );*/
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
            // Handle single number
            // Regex tests if the string is only numbers
            if (new RegExp(/^\d+$/).test(value) == true) {
                token = new NumberToken(property, parseFloat(value));
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
                const exp = new RegExp(/\d*\.?\d/).exec(value);
                console.log(exp);
                if (value.startsWith("+") || value.endsWith("+")) {
                    min = parseFloat(exp === null || exp === void 0 ? void 0 : exp[1]) || min;
                    max = 100;
                }
                else if (value.startsWith("-") || value.endsWith("-")) {
                    max = parseFloat(exp === null || exp === void 0 ? void 0 : exp[1]) || max;
                    min = 0;
                }
                token = new RangeToken(property, min, max);
            }
            else if (new RegExp(/[\d*\.?\d]+/).test(value)) {
                token = new StringToken(property, value);
            }
            // Handle range -> ex. 5:100
            else {
                let lHand = (_a = new RegExp(/(\d*\.?\d):/).exec(value)) === null || _a === void 0 ? void 0 : _a[1];
                let rHand = (_b = new RegExp(/:(\d*\.?\d)/).exec(value)) === null || _b === void 0 ? void 0 : _b[1];
                if (lHand && rHand) {
                    token = new RangeToken(property, parseFloat(lHand), parseFloat(rHand));
                }
            }
            if (token) {
                tokens.push(token);
            }
        }
        catch (error) {
            stack.push(error);
            tokens = [];
        }
    });
    return {
        err: stack,
        tokens: tokens
    };
}
exports.default = tokenize;
