// single letter in a lambda expression
export class LVal {
    constructor(name) {
        this.name = name;
    }

    findFunc = () => false;

    clone = () => new LVal(this.body);

    toString = () => this.body;
}

// represents a lambda function λf.E
export class LFunc {

    constructor(param ,body) {
        this.param = param;
        this.body = body;
        body.parent = this; 
    }

    findFunc = () => typeof parent == LApply ? this : null;

    findRef(param, outlist) {
        if (this.body.name == param.name) {
            outlist.push(new NodeRef(this, "body"));
        }
        else
            this.body.findRef(param, outlist);
    }

    clone = () => new LFunc(param.clone(), this.body.clone())
    
    toString = () =>  '(' + lambda + this.param + "." + this.body + ')';
}


export class LApply {
    constructor(a, b) {
        this.left = a;
        this.right = b;
        this.left.parent = this;
        this.right.parent = this;
    }

    findFunc() {
        // maybe random in the future wich one is tried first and depth first
        let ret = this.left.findFunc() || this.right.findFunc();
        return typeof ret == LFunc ?  this : ret;
    }

    findRef(param, outlist) {
        this.findRefSub(param, outlist, "left");
        this.findRefSub(param, outlist, "right");
    }

    findRefSub(param, outlist, side) {
        if (this[side].name == param.name)
            outlist.push(new NodeRef(this, side));
        else
            this[side].findRef(param, outlist);
    }

    clone = () => new LApply(a.clone(), b.clone());

    toString = () => '(' + this.left + this.right + ')';
}

//references a parent node and a parameter that is going to replaced by beta reduction
export class NodeRef {
    constructor(node, strProperty) {
        this.node = node;
        this.prop = strProperty;
    }
}