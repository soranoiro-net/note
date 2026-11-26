# 栽培ノート（試作2）

青果・米の生産者向けの生産記録Webアプリ。記録は端末内にだけ保存し、外部には送信しない。

## ファイル
- `index.html` … アプリ本体
- `sw.js`・`manifest.webmanifest`・`icon-*.png`・`apple-touch-icon.png` … ホーム画面に追加して圏外でも使うためのファイル
- `CNAME` … 公開アドレス（note.soranoiro.net）
- `crop-match.js` … 品目と農薬登録上の作物名の対応表・照合
- `data/famic/` … 農薬登録情報（FAMIC「農薬登録情報ダウンロード」を変換したもの）
- `tools/famic_convert.py` … FAMICのCSVを `data/famic/` に変換
- `tools/famic_fetch.py` … FAMICのサイトからCSVを取得して変換（GitHub Actions用）
- `.github/workflows/famic-update.yml` … 週1回の自動更新

## 公開
GitHub Pages で公開する（https が必要。端末内のファイルとして開くと、登録情報を読み込めない）。

## 農薬登録情報の利用条件
FAMICから利用の許可（2026年11月26日）を受けている。許可の条件として、アプリ内に出典・加工した旨・免責を表示している（`FAMIC_NOTE1`・`FAMIC_NOTE2`）。照会内容に変更が生じた場合はFAMICへ報告する。

## 手動で更新する場合
    python3 tools/famic_convert.py R0811040.csv R0811041.csv R0811042.csv --out data/famic
