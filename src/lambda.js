
var LambdaForceBrackets = false;

/**  
 * root element of a lambda expression. 
 * mostly there to avoid this.parent being null in the lambda logic
 */
export class LRoot {
    constructor(e) { 
        this.e = e; 
        this.e.parent = this;
    }

    findFunc() { return this.e.findFunc(); }
    clone() { return new LRoot(this.e.clone()); }
    toString() { return this.e.toString(); }
    replace(old, expr) { return this.e = expr; }
    findUnbound(outlist) { return this.e.findUnbound([], outlist); }
    setForceBrackets(b) { LambdaForceBrackets = b }
    reqBrackets() { return false }
}

/** 
 * single letter in a lambda expression 
 */
export class LVal {
    constructor(e) { this.e = e }
    findFunc() { return []; }
    clone() { return new LVal(this.e); }
    toString() { return this.e; }
    reqBrackets() { return false }

    findUnbound(bound, outlist) {
        if (!bound.includes(this.e))
            outlist.push(this);
    }
}

/** 
 * represents a lambda function λf.E 
 */
export class LFunc {

    constructor(param ,body) {
        this.param = param;
        this.body = body;
        body.parent = this;
    }

    /**
     * find a function node for β reduction
     * @returns LFunc instance
     */
    findFunc() {
        return typeof this.parent == LApply && this.parent.left === this ? [ this ] : [];
    }

    /**
     * β reduction, use this on the node found through findFunc
     * @param {boolean} info if true will not reduce but return an object 
     *  containing relevant nodes for animation and highlighting purposes 
     * @returns relevant nodes for animations when info is true otherwise nothing
     * @note this call will alter the data structure (info == false)
     */
    reduce(info) {
        if (this.parent.left !== this)
            throw "cannot reduce function no apply ((λx.E)a) required"

        var value = this.parent.right;
        var refs = this.findRef();
        if (info)
            return { refs: refs, value: value }
        
        for (let ref in refs)
            ref.substitute(value);

        // note: parent is an LApply and its parent will either be any other node or LRoot
        this.parent.parent.replace(this.body);
    }

    /**
     * finds all locations that the function parameter is referenced within the function body
     * @param {LVal} param function parameter 
     * @param {Array} outlist found references are added to this array
     */
    findRef(param, outlist) {
        if (this.body.e == param.e)
            outlist.push(new NodeRef(this, "body"));
        else
            this.body.findRef(param, outlist);
    }

    findUnbound(bound, outlist) {
        this.body.findUnbound(bound.concat([this.param.e]), outlist);
    }

    replace(old, expr)  { return this.body = expr;}
    clone() { return new LFunc(this.param.clone(), this.body.clone())}
    reqBrackets() { return this.parent.left === this }

    toString() { 
        let s = 'λ' + this.param + "." + this.body;
        if (this.reqBrackets() || LambdaForceBrackets)
            return '(' + s + ')';
        
        return s;
    }

    
}

/** 
 * represents (ab)  
 */
export class LApply {

    constructor(a, b) {
        this.left = a;
        this.right = b;
        this.left.parent = this;
        this.right.parent = this;
    }

    findFunc() {
        return this.left.findFunc().concat(this.right.findFunc());
    }

    findRef(param, outlist) {
        this.findRefSub(param, outlist, "left");
        this.findRefSub(param, outlist, "right");
    }

    findRefSub(param, outlist, side) {
        if (this[side].e == param.e)
            outlist.push(new NodeRef(this, side));
        else
            this[side].findRef(param, outlist);
    }

    replace(old, expr) {
        if (this.left === old)
            this.left = expr;
        else
            this.right = expr;
    }

    findUnbound(bound, outlist) {
        this.left.findUnbound(bound, outlist);
        this.right.findUnbound(bound, outlist);
    }

    clone() { return new LApply(a.clone(), b.clone()); }
    reqBrackets() { return this.parent.right === this }


    toString() {
        let s = this.left + this.right;
        if (this.parent.e === this) 
            return s;

        if (this.parent.right === this || LambdaForceBrackets)
            return '(' + s + ')';

        return s;

    }

    genHtml(hl) {

    }
}

/** references a node and a parameter that is going to replaced by beta reduction */
export class NodeRef {
    constructor(node, strProperty) {
        this.node = node;
        this.prop = strProperty;
    }

    substitute(expression) {
        this.node[this.prop] = expression.clone();
    }
}

function span(content, cls) {    
    if (cls)
        return `<span class="${cls}">${content}</span>`;
    else
        return `<span>${content}</span>`;
}

class HLReg {
    
}