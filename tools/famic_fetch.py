#!/usr/bin/env python3
"""FAMICの「農薬登録情報ダウンロード」からCSV（ZIP）を取得し、famic_convert.py で変換する。

GitHub Actions から週1回実行する想定。FAMICの許可（2026年11月26日）の条件に従い、
アプリ側で出典・加工した旨・免責を表示すること。

ページ構成が変わった場合は PAGE_URL と、リンクの見つけ方（ZIPへのリンクを集める）を直す。
"""
import io, os, re, subprocess, sys, tempfile, urllib.parse, urllib.request, zipfile

PAGE_URL = os.environ.get('FAMIC_PAGE_URL', 'https://www.acis.famic.go.jp/ddata/index2.htm')
OUT = os.environ.get('FAMIC_OUT', 'data/famic')
UA = {'User-Agent': 'saibai-note-data-updater (soranoiro.net)'}

def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120) as r:
        return r.read()

def main():
    html = get(PAGE_URL).decode('cp932', errors='replace')
    links = [urllib.parse.urljoin(PAGE_URL, h) for h in re.findall(r'href="([^"]+\.zip)"', html, re.I)]
    if not links:
        sys.exit('ZIPへのリンクが見つかりません。ページの構成を確認してください: ' + PAGE_URL)
    tmp = tempfile.mkdtemp()
    csvs = []
    for u in links:
        with zipfile.ZipFile(io.BytesIO(get(u))) as z:
            for n in z.namelist():
                if n.lower().endswith('.csv'):
                    p = os.path.join(tmp, os.path.basename(n))
                    with open(p, 'wb') as f:
                        f.write(z.read(n))
                    csvs.append(p)
    # 末尾が0のファイルが登録基本部、1・2が登録適用部（例：R0811040.csv / R0811041.csv / R0811042.csv）
    base = [p for p in csvs if re.search(r'0\.csv$', p, re.I)]
    apps = sorted(p for p in csvs if p not in base)
    if len(base) != 1 or not apps:
        sys.exit('CSVの組み合わせが想定と違います: ' + ', '.join(os.path.basename(p) for p in csvs))
    here = os.path.dirname(os.path.abspath(__file__))
    subprocess.run([sys.executable, os.path.join(here, 'famic_convert.py'), base[0], *apps, '--out', OUT], check=True)

if __name__ == '__main__':
    main()
