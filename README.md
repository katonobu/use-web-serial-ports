# web-serial-gui
## 最初
1.  [MUI examples/material-next-app-router-ts](https://github.com/mui/material-ui/tree/master/examples/material-next-app-router-ts)以下をコピー。
1. `npm install`,`npm run dev`で動作確認。
1. [dashboard template](https://github.com/mui/material-ui/tree/master/docs/data/material/getting-started/templates/dashboard) の.tsファイルを`src/layouts/Home`にコピー
1. `src/layouts/Home/Home.tsx` の2行目以降を削除し、`src/layouts/Home/Dashboard.tsx`の中身を張り付け
1. `package.json`に`"recharts": "latest",`を追加。

## App-router対応
- `/app` 下に`_components`ディレクトリを掘って、ここにlayout,pageの中身を持ってくる
  - 

------

# Material UI - Next.js App Router example in TypeScript

## How to use

Download the example [or clone the repo](https://github.com/mui/material-ui):

<!-- #default-branch-switch -->

```sh
curl https://codeload.github.com/mui/material-ui/tar.gz/master | tar -xz --strip=2  material-ui-master/examples/material-next-app-router-ts
cd material-next-app-router-ts
```

Install it and run:

```sh
npm install
npm run dev
```

## The idea behind the example

The project uses [Next.js](https://github.com/vercel/next.js), which is a framework for server-rendered React apps.
It includes `@mui/material` and its peer dependencies, including [Emotion](https://emotion.sh/docs/introduction), the default style engine in Material UI v5. If you prefer, you can [use styled-components instead](https://mui.com/material-ui/guides/interoperability/#styled-components).

## What's next?

<!-- #default-branch-switch -->

You now have a working example project.
You can head back to the documentation, continuing browsing it from the [templates](https://mui.com/material-ui/getting-started/templates/) section.
