import { LVal, LFunc, LApply, LRoot } from "./lambda.js"

var lambda = "λ";

export class Parser {

    doParse(str) {
        str = str.replaceAll('L', "λ").replaceAll(/\s+/g, "");
        let root = new LRoot(this.parse(str));
        this.unboundVars = []
        root.findUnbound(this.unboundVars);
        if (this.unboundVars.length > 0)
            throw "unbound variables found " + this.unboundVars;

        return root;
    }

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
        let params = str.match(/[^.]+(?=\.)/)[0]
        if (!/[A-Za-z]+/.test(params))
            throw "Invalid char for function parameter (missing shorthand replacement?) [A-Za-z] required!"
        if (str[params.length] != '.')
            throw "Dot needs to follow a function parameter!"
        if (str.length <= params.length + 1)
            throw "no function body present, an expression needs to follow the dot!"

        let body = this.parse(str.substr(params.length + 1));
        // wrap parameters in functions with the last parameter being the innermost
        let outfnc = new LFunc(new LVal(params[params.length - 1]), body)
        for (let i = params.length - 2; i >= 0; i--) {
            outfnc = new LFunc(new LVal(params[i]), outfnc)
        }

        return outfnc;
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