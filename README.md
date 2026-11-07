# Wocabee bot

jednoduchý skript pro vzdělávací program [wocabee.app](https://www.wocabee.app/), který umí:

- vypracovat domácí úkoly
- získávat extra body za procvičování

## Instalace

- stáhněte si tento projekt [zde jako zip](https://github.com/bendaacz/wocabee/archive/refs/heads/main.zip)
- pro spuštění skriptu je potřeba mít nainstalovaný [nodejs](https://nodejs.org/en/download) (vyvíjeno na v24.11.0) a Firefox (verze 159 a vyšší)
- uvnitř složky s projektem vytvořte .env soubor, který bude vypadat takhle:

> **_bez toho nebude nic fungovat:_** soubor se musí jmenovat přesně ".env" a žádný text před ním. Pro vytvoření tohoto souboru ve Windows otevřete průzkumník souborů a ujistěte se, že vídíte přípony souborů ([návod zde](https://support.microsoft.com/cs-cz/windows/b%C4%9B%C5%BEn%C3%A9-p%C5%99%C3%ADpony-n%C3%A1zv%C5%AF-soubor%C5%AF-ve-windows-da4a4430-8e76-89c5-59f7-1cdbbc75cb01).) Bez zobrazení přípon se vytvoří ".txt.env" místo ".env" a program bude tento konfigurační soubor ignorovat.

```
WOCABEE_USERNAME=
WOCABEE_PASSWORD=

## homework => vsechny nesplnene ukoly
## practice1 => opakovani 1 bod/otazka
## practice2 => opakovani 2 bod/otazka
TYP=homework

## vypnout/zapnout console.log() pro debugging
DEBUG=0
```

- dále je potřeba vyplnit uživatelské jméno a heslo od wocabee účtu a typ cvičení, která chcete vypracovat. (přihlašovací údaje jsou sdíleny pouze s wocabee.app)
- po vytvoření ".env" souboru stačí už jenom nainstalovat všechno potřebné tím, že napíšete tohle do vašeho terminálu (uvnitř toho rozbaleného zipu):

> **_důležité:_** příkazy "_npm i_" a "_npx tsx index.ts_" musí být vždy spuštěny ve složce, kde se nachází projekt. [Návod zde.](https://techtactician.com/how-to-open-a-cmd-shell-in-a-folder-windows-10-11/)

```
npm i
```

## Použití

spuštení skriptu

```bash
npx tsx index.ts
```

## Stabilnější varianta (Docker kontejner)
- vyplňte všechny údaje do souboru _Dockerfile_, který je již předvytvořený v tomto projektu
- vytvoření a spuštění Docker kontejneru pro Linux:
```bash
docker build --progress=plain -t wocabee . && docker run -it wocabee:latest
```

> _0 řádků kódu generovaných za pomocí AI_
