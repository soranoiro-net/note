/* 栽培ノート：品目と農薬登録上の作物名の対応表、および照合
   作物群の所属は「農薬の適用病害虫の範囲及び使用方法に係る適用農作物等の名称について」（農林水産省通知）の表
   （大阪府の作物分類表 令和6年4月1日改正版で確認）と、改訂前の作物群名を用いた登録に対応するための所属を合わせたもの。
   改訂前の作物群は、確かなものだけを入れている（迷うものは入れない＝表示しない側に倒す）。
   g: [作物群名, 許す括弧内の区分（省略時は区分なし・栽培条件のみ）] */
const CROP_ITEMS=[
 {name:'米',kana:['こめ','いね','稲','水稲','米'],alias:['稲','水稲','移植水稲','直播水稲','湛水直播水稲','乾田直播水稲','陸稲'],subs:['移植水稲','直播水稲','湛水直播水稲','乾田直播水稲','陸稲'],g:[['水田作物']]},
 {name:'キャベツ',alias:['キャベツ'],g:[['野菜類'],['葉菜類'],['結球あぶらな科葉菜類'],['あぶらな科野菜']]},
 {name:'きゅうり',alias:['きゅうり'],g:[['野菜類'],['うり類',['','未成熟']],['うり科野菜'],['うり科野菜類']]},
 {name:'さといも',alias:['さといも'],g:[['野菜類'],['いも類']]},
 {name:'だいこん',alias:['だいこん'],g:[['野菜類'],['根菜類']]},
 {name:'トマト',alias:['トマト'],g:[['野菜類'],['なす科果菜類'],['なす科野菜']]},
 {name:'なす',alias:['なす'],g:[['野菜類'],['なす科果菜類'],['なす科野菜']]},
 {name:'にんじん',alias:['にんじん'],g:[['野菜類'],['根菜類']]},
 {name:'ねぎ',alias:['ねぎ'],g:[['野菜類'],['鱗茎類',['','葉物']]]},
 {name:'はくさい',alias:['はくさい'],g:[['野菜類'],['葉菜類'],['結球あぶらな科葉菜類'],['あぶらな科野菜']]},
 {name:'ピーマン',alias:['ピーマン'],g:[['野菜類'],['なす科果菜類'],['なす科野菜'],['ピーマン及びとうがらし類']]},
 {name:'レタス',alias:['レタス'],g:[['野菜類'],['葉菜類'],['レタス類']]},
 {name:'たまねぎ',alias:['たまねぎ'],g:[['野菜類'],['鱗茎類',['','根物']]]},
 {name:'ばれいしょ',kana:['じゃがいも','ジャガイモ'],alias:['ばれいしょ'],g:[['野菜類'],['いも類']]},
 {name:'ほうれんそう',alias:['ほうれんそう'],g:[['野菜類'],['葉菜類'],['ヒユ科葉菜類']]},
 {name:'アスパラガス',alias:['アスパラガス'],g:[['野菜類'],['茎野菜類']]},
 {name:'いちご',alias:['いちご'],g:[['野菜類']]},
 {name:'えだまめ',alias:['えだまめ'],g:[['野菜類'],['豆類',['未成熟']]]},
 {name:'かぶ',alias:['かぶ'],g:[['野菜類'],['根菜類']]},
 {name:'かぼちゃ',alias:['かぼちゃ'],g:[['野菜類'],['うり類',['','成熟']],['うり科野菜'],['うり科野菜類']]},
 {name:'カリフラワー',alias:['カリフラワー'],g:[['野菜類'],['はなやさい類'],['あぶらな科野菜',['','花蕾及び茎']]]},
 {name:'かんしょ',kana:['さつまいも','サツマイモ'],alias:['かんしょ'],g:[['野菜類'],['いも類']]},
 {name:'グリーンピース',kana:['実えんどう','みえんどう'],alias:['実えんどう'],g:[['野菜類'],['豆類',['未成熟']]]},
 {name:'ごぼう',alias:['ごぼう'],g:[['野菜類'],['根菜類']]},
 {name:'こまつな',alias:['こまつな'],g:[['野菜類'],['葉菜類'],['非結球あぶらな科葉菜類'],['あぶらな科野菜']]},
 {name:'さやいんげん',alias:['さやいんげん'],g:[['野菜類'],['豆類',['未成熟']]]},
 {name:'さやえんどう',alias:['さやえんどう'],g:[['野菜類'],['豆類',['未成熟']]]},
 {name:'しゅんぎく',alias:['しゅんぎく'],g:[['野菜類'],['葉菜類'],['レタス類以外のきく科葉菜類']]},
 {name:'しょうが',alias:['しょうが'],g:[['野菜類'],['根菜類']]},
 {name:'すいか',alias:['すいか'],g:[['野菜類'],['うり類',['','成熟']],['うり科野菜'],['うり科野菜類']]},
 {name:'スイートコーン',kana:['とうもろこし','未成熟とうもろこし'],alias:['未成熟とうもろこし'],g:[['とうもろこし',['','未成熟']]]},
 {name:'セルリー',kana:['セロリ'],alias:['セルリー'],g:[['野菜類'],['葉菜類'],['せり科葉菜類']]},
 {name:'そらまめ',kana:['未成熟そらまめ'],alias:['未成熟そらまめ'],g:[['野菜類'],['豆類',['未成熟']]]},
 {name:'ちんげんさい',kana:['チンゲンサイ','青梗菜'],alias:['チンゲンサイ'],g:[['野菜類'],['葉菜類'],['非結球あぶらな科葉菜類'],['あぶらな科野菜']]},
 {name:'にら',alias:['にら'],g:[['野菜類'],['鱗茎類',['','葉物']]]},
 {name:'にんにく',alias:['にんにく'],g:[['野菜類'],['鱗茎類',['','根物']]]},
 {name:'ふき',alias:['ふき'],g:[['野菜類'],['茎野菜類'],['ふき類']]},
 {name:'ブロッコリー',alias:['ブロッコリー'],g:[['野菜類'],['はなやさい類'],['あぶらな科野菜',['','花蕾及び茎']]]},
 {name:'みずな',alias:['みずな'],g:[['野菜類'],['葉菜類'],['非結球あぶらな科葉菜類'],['あぶらな科野菜']]},
 {name:'みつば',alias:['みつば'],g:[['野菜類'],['葉菜類'],['せり科葉菜類']]},
 {name:'メロン',alias:['メロン'],g:[['野菜類'],['うり類',['','成熟']],['うり科野菜'],['うり科野菜類']]},
 {name:'やまのいも',kana:['ながいも','やまいも','自然薯'],alias:['やまのいも'],g:[['野菜類'],['いも類']]},
 {name:'れんこん',alias:['れんこん'],g:[['野菜類']]},
 {name:'ししとうがらし',kana:['ししとう'],alias:['ししとう'],g:[['野菜類'],['なす科果菜類'],['ピーマン及びとうがらし類'],['とうがらし類']]},
 {name:'わけぎ',alias:['わけぎ'],g:[['野菜類'],['鱗茎類',['','葉物']]]},
 {name:'らっきょう',alias:['らっきょう'],g:[['野菜類'],['鱗茎類',['','根物']]]},
 {name:'にがうり',kana:['ゴーヤ','ゴーヤー'],alias:['にがうり'],g:[['野菜類'],['うり類',['','未成熟']],['うり科野菜'],['うり科野菜類']]},
 {name:'オクラ',alias:['オクラ'],g:[['野菜類']]},
 {name:'みょうが',alias:['みょうが'],g:[['野菜類']]}
];
/* 括弧を考慮して読点で分ける */
function cmSplitTop(s){const out=[];let d=0,cur='';for(const ch of s){if(ch==='('){d++}else if(ch===')'){d--}
  if((ch==='、'||ch===',')&&d===0){out.push(cur);cur=''}else cur+=ch}if(cur)out.push(cur);return out.map(x=>x.trim()).filter(Boolean)}
/* 「作物名(区分、ただし、A、Bを除く)」を {base, qual:[区分], excl:[除く作物]} に分解 */
function cmParse(s){s=(s||'').normalize('NFKC').trim();const i=s.indexOf('(');
  if(i<0||!s.endsWith(')'))return{base:s,qual:[],excl:[],raw:s};
  const base=s.slice(0,i).trim(),inner=s.slice(i+1,-1);let qual=[],excl=[];
  let parts=cmSplitTop(inner),qi=parts.findIndex(p=>/^(ただし|但し)$/.test(p));
  let exParts=[];
  if(qi>=0){qual=parts.slice(0,qi);exParts=parts.slice(qi+1)}
  else if(/を除く$/.test(inner)&&!/^.*を除く.*を除く$/.test('')){exParts=parts}
  else qual=parts;
  if(exParts.length){const last=exParts.length-1;exParts[last]=exParts[last].replace(/を除く$/,'');excl=exParts}
  return{base,qual,excl,raw:s};
}
const CM_COND=/栽培|施設|露地|育苗|苗|本畑|本田|移植|直播|マルチ|水耕|軟化|普通期|早期|晩期/;
/* その区分が品目に当てはまるか（栽培条件などは当てはまるとみなし、画面に表示する） */
function cmQualOk(q,ok){if(!q.length)return !ok||ok.includes('');return q.every(x=>(ok&&ok.includes(x))||CM_COND.test(x))}
/* 作物名の要素（base＋区分）が品目に当たるか。kind: 'self'（個別作物）| 'group'（作物群）| null */
function cmHit(item,p){
  if(item.alias.includes(p.base))return 'self';
  for(const [g,ok] of item.g){if(g===p.base&&cmQualOk(p.qual,ok))return 'group'}
  return null}
function cmMatch(item,cropName){
  const p=cmParse(cropName);if(/等|作物一般|加害する/.test(p.base))return null;
  const kind=cmHit(item,p);if(!kind)return null;
  const note=[];
  for(const e of p.excl){const ep=cmParse(e);
    if((item.subs||[]).includes(ep.base)){note.push(ep.raw+'を除く');continue}
    if(cmHit(item,ep))return null}
  return{kind,qual:p.qual.filter(Boolean),note}}
/* 作付の品目名から対応表の品目を探す。なければ品目名そのものを個別作物として扱う */
const cmKey=t=>(t||'').normalize('NFKC').replace(/[ぁ-ゖ]/g,c=>String.fromCharCode(c.charCodeAt(0)+0x60)).replace(/\s/g,'');
function cmItemFor(name){const k=cmKey(name);if(!k)return null;
  const hit=CROP_ITEMS.find(it=>[it.name,...(it.kana||[]),...it.alias].some(a=>cmKey(a)===k));
  return hit||{name,alias:[(name||'').normalize('NFKC')],g:[],custom:true}}
/* 登録の適用内容のうち、その品目に使える行。個別作物の登録があればそれを優先し、作物群の行は使わない */
function cmRows(item,rows){const m=rows.map(r=>({r,m:cmMatch(item,r.crop)})).filter(x=>x.m);
  const self=m.filter(x=>x.m.kind==='self');return (self.length?self:m)}
if(typeof module!=='undefined')module.exports={CROP_ITEMS,cmParse,cmMatch,cmItemFor,cmRows};
