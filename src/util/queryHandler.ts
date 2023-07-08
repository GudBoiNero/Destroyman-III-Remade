import consoleColors from "./consoleColors";
import { replaceAll, replaceAllInList } from "./replaceAll";

const SEPERATOR = ";";

export class Token {
    /**
     * @param {String} property
     */
    constructor(property = "") {
        this.property = property;
    }
    property = "";
}

export class NumberToken extends Token {
    /**
     * @param {String} property
     * @param {Number} value
     */
    constructor(property, value) {
        super(property);

        this.value = value;
    }
    value = 0;
}

export class RangeToken extends Token {
    /**
     * @param {String} property
     * @param {Number} min
     * @param {Number} max
     */
    constructor(property, min, max) {
        super(property);

        this.min = min;
        this.max = max;
    }

    min = 0;
    max = 0;
}

export class StringToken extends Token {
    /**
     * @param {String} property
     * @param {String} value
     */
    constructor(property, value) {
        super(property);

        this.value = value;
    }

    value = "";
}

export default function tokenize(query: string) {
    let err: string = ""
    let tokens: Token[] = []
    const statements = query.split(SEPERATOR).filter((val) => val != "");

    console.log(
        consoleColors.FG_GREEN +
        "Query: " +
        consoleColors.FG_MAGENTA +
        query +
        consoleColors.RESET
    );

    query = replaceAll(query, " ", "");

    statements.forEach((stmt) => {
        let token = new Token();
        let property: any;
        let value: any;

        try {
            // get 'agi' from 'agi=1:100'
            property = (new RegExp(/([\w]*)=/).exec(stmt) as RegExpExecArray)[1];
            // get '1:100' from 'agi=1:100', '20' from 'str=20', or '1+' from 'mtl=1+'
            value = (new RegExp(/=(\w*.?[\w]*)/).exec(stmt) as RegExpExecArray)[1];
        } catch (error) {
            err = error as string;
            tokens = [];
            return error;
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
        else if (
            value.startsWith("-") ||
            value.startsWith("+") ||
            value.endsWith("-") ||
            value.endsWith("+")
        ) {
            let min = 0,
                max = 100;
            if (value.startsWith("+")) {
                let num = value.slice(0);
                min = parseInt(num);
                max = 100;
            } else if (value.startsWith("-")) {
                let num = value.slice(0);
                max = parseInt(num);
                min = 0;
            } else if (value.endsWith("+")) {
                min = parseInt(value);
                max = 100;
            } else if (value.endsWith("-")) {
                max = parseInt(value);
                min = 0;
            }
            token = new RangeToken(property, min, max);
        } else if (new RegExp(/^[^0-9]+$/).test(value)) {
            token = new StringToken(property, value);
        }
        // Handle range -> ex. 5:100
        else {
            let lHand = new RegExp(/([\d]*):/).exec(value)?.[0];
            let rHand = new RegExp(/:([\d]*)/).exec(value)?.[0];

            if (lHand && rHand) {
                token = new RangeToken(property, parseInt(lHand), parseInt(rHand));
            }
        }

        console.log(token)

        if (token) {
            tokens.push(token);
        }
    });

    return {
        err: err,
        tokens: tokens
    };
}
