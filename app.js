import { Parser } from "./parser.js";


export class App {
    constructor(tbd) {
        this.p = new Parser();
    }

    doParse(str) {
        return this.p.parse(str.replaceAll('L', "λ"))
    }
}