import { homework } from "./homework.js"
import { practiceOnePoint } from "./practice1.js"
import { practiceTwoPoints } from "./practice2.js"
import 'dotenv/config'
import * as fs from 'node:fs';

(async () => {

    fs.readFile(".env", (chyba) => {
        if (chyba) {
            console.error("chybí .env soubor")
            return;
        }
    })

    if (process.env.TYP === "homework") {
        await homework()
    } else if (process.env.TYP === "practice1") {
        practiceOnePoint()
    } else if (process.env.TYP === "practice2") {
        practiceTwoPoints()
    } else {
        console.log("špatně zadaný typ úlohy")
        return;
    }

})();