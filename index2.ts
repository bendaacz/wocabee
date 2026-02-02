import { Builder, Browser, By, Key, until } from "selenium-webdriver"
import 'dotenv/config'
import axios from "axios"

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
            // console.log(`match CZ ${jsonSlova.word}, ${jsonSlova.translation}, zadani: ${zadani}`)
            if (nabidka.length == 0) {
                vysledek = jsonSlova.translation
            } else {
                vysledek = nabidka.indexOf(jsonSlova.translation)
            }
        } else if (jsonSlova.translation == zadani) {
            // console.log(`match DE ${jsonSlova.word}, ${jsonSlova.translation}, zadani: ${zadani}`)
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
    return
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
        choosePicturePocitadlo = 0
    } catch (e) {
        console.log(`otevritCviceni: ${e}`)
    }
}

async function zjistitCviceni() {
    // cviceni.forEach(async i => {
    //     let a = await driver.findElement(By.id(i)).getAttribute("style")
    //     if (a === "") {
    //         console.log(`mam ${i}`)
    //         aktualniCviceni = i
    //     }
    // })
    for (let i in cviceni) {
        let a = await driver.findElement(By.id(cviceni[i])).getAttribute("style")
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
        // console.log(res.data.replace(/\$|`/g, "").slice(zacatekPrekladu, konecPrekladu).split(";")[0])
        slova = JSON.parse(res.data.replace(/\$|`/g, "").slice(zacatekPrekladu, konecPrekladu).split(";")[0])
    })
}


async function chooseWord(driver: any) {
    let zadani = await driver.findElement(By.id("ch_word"))
    zadani = await zadani.getText()

    let nabidka = await driver.findElement(By.id("chooseWords")).getText()
    nabidka = nabidka.split("\n")

    let poziceOdpovedi: any = najitOdpovedKZadani(zadani, nabidka)

    try {
        await driver.findElement(By.xpath(`//button[@class='chooseWordAnswer btn btn-lg btn-primary btn-block'][text()="${nabidka[poziceOdpovedi]}"]`)).click() //*[text()="${nabidka[poziceOdpovedi]}"]
    } catch (e) {
        console.log(`chooseWord: ${e}`)
    }

    aktualniCviceni = "cekat"
    console.log("kliknuto: chooseWord")
}

async function transcribe(driver: any) {
    try {
        await driver.findElement(By.id("transcribeSkipBtn")).click()
    } catch (e) {
        console.log(`transcribe: ${e}`)
    }

    aktualniCviceni = "cekat"
    console.log("kliknuto: transcribe")
}

async function translateWord(driver: any) {
    let zadani = await driver.findElement(By.id("q_word"))
    zadani = await zadani.getText()

    slova.forEach(async (jsonSlova: any) => { // TODO: pouzit funkci najidOdpovediKZadani()
        if (jsonSlova.word == zadani) {
            // console.log(`match CZ ${jsonSlova.word}, ${jsonSlova.translation}, zadani: ${zadani}`)
            await driver.findElement(By.id("translateWordAnswer")).sendKeys(jsonSlova.translation)
            return;
        } else if (jsonSlova.translation == zadani) {
            // console.log(`match DE ${jsonSlova.word}, ${jsonSlova.translation}, zadani: ${zadani}`)
            await driver.findElement(By.id("translateWordAnswer")).sendKeys(jsonSlova.word)
            return;
        }
    });

    try {
        await driver.findElement(By.id("translateWordSubmitBtn")).click()
    } catch (e) {
        console.log(`translateWord: ${e}`)
    }

    aktualniCviceni = "cekat"
    console.log("kliknuto: translateWord")
}

async function findPair(driver: any) {
    let nabidka = await driver.findElements(By.xpath("//button[@w_id]"))
    let wocaId: number[] = []

    nabidka.forEach(async (id: any) => {
        let kandidat = await id.getAttribute("w_id")
        wocaId.push(kandidat)
        wocaId.sort()

        if (wocaId.indexOf(kandidat) !== wocaId.lastIndexOf(kandidat)) {
            let klikni = await driver.findElements(By.xpath("//button[@w_id]"))

            klikni.forEach(async (klik: any) => {
                let odpoved = await klik.getAttribute("w_id")
                if (odpoved === kandidat) {
                    try {
                        await klik.click()
                    } catch (e) {
                        //konec
                    }
                }
            });

        }

    })

    aktualniCviceni = "cekat"
    console.log("kliknuto: findPair")
}

async function pexeso(driver: any) {
    let nabidka = await driver.findElements(By.xpath("//div[@w_id]"))
    let wocaId: { poradi: number; id: any; }[] = []
    let poradi = 0

    await new Promise<void>((resolve) => {
        nabidka.forEach(async (id: any) => {
            let kandidat = await id.getAttribute("w_id")
            wocaId.push({ "poradi": poradi, "id": kandidat })
            if (poradi >= 7) {
                resolve()
            }
            poradi++
        })
    })

    wocaId.sort((prvni, druhy) => prvni.id - druhy.id)
    console.log("serazeno: ", wocaId)

    await driver.sleep(500)

    for (let i in wocaId) {
        let asdf = wocaId[i]
        try {
            await nabidka[asdf!.poradi].click()
            await nabidka[asdf!.poradi].click()
        } catch (e) {
            console.log("muze za to wocapoint gratulace??", await driver.findElement(By.id("wocaPointsReward")).getAttribute("style") !== "display: none;")
            console.log("cekam, az zmizi wocapoint gratulace...")
            await driver.sleep(5000)
            await nabidka[asdf!.poradi].click()
            await nabidka[asdf!.poradi].click()
        }
    }

    aktualniCviceni = "cekat"
    console.log("kliknuto: pexeso")
}

async function oneOutOfMany(driver: any) {

    let nabidka = await driver.findElement(By.id("oneOutOfManyWords")).getText()
    nabidka = nabidka.split("\n")
    let zadani

    // console.log("nabídka před filtrováním", nabidka)

    if (nabidka.length == 7 + 1) {
        nabidka.splice(4, 1)
        zadani = nabidka[3]
        nabidka.splice(3, 1)
    } else if (nabidka.length == 5 + 1) {
        nabidka.splice(3, 1)
        zadani = nabidka[2]
        nabidka.splice(2, 1)
    } else if (nabidka.length == 3 + 1) {
        nabidka.splice(2, 1)
        zadani = nabidka[1]
        nabidka.splice(1, 1)
    }

    let poziceOdpovedi: any = najitOdpovedKZadani(zadani, nabidka)

    try {
        await driver.findElement(By.xpath(`//div[@class='oneOutOfManyWord btn btn-primary btn-block' and text()="${nabidka[poziceOdpovedi]}"]`)).click()
    } catch (e) {
        console.log(`oneOutOfMany: ${e}`)
    }

    // console.log("nabidka ", nabidka, "zadani", zadani, "poziceOdpovedi", poziceOdpovedi)

    aktualniCviceni = "cekat"
    console.log("kliknuto: oneOutOfMany")
}

async function completeWord(driver: any) {
    let pismenkoKeZmacknuti: any[] = []
    let zadani = await driver.findElement(By.id("completeWordQuestion")).getText()
    let seznamTlacitek = await driver.findElements(By.className("char btn-wocagrey"))

    let nabidka = await driver.findElement(By.id("characters"))
    nabidka = await nabidka.getText()
    nabidka = nabidka.split("")

    // console.log("slovicka z nabidky", nabidka, " a zadanicko:", zadani)
    let odpoved: any = najitOdpovedKZadani(zadani, [])

    let nahledOdpovedi = await driver.findElement(By.id("completeWordAnswer")).getText()
    let odpovedRozkrajeno = odpoved.split("")

    for (let i in nahledOdpovedi) {
        if (nahledOdpovedi[i] === "_") {
            pismenkoKeZmacknuti.push(nabidka.indexOf(odpovedRozkrajeno[i]))
            // console.log("pred odstranenim", nabidka)
            nabidka.filter((pismeno: any) => pismeno !== nabidka.indexOf(odpovedRozkrajeno[i]))
            nabidka.splice(nabidka.indexOf(odpovedRozkrajeno[i]), 1, "")
            // console.log("odstraneno", odpovedRozkrajeno[i], "z", nabidka)
        }
    }

    // console.log(pismenkoKeZmacknuti, nabidka)

    await new Promise<void>((resolve) => {
        pismenkoKeZmacknuti.forEach(async indexPismenka => {
            await seznamTlacitek[indexPismenka].click()
            if (pismenkoKeZmacknuti[pismenkoKeZmacknuti.length - 1] == indexPismenka) {
                await driver.wait(until.elementIsVisible(await driver.findElement(By.id("completeWordSubmitBtn"))))
                await driver.findElement(By.id("completeWordSubmitBtn")).click()
                resolve()
            }
        });
    })

    aktualniCviceni = "cekat"
    console.log("kliknuto: completeWord")
}

let choosePicturePocitadlo = 0
async function choosePicture(driver: any) {
    let m1
    let m2
    let m3
    let zadani = await driver.findElement(By.id("choosePictureWord")).getText()
    try {
        m1 = await driver.findElement(By.xpath(`//div[@id='slick-slide${choosePicturePocitadlo}0'][1]/img[@class='picture'][1]`)).getAttribute("word_id")
        m2 = await driver.findElement(By.xpath(`//div[@id='slick-slide${choosePicturePocitadlo}1'][1]/img[@class='picture'][1]`)).getAttribute("word_id")
        m3 = await driver.findElement(By.xpath(`//div[@id='slick-slide${choosePicturePocitadlo}2'][1]/img[@class='picture'][1]`)).getAttribute("word_id")
    } catch (e) {
        console.log("choosePicture: ", e)
    }
    let moznosti = [m1, m2, m3]

    let odpoved = najitOdpovedKZadani(zadani, [])
    console.log(odpoved)

    let poradiObrazku = -1

    moznosti.forEach(async moznost => {
        poradiObrazku++

        if (moznost != 0) {

            for (let i in slova) {
                if (slova[i]!.word_id == moznost && slova[i]!.word == odpoved) {
                    console.log("match:", moznost, slova[i]!.word)
                    console.log("index", poradiObrazku)
                    try {
                        console.log("klikam s poradiObrazku", poradiObrazku)
                        await driver.findElement(By.xpath(`//img[@class='picture' and @word_id='${moznost}']`)).click()
                        await driver.findElement(By.xpath(`//img[@class='picture' and @word_id='${moznost}']`)).click()
                        choosePicturePocitadlo++
                        // await driver.findElement(By.xpath(`//div[@id='slick-slide${choosePicturePocitadlo}${poradiObrazku + 1}'][1]/img[@class='picture'][1]`)).click()
                    } catch (e) {
                        console.log("choosePicture:", e)
                    }
                    return;
                }
            }

        }
    });

    aktualniCviceni = "cekat"
    console.log("kliknuto: choosePicture")
}

async function describePicture(driver: any) { // uz nahodne netipujene :3
    try {
        let odpoved = ""
        let filename = await driver.findElement(By.xpath("//img[@id='describePictureImg']")).getAttribute("src")
        console.log("obsah src atributu", filename)
        filename = filename.split("/")
        filename = filename[filename.length - 1]
        console.log("nazev souboru 2", filename)

        await new Promise<void>((resolve) => {
            slova.forEach(slovo => {
                try {
                    if (slovo.p_filename == filename) {
                        console.log("match obrazku =", slovo.word, slovo.translation)
                        odpoved = slovo.translation
                    } else {
                        console.log("zatím nic:", slovo.p_filename, "!=", filename)
                    }
                } catch (e) {
                    console.log("describePicture:", e)
                } finally {
                    resolve()
                }
            });
        })
        await driver.findElement(By.id("describePictureAnswer")).sendKeys(odpoved)
        await driver.findElement(By.id("describePictureSubmitBtn")).click()
        // await driver.findElement(By.id("incorrect-next-button")).click()

    } catch (e) {
        console.log("describePicture", e)
    }

    aktualniCviceni = "cekat"
    console.log("kliknuto: choosePicture")
}

async function prebratLeaderboard() {
    driver = await vytvoritOkno()
    await prihlasit(driver)

    await najitProcvicovani()
    await otevritProcvicovani()

    await sehnatHtml()
    await zjistitCviceni()
    cviceniOtevreno = true

    while (cviceniOtevreno) {
        switch (aktualniCviceni) {
            case "chooseWord":
                await chooseWord(driver)
                await zjistitCviceni()
                break;

            case "transcribe":
                await transcribe(driver)
                await zjistitCviceni()
                break;

            case "translateWord":
                await translateWord(driver)
                await zjistitCviceni()
                break;

            case "findPair":
                await findPair(driver)
                await zjistitCviceni()
                break;

            case "pexeso":
                await pexeso(driver)
                await zjistitCviceni()
                break;

            case "oneOutOfMany":
                await oneOutOfMany(driver)
                await zjistitCviceni()
                break;

            case "completeWord":
                await completeWord(driver)
                await zjistitCviceni()
                break;

            case "choosePicture":
                await choosePicture(driver)
                await zjistitCviceni()
                break;

            case "describePicture":
                await describePicture(driver)
                await zjistitCviceni()
                break;

            case "cekat":
                console.log("cekam")
                await driver.sleep(300)
                await zjistitCviceni()
                break;

            default:
                console.log(`neimplementovano: ${aktualniCviceni}`)
                aktualniCviceni = "cekat"
                await zjistitCviceni()
                break;
        }
    }
}

prebratLeaderboard()