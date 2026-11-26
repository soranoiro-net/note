#!/usr/bin/env python3
"""FAMIC「農薬登録情報ダウンロード」のCSVを、栽培ノート用のJSONに変換する。

使い方:
  python3 tools/famic_convert.py 基本部.csv 適用部一.csv 適用部二.csv --out data/famic [--asof 2026-11-04]

出力:
  data/famic/meta.json        反映日・件数・出典
  data/famic/index.json       登録の一覧（検索用）
  data/famic/r/<登録番号>.json  登録ごとの適用内容

文字はNFKC正規化（半角カナを全角に、「㍑」を「リットル」に）する。
適用内容は、適用病害虫だけが違う行を1行にまとめる。
"""
import argparse, csv, json, os, re, sys, unicodedata, datetime, shutil

N = lambda s: unicodedata.normalize('NFKC', s or '').strip()
def clean(s):
    s = N(s)
    return '' if s in ('-', '－', 'ー') else s

def read_csv(path):
    with open(path, encoding='cp932', newline='') as f:
        rows = list(csv.reader(f))
    return rows[0], rows[1:]

def asof_from_name(path):
    m = re.search(r'R(\d\d)(\d\d)(\d\d)\d', os.path.basename(path))
    if not m:
        return ''
    y, mo, d = 2018 + int(m.group(1)), int(m.group(2)), int(m.group(3))
    return f'{y:04d}-{mo:02d}-{d:02d}'

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('base'); ap.add_argument('app', nargs='+')
    ap.add_argument('--out', default='data/famic'); ap.add_argument('--asof', default='')
    a = ap.parse_args()

    bh, brows = read_csv(a.base)
    bi = {h: i for i, h in enumerate(bh)}
    regs = {}
    for r in brows:
        no = int(N(r[bi['登録番号']]))
        g = regs.setdefault(no, {
            'name': clean(r[bi['農薬の名称']]), 'type': clean(r[bi['農薬の種類']]),
            'use': clean(r[bi['用途']]), 'holder': clean(r[bi['登録を有する者の名称']]),
            'form': clean(r[bi['剤型名']]), 'date': clean(r[bi['登録年月日']]), 'ing': []})
        g['ing'].append([clean(r[bi['有効成分']]), clean(r[bi['総使用回数における有効成分']]), clean(r[bi['濃度']])])

    rows_by = {}
    head = None
    for p in a.app:
        h, rows = read_csv(p)
        if head is None:
            head = h
        elif h != head:
            sys.exit('適用部の列がファイルごとに違います: ' + p)
        rows_by.setdefault('_', []).extend(rows)
    ai = {h: i for i, h in enumerate(head)}
    tot_cols = [h for h in head if h.startswith('有効成分') and '総使用回数' in h]
    keys = ['作物名', '適用場所', '使用目的', '希釈倍数使用量', '散布液量', '使用時期', '本剤の使用回数', '使用方法',
            'くん蒸時間', 'くん蒸温度', '適用土壌', '適用地帯名']
    per = {}
    for r in rows_by['_']:
        no = int(N(r[ai['登録番号']]))
        k = tuple(clean(r[ai[x]]) for x in keys) + tuple(clean(r[ai[x]]) for x in tot_cols)
        d = per.setdefault(no, {})
        tg = clean(r[ai['適用病害虫雑草名']])
        if k in d:
            if tg and tg not in d[k]:
                d[k].append(tg)
        else:
            d[k] = [tg] if tg else []

    out = a.out
    if os.path.isdir(os.path.join(out, 'r')):
        shutil.rmtree(os.path.join(out, 'r'))
    os.makedirs(os.path.join(out, 'r'), exist_ok=True)
    asof = a.asof or asof_from_name(a.base)
    idx = []
    for no in sorted(set(regs) | set(per)):
        g = regs.get(no, {'name': '', 'type': '', 'use': '', 'holder': '', 'form': '', 'date': '', 'ing': []})
        idx.append([no, g['name'], g['type'], g['use'], g['holder'], g['ing']])
        rows = []
        for k, tg in per.get(no, {}).items():
            f = dict(zip(keys, k[:len(keys)]))
            rows.append({
                'crop': f['作物名'], 'place': f['適用場所'], 'purpose': f['使用目的'], 'target': '、'.join(tg),
                'dil': f['希釈倍数使用量'], 'vol': f['散布液量'], 'timing': f['使用時期'], 'times': f['本剤の使用回数'],
                'method': f['使用方法'], 'fumi': '、'.join(x for x in (f['くん蒸時間'], f['くん蒸温度']) if x),
                'soil': f['適用土壌'], 'area': f['適用地帯名'],
                'total': list(k[len(keys):])})
        for r in rows:  # 空の項目は出力しない
            for x in [x for x, v in r.items() if v in ('', [])]:
                del r[x]
            if 'total' in r:
                while r['total'] and r['total'][-1] == '':
                    r['total'].pop()
        doc = {'regNo': no, 'name': g['name'], 'type': g['type'], 'use': g['use'], 'holder': g['holder'],
               'form': g['form'], 'date': g['date'], 'ing': g['ing'], 'asOf': asof, 'rows': rows}
        with open(os.path.join(out, 'r', f'{no}.json'), 'w', encoding='utf-8') as fo:
            json.dump(doc, fo, ensure_ascii=False, separators=(',', ':'))
    meta = {'source': '独立行政法人農林水産消費安全技術センター（FAMIC）「農薬登録情報ダウンロード」',
            'asOf': asof, 'converted': datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
            'registrations': len(idx), 'applicationRows': len(rows_by['_'])}
    with open(os.path.join(out, 'index.json'), 'w', encoding='utf-8') as fo:
        json.dump({'asOf': asof, 'items': idx}, fo, ensure_ascii=False, separators=(',', ':'))
    with open(os.path.join(out, 'meta.json'), 'w', encoding='utf-8') as fo:
        json.dump(meta, fo, ensure_ascii=False, indent=1)
    print(json.dumps(meta, ensure_ascii=False))

if __name__ == '__main__':
    main()
