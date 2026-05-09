import { Parser } from "./parser.js";
import * as λ from "./lambda.js"; 

export class App {

    constructor(tbd) {
        this.p = new Parser();
        this.expr = null;
    }

    initUi() {
        var self = this;
        window.expr = null; 
        this.inp = document.getElementById('usrInput');
        this.out = document.getElementById('txtOutput');
        this.err = document.getElementById('txtErr');
        this.inp.addEventListener("input", () => self.onInput())
        //this.inp.addEventListener(, () => self.onInput())
        document.getElementById('btnReduce')
            .addEventListener('click', () => self.reduce())
    }

    onInput() {
        let pos = this.inp.selectionstart;
        this.inp.value = this.inp.value.replace(/l|L/, "\u03BB")
        this.inp.selectionstart = pos;
        if (this.inp.value) {
            this.expr = this.parse(this.inp.value);
            this.out.innerHTML = this.expr+"";
        }
    }

    reduce() {
        if (this.expr == null)
            return;

        let fun = this.expr.findFunc();
        if (fun) {
            fun[0].reduce();
            this.out.innerHTML = this.expr+"";
        }
    }

    parse(str) {
        try {
            this.expr = this.p.doParse(str)
            this.err.innerHTML = "";
            this.err.classList.add("noerr");
            return this.expr;
        }
        catch (e) {
            this.expr = null;
            this.err.classList.remove("noerr");
            this.err.innerHTML = e;
            console.warn(e);
        }
    }
}