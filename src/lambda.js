
/**  
 * root element of a lambda expression. 
 * mostly there to avoid this.parent being null in the lambda logic
 */
export class LRoot {
    constructor(expression) { 
        this.e = expression; 
        this.e.parent = this;
    }

    findFunc =  () =>  this.e.findFunc();
    clone =     () => new LRoot(this.e.clone());
    toString =  () => this.e.toString();
    replace =   (old, expr) => this.e = expr;
}

/** single letter in a lambda expression */
export class LVal {
    constructor(e) { this.e }
    findFunc =  () => null;
    clone =     () => new LVal(this.body);
    toString =  () => this.body;
}

/** represents a lambda function λf.E */
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
        return typeof this.parent == LApply && this.parent.left === this ? this : null;
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

    findRef(param, outlist) {
        if (this.body.e == param.e)
            outlist.push(new NodeRef(this, "body"));
        else
            this.body.findRef(param, outlist);
    }

    replace = (old, expr) => this.body = expr;
    clone = () => new LFunc(this.param.clone(), this.body.clone())
    toString = () =>  '(' + lambda + this.param + "." + this.body + ')';
}

/** represents (ab)  */
export class LApply {

    constructor(a, b) {
        this.left = a;
        this.right = b;
        this.left.parent = this;
        this.right.parent = this;
    }

    findFunc() {
        // TODO collect all viable functions in a list
        return this.left.findFunc() || this.right.findFunc();
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

    clone = () => new LApply(a.clone(), b.clone());
    toString = () => '(' + this.left + this.right + ')';
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