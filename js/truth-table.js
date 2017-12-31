// ¬p
const not = p => !p

// p ∧ q
const and = (p, q) => p && q

// p ∨ q
const or = (p, q) => p || q

// ¬p ∨ q
const implication = (p, q) => or(not(p), q)

// (p ∧ q) ∨ (¬p ∧ ¬q)
const equality = (p, q) => or(and(p, q), and(not(p), not(q)))

// (p ∧ ¬q) ∨ (¬p ∧ q)
const xor = (p, q) => or(and(p, not(q)), and(not(p), q))

//  p ↑ q
const nand = (p, q) => not(and(p, q))

// p ↓ q
const nor = (p, q) => not(or(p, q))

const symbols = {
    '¬': not,
    '~': not,
    '∧': and,
    '&': and,
    '.': and,
    '∨': or,
    '+': or,
    '⇒': implication,
    '→': implication,
    '↔': equality,
    '=': equality,
    '≡': equality,
    '⊕': xor,
    '≠': xor,
    '↑': nand,
    '|': nand,
    '↓': nor
}

const isVar = c => ( ( c >= 'A' && c <= 'Z' ) || ( c >= 'a' && c <= 'z' ) )

const isFunc = c => c in symbols

const createMatrix = (n, m) => {
    const out = new Array(n)

    for(let i = 0; i < n; i++) {
        out[i] = new Array(m)
    }

    return out
}

const createTable = (n, order) => {
    const len = Math.pow(2, n)
    const matrix = createMatrix(len, n)

    let pivot = len

    for(let i = 0; i < n; i++) {
        let acc = 0
        let val = order

        pivot = pivot / 2

        for(let j = 0; j < len; j++) {

            if ( acc === pivot ) {
                val = ! val
                acc = 0
            }

            matrix[j][i] = val
            acc++
        }
    }

    return matrix
}

const parse = (str, vars = [], offset = 0) => {
    let out = []
    let val, i

    for(i = offset; i < str.length; i++) {
        const c = str[i]

        if ( c === '(' ) {
            [val, vars, i] = parse(str, vars, i + 1)
        }
        else if ( c === ')' ) {
            break
        }
        else if ( isVar(c) ) {
            val = c

            if ( ! vars.includes(c) ) {
                vars.push(c)
            }
        }
        else if ( isFunc(c) ) {
            val = c
        }
        else if ( c === ' ' ) {
	        continue
        }
        else {
        	throw new SyntaxError(`Invalid character '${c}'`)
        }

        out.push(val)
    }

    return [out, vars, i]
}

const checkMatchingParentheses = str => {
    let open = 0
    let close = 0

    for(let i = 0; i < str.length; i++) {
        const c = str[i]

        if ( c === '(' ) {
            open++
        }
        else if ( c === ')' ) {
            close++
        }
    }

    if ( open !== close ) {
	    throw new SyntaxError('Number of parentheses does not match')
    }
}

const bindValues = (names, values) => {
    const out = {}

    for(let i = 0; i < names.length; i++) {
        out[names[i]] = values[i]
    }

    return out
}

const groupExpression = (exp) => {
    const first = exp.slice(0, 3)
    const tail = exp.slice(3)
    const out = [ first ].concat(tail)

    return ( out.length > 1 )
        ? groupExpression(out)
        : out
}

const solve = (exp, values) => {

    const len = exp.length

	if ( len === 0 ) {
    	throw new SyntaxError('Empty expression')
	}
    else if ( len === 1 ) {
        if ( exp instanceof Array ) {
	        return solve(exp[0], values)
        }
        else if ( exp in values ) {
        	return values[exp]
        }
        else {
        	throw new SyntaxError(`Unexpected '${exp}' in expression`)
        }
    }
    else if ( len === 2 ) {
        const [ symbol, p ] = exp
        const func = symbols[symbol]

        if ( func !== not ) {
            throw new SyntaxError(`Could not solve pair <${symbol}> <${p}>`)
        }

        return not(p)
    }
    else if ( len === 3 ) {
        const [ p, symbol, q ] = exp

		if ( ! isFunc(symbol) ) {
        	throw new SyntaxError(`Invalid function '${symbol}'`)
		}

        const func = symbols[symbol]

        return func(solve(p, values), solve(q, values))
    }
    else {
        return solve(groupExpression(exp), values)
    }

}