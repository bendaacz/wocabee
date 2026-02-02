import { homework } from "./index.js"
import { practiceOnePoint } from "./index2.js"
import { practiceTwoPoints } from "./index3.js"
import 'dotenv/config'

(async () => {

    if (process.env.TYP === "homework") {
        await homework()
    } else if (process.env.TYP === "practice1") {
        practiceOnePoint()
    } else if (process.env.TYP === "practice2") {
        practiceTwoPoints()
    }

})();