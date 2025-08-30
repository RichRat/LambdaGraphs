

var lambda = "λ";

export class Parser {
    parse(str) {
        let elems = [];

        for (let i = 0; i < str.length; i++) {
            if (str[i] == '(') {
                let o = this.extractBracket(str);
                elems.push(o.body);
                i = o.continue - 1;
            }
            else if (str[i] == lambda) {
                elems.push(this.parseFun(str.substr(i + 1)))
                break;
            }
            else if (/[A-Za-z]/.test(str[i])) {
                elems.push(new LVal(str[i]))
            }
            else
                throw "unsupported sign " + str[i] + " at " + i;
        }

        if (!elems)
            throw "empty statement err";

        var ret = elems[0];
        if (elems.length > 1) {
            for (let i = 1;  i < elems.length; i++)
                ret = new LApply(ret, elems[i]);
        }

        return ret;
    }

    parseFun(str) {
        if (!/[A-Za-z]/.test(str[0]))
            throw "Invalid char for function parameter (missing shorthand replacement?) [A-Za-z] required!"
        if (str[1] != '.')
            throw "Dot needs to follow a function parameter!"
        if (str.length <= 2)
            throw "no function body present, an expression needs to follow the dot!"

        return new LFunc(new LVal(str[0]), this.parse(str.substr(2)))
    }

    extractBracket(str) {
        let count = 0;
        for (let i = 1; i < str.length; i++) {
            let c = str[i];
            if (c == '(') count++;
            else if (c == ')') {
                if (count == 0) {
                    return {
                        body: this.parse(str.substring(1, i)),
                        continue: i + 1
                    };
                }
                count--;
            }
        }
        throw "parsing error no end bracket";
    }
}

class LVal {
    constructor(body) {
        this.body = body;
    }

    toString() {
        return this.body;
    }

    findFunc() {
        return false;
    }

    clone() {
        return new LVal(this.body);
    }
}

class LFunc {

    constructor(param ,body) {
        this.param = param;
        this.body = body;    
    }

    toString() {
        return '(' + lambda + this.param + "." + this.body + ')';
    }

    findFunc() {
        return this;
    }

    clone() {
        return new LFunc(param.clone(), this.body.clone())
    }
}

class LApply {
    constructor(a, b) {
        this.left = a;
        this.right = b;
    }

    findFunc() {
        // maybe random in the future wich one is tried first and depth first
        let ret = this.left.findFunc() || this.right.findFunc();
        return typeof ret == LFunc ?  this : ret;
    }

    clone() {
        return new LApply(a.clone(), b.clone());
    }

    toString() {
        return '(' + this.left + this.right + ')';
    }
}