import consoleColors from "./consoleColors";
import { replaceAll } from "./replaceAll";

const SEPERATOR = ";";

export class Token {
    property: string;
    constructor(property: string = "") {
        this.property = property;
    }
}

export class NumberToken extends Token {
    value: number;
    constructor(property: string, value: number) {
        super(property);
        this.value = value;
    }
}

export class RangeToken extends Token {
    min: number;
    max: number;
    constructor(property: string, min: number, max: number) {
        super(property);
        this.min = min;
        this.max = max;
    }
}

export class StringToken extends Token {
    value: string;
    constructor(property: string, value: string) {
        super(property);
        this.value = value;
    }
}

export default function tokenize(query: string) {
    let stack: string[] = []
    let tokens: Token[] = []
    const statements = query.split(SEPERATOR).filter((val) => val != "");

    /**console.log(
        consoleColors.FG_GREEN +
        "Query: " +
        consoleColors.FG_MAGENTA +
        query +
        consoleColors.RESET
    );*/

    query = replaceAll(query, " ", "");

    statements.forEach((stmt) => {
        let token = new Token();
        let property: string;
        let value: string;

        try {
            // get 'agi' from 'agi=1:100'
            property = stmt.split("=")[0];
            // get '1:100' from 'agi=1:100', '20' from 'str=20', or '1+' from 'mtl=1+'
            value = stmt.split("=")[1];

            // Handle single number
            // Regex tests if the string is only numbers
            if (new RegExp(/^[\d]+$/).test(value)) {
                token = new NumberToken(property, parseFloat(value));
            }
            // Handle greater than or lesser thans ->
            // ex. 5+
            // ex. -50
            // ex. +25
            else if (
                value.endsWith("-") ||
                value.endsWith("+")
            ) {
                let min: number = 0,
                    max: number = 100;
                if (value.endsWith("+")) {
                    let num = value.slice(0);
                    min = parseFloat(value);
                    max = 100;
                } else if (value.endsWith("-")) {
                    max = parseFloat(value);
                    min = 0;
                }
                token = new RangeToken(property, min, max);
            } // Handle ranges - 0:100 
            else if (value.includes(':')) {
                let lHand = value.split(':')?.[0];
                let rHand = value.split(':')?.[1];

                if (lHand && rHand) {
                    token = new RangeToken(property, parseFloat(lHand), parseFloat(rHand));
                }
            } else {
                token = new StringToken(property, value);
            }

            if (token) {
                tokens.push(token);
            }
        } catch (error) {
            stack.push(error as string);
            tokens = [];
        }
    });
    
    return {
        err: stack,
        tokens: tokens
    };
}
