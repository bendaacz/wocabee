# Wocabee bot

jednoduchý skript pro vzdělávací program [wocabee.app](https://www.wocabee.app/), který umí:
- vypracovat domácí úkoly
- získávat extra body za procvičování

## Instalace
- stáhněte si tento projekt [zde jako zip](https://github.com/bendaacz/wocabee/archive/refs/heads/main.zip)
- pro spuštění skriptu je potřeba mít nainstalovaný [nodejs](https://nodejs.org/en/download)
- uvnitř složky s projektem vytvořte .env soubor, který bude vypadat takhle:
```
USERNAME=
PASSWORD=

## homework => vsechny nesplnene ukoly
## practice1 => opakovani 1 bod/otazka
## practice2 => opakovani 2 bod/otazka
TYP=homework

## vypnout/zapnout console.log() pro debugging
DEBUG=0
```
- je potřeba vyplnit uživatelské jméno a heslo od wocabee účtu a typ cvičení, která chcete vypracovat. (přihlašovací údaje jsou sdíleny pouze s wocabee.app)
- po vytvoření .env souboru stačí už jenom nainstalovat všechno potřebné tím, že napíšete tohle do vašeho terminálu (uvnitř toho rozbaleného zipu):
```
npm i
```
## Použití
spuštení skriptu
```bash
npx tsx index.ts
```
> **_užitečné:_** příkazy "_npm i_" a "_npx tsx index.ts_" musí být vždy spuštěny ve složce, kde se nachází projekt.
