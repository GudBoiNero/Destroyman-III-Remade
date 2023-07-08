const { consoleColors } = require("./consoleColors")
const { replaceAll } = require('./replaceAll')

const SEPERATOR = ';'


class Token {
    /**
     * @param {String} property 
     */
    constructor(property) {
        this.property = property
    }
    property = ''
}

class NumberToken extends Token {
    /**
     * @param {String} property 
     * @param {Number} value 
     */
    constructor(property, value) {
        super(property)

        this.value = value
    }
    value = 0
}

class RangeToken extends Token {
    /**
     * @param {String} property 
     * @param {Number} min 
     * @param {Number} max 
     */
    constructor(property, min, max) {
        super(property)

        this.min = min
        this.max = max
    }

    min = 0
    max = 0
}

class StringToken extends Token {
    /**
     * @param {String} property 
     * @param {String} value 
     */
    constructor(property, value) {
        super(property)

        this.value = value
    }

    value = ''
}

module.exports = {
    /**
     * 
     * @param {String} query 
     */
    tokenize(query) {
        let res = {
            err: null,
            tokens: []
        }
        const statements = query.split(SEPERATOR).filter(val => val != '')

        console.log(consoleColors.FG_GREEN + 'Query: ' + consoleColors.FG_MAGENTA + query + consoleColors.RESET)

        query = replaceAll(query, ' ', '')

        statements.forEach(stmt => {
            let token = Token
            let property
            let value

            try {
                // get 'agi' from 'agi=1:100'
                property = new RegExp(/([\w]*)=/).exec(stmt)[1]
                // get '1:100' from 'agi=1:100', '20' from 'str=20', or '1+' from 'mtl=1+'
                value = new RegExp(/=(\w*.?[\w]*)/).exec(stmt)[1]
            } catch (error) {
                res.err = error
                res.tokens = []
                return error
            }

            // Handle single number
            // Regex tests if the string is only numbers
            if (new RegExp(/^\d+$/).test(value) == true) {
                token = new NumberToken(property, parseInt(value))
            }
            // Handle greater than or lesser thans -> 
            // ex. 5+
            // ex. -50
            // ex. +25
            else if ((value.startsWith('-') || value.startsWith('+')) || (value.endsWith('-') || value.endsWith('+'))) {
                let min = 0, max = 100
                if (value.startsWith('+')) {
                    let num = value.slice(0)
                    min = parseInt(num)
                    max = 100
                } else if (value.startsWith('-')) {
                    let num = value.slice(0)
                    max = parseInt(num)
                    min = 0
                } else if (value.endsWith('+')) {
                    min = parseInt(value)
                    max = 100
                } else if (value.endsWith('-')) {
                    max = parseInt(value)
                    min = 0
                }
                token = new RangeToken(property, min, max)
            }
            else if (new RegExp(/^[^0-9]+$/).test(value)) {
                token = new StringToken(property, value)
            }
            // Handle range -> ex. 5:100
            else {
                let lHand = new RegExp(/([\d]*):/).exec(value)
                let rHand = new RegExp(/:([\d]*)/).exec(value)

                try {
                    lHand = lHand[1]
                    rHand = rHand[1]
                } catch { }

                token = new RangeToken(property, parseInt(lHand), parseInt(rHand))
            }

            res.tokens.push(token)
        })

        return res
    }
}  