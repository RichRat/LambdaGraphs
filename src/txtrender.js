import { LVal, LFunc, LApply, LRoot } from "./lambda.js"


var ce = document.createElement;
var ct = document.createTextNode;
function ceText(tag, s) {
    let ret = ce(tag)
    ret.innerText = s;
    return ret;
}


class TextRenderer {

    constructor() {}

    renderExpression(expr, elem) {
        if (expr instanceof LRoot)
            expr = expr.e;

        if (!elem)
            elem = ce('p');

        this.render(expr, elem)
        return elem
    }

    render(expr) {
        let elem = null;
        switch (typeof expr) {
            case 'LVal':
                elem = ceText('span', expr.e);
                break;
            case 'LFunc':
                elem = this.appends(
                    ce("span"),
                    ct('λ'),
                    this.render(expr.param),
                    ct('.'),
                    this.render(expr.body, body)
                );
                break;
            case 'LApply':
                elem = this.appends(
                    ce("span"),
                    this.render(expr.left),
                    this.render(expr.right)
                );
            default:
                throw "render err unknown type " + typeof expr;
        }

        if (expr.reqBrackets()){
            elem.prependChild(ct('('))
            elem.appendChild(ct(')'))
        }

        elem.classList.add(typeof expr);
    }

    appends() {
        if (arguments.length < 1)
            throw "render err no appends";

        let node = arguments[0];
        for (let i = 1; i < arguments.length; i++)
            node.appendChild(arguments[i]);
        
        return node;
    }
}

