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

## 今後の進化案(2024/217)
### メニューリスト(ポート選択)
### 表示ページ
#### 基本ページ
  - ページマウント時、状態get発行して最新状態を取得
    - Aポートオープン
      - openning port...
    - 空打ち/レスポンス確認
      - check connecting to CXM15xx
    - sys.mode,sys.stt,gnss.stt取得→表示更新
      - getting latest information
        - sys.mode.get
        - sys.stt.get
        - gnss.stt.get
  - ページアンマウント時
    - Aポートクローズ

  - HWリセット→初期化ボタン
    - Aポートオープン済確認
    - Bポートオープン成功なら
      - HWリセットシーケンス起動
      - Bポートクローズ
      - PINリセットイベント確認
    - Bポートオープン失敗
      - 空打ち/レスポンス確認OKなら
      - リセットコマンド発行
      - CMDリセットイベント確認
    - SYS.MDOE=0設定
    - SYS.VER,GNSS.VER,SYS.MODEをget
    - GNSS.HOST_FW_SENT設定

  - 状態表示
    - sys.stt
    - gnss.stt
    - 現在時刻
    - vel,headingDirection(text)

#### GNSSモニタページ
  - ページマウント時
    - Cポートオープン
      - openning port...
  - ページアンマウント時
    - Cポートクローズ

  - 状態表示
    - 現在時刻
    - fixed status
    - velHeadingDirection(text)
    - velHeadingDirection(view)
    - GSV View
    - currentPosition(text)
    - currentPosition(view)
    - Mpa With current Position

