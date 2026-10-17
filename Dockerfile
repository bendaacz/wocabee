FROM node:alpine
WORKDIR /usr/wocabee
COPY package.json .
RUN apk add firefox
ENV WOCABEE_USERNAME=""
ENV WOCABEE_PASSWORD=""
ENV TYP="homework"
ENV DEBUG="0"
RUN npm i
COPY . .
CMD ["npx", "tsx", "index.ts"]
