FROM node:alpine
WORKDIR /usr/wocabee
COPY package.json .
RUN apk add firefox
ENV WOCABEE_USERNAME=""
ENV WOCABEE_PASSWORD=""
ENV TYP="homework"
ENV DEBUG="1"
# HEADLESS musi byt vzdy 1 pro docker kontejner
ENV HEADLESS="1"
RUN npm i
COPY . .
CMD ["npx", "tsx", "index.ts"]
