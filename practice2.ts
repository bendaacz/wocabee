import { Builder, Browser, By, Key, until } from "selenium-webdriver"
import 'dotenv/config'
import axios from "axios"

if (process.env.DEBUG === "0") {
    console.log = function () { }
}

let driver: any;
let slova: {
    kw_tagged: number;
    kw_checked: string;
    kw_confirmed: string;
    word_id: number;
    package_id: number;
    sw_id: number;
    word: string;
    translation: string;
    note: null;
    picture_id: null;
    p_filename: null;
    hits_ok: number;
    hits_counter: number;
    def_hits_left: number;
    hits_left: number;
    rating: number;
    additional_hits: number;
    total_hits_ok: number;
    total_hits_nok: number;
    hits_nok: number;
    total_hits_counter: number;
    total_rating: number;
}[]
let cviceni = [
    "intro",
    "problem-words",
    "choosePicture",
    "describePicture",
    "completeWord",
    "addMissingWord",
    "translateWord",
    "chooseWord",
    "findPair",
    "pexeso",
    "oneOutOfMany",
    "matchPair",
    "transcribe",
    "translateFallingWord",
    "arrangeWords",
    // "homeworkQuitScreen", //vzdy "padding-top: 100px; display: none;"
    "msgCompleted",
    "countdown"
]
let nejnovejsiProcvicovani: { cisloCviceni: number, element: any }
let aktualniCviceni: string
let cviceniOtevreno: boolean = false

function najitOdpovedKZadani(zadani: string, nabidka: string[]) {
    let vysledek: any
    slova.forEach((jsonSlova: any) => {
        if (jsonSlova.word == zadani) {
            console.log(`match CZ ${jsonSlova.word}, ${jsonSlova.translation}, zadani: ${zadani}`)
            if (nabidka.length == 0) {
                vysledek = jsonSlova.translation
            } else {
                vysledek = nabidka.indexOf(jsonSlova.translation)
            }
        } else if (jsonSlova.translation == zadani) {
            console.log(`match DE ${jsonSlova.word}, ${jsonSlova.translation}, zadani: ${zadani}`)
            if (nabidka.length == 0) {
                vysledek = jsonSlova.word
            } else {
                vysledek = nabidka.indexOf(jsonSlova.word)
            }
        }
    });
    return vysledek;
}



async function vytvoritOkno() {
    return await new Builder().forBrowser(Browser.FIREFOX).build();
}

async function najitProcvicovani() {
    let procvicovani = await driver.findElements(By.className("actionBtn btn btn-primary btn-block"))
    let procvicovaniId: any[] = []

    if (procvicovani.length !== 0) {
        await new Promise<void>((resolve) => {
            procvicovani.forEach(async (element: any) => {
                let cisloCviceni = await element.getAttribute("id")
                cisloCviceni = cisloCviceni.slice(6)
                procvicovaniId.push({ cisloCviceni, element })
                if (element == procvicovani[procvicovani.length - 1]) {
                    nejnovejsiProcvicovani = procvicovaniId[0]
                    resolve()
                }
            });
        })
        nejnovejsiProcvicovani = procvicovaniId[0]
    } else {
        console.log("zadne dostupne procvicovani")
    }
    console.log(nejnovejsiProcvicovani)
    return;
}

async function prihlasit(driver: any) {
    await driver.get('https://wocabee.app/app')

    try {
        await driver.findElement(By.id('login')).sendKeys(process.env.USERNAME)
        await driver.findElement(By.id("password")).sendKeys(process.env.PASSWORD, Key.RETURN)
    } catch (e) {
        console.log(`${e}, existuje .env?`)
    }
    await driver.wait(until.elementLocated(By.className("flag")), 10000).click()
}

async function otevritProcvicovani() {
    console.log("oteviram:", nejnovejsiProcvicovani.cisloCviceni)
    try {
        await nejnovejsiProcvicovani.element.click()
        let prepnoutBodiky = await driver.findElement(By.xpath("//div[@id='toggleWrapper']"))
        await driver.wait(until.elementIsVisible(prepnoutBodiky), 5000)
        await driver.findElement(By.xpath("//div[@id='toggleWrapper']")).click()
    } catch (e) {
        console.log(`otevritCviceni: ${e}`)
    }
}

async function zjistitCviceni() {
    for (let i in cviceni) {
        let a = await driver.findElement(By.id(cviceni[i]!)).getAttribute("style")
        if (a === "") {
            console.log(`mam ${cviceni[i]}`)
            aktualniCviceni = cviceni[i]!
        }
    }
}

async function sehnatHtml() {
    let aktualniCviceniUrl = await driver.getCurrentUrl()
    console.log(aktualniCviceniUrl)
    let classId = aktualniCviceniUrl.slice(aktualniCviceniUrl.search("class_id=") + 9, aktualniCviceniUrl.search("class_id=") + 9 + 6)
    console.log(classId)
    let packageId = nejnovejsiProcvicovani.cisloCviceni
    console.log(packageId)
    let axiosFormatCookies: string = ""
    let cookies = await driver.manage().getCookies()
    cookies = cookies.forEach((cookie: any) => {
        axiosFormatCookies = axiosFormatCookies.concat(`${cookie.name}=${cookie.value}; `)
    });

    await axios.get(`https://wocabee.app/app/student/class/practice/?class_id=${classId}&package_id=${packageId}&mode=practice`, {
        headers: {
            'Cookie': axiosFormatCookies,
        }
    }).then((res: any) => {
        let zacatekPrekladu = res.data.replace(/\$|`/g, "").search("var locWords") + 15
        let konecPrekladu = res.data.replace(/\$|`/g, "").search(`var C_oneAnswerGameNoOfSeconds`)
        console.log(res.data.replace(/\$|`/g, "").slice(zacatekPrekladu, konecPrekladu).split(";")[0])
        slova = JSON.parse(res.data.replace(/\$|`/g, "").slice(zacatekPrekladu, konecPrekladu).split(";")[0])
    })
}


async function translateFallingWord(driver: any) {
    let zadani = await driver.findElement(By.id("tfw_word"))
    zadani = await zadani.getText()

    slova.forEach(async (jsonSlova: any) => { // TODO: pouzit funkci najitOdpovediKZadani()
        if (jsonSlova.word == zadani) {
            console.log(`match CZ ${jsonSlova.word}, ${jsonSlova.translation}, zadani: ${zadani}`)
            await driver.findElement(By.id("translateFallingWordAnswer")).sendKeys(jsonSlova.translation)
            return;
        } else if (jsonSlova.translation == zadani) {
            console.log(`match DE ${jsonSlova.word}, ${jsonSlova.translation}, zadani: ${zadani}`)
            await driver.findElement(By.id("translateFallingWordAnswer")).sendKeys(jsonSlova.word)
            return;
        }
    });

    try {
        await driver.findElement(By.id("translateFallingWordSubmitBtn")).click()
    } catch (e) {
        console.log(`translateFallingWord: ${e}`)
    }

    if (await driver.findElement(By.id("incorrect")).getAttribute("style") !== "display: none;") {
        try {
            await driver.sleep(100)
            await driver.findElement(By.id("incorrect-next-button")).click()
        } catch (e) {
            console.log(`translateFallingWord: ${e}`)
        }
    }
}

export async function practiceTwoPoints() {
    driver = await vytvoritOkno()
    await prihlasit(driver)

    await najitProcvicovani()
    await otevritProcvicovani()

    await sehnatHtml()
    await zjistitCviceni()
    cviceniOtevreno = true

    while (cviceniOtevreno) {
        switch (aktualniCviceni) {

            case "translateFallingWord":
                await translateFallingWord(driver)
                await driver.sleep(100)
                await zjistitCviceni()
                break;

            default:
                await zjistitCviceni()
                break;
        }
    }
}