/* 栽培ノート：Googleドライブへの保存・共有（利用者が選んだときだけ読み込まれる）
   権限は drive.file のみ。アプリで作ったファイルと、利用者がファイル選択画面で選んだファイルだけを扱う。
   記録はGoogleのサーバーと利用者の端末の間だけでやり取りし、提供者には届かない。 */
const DRIVE_CFG={
  clientId:'793646954613-esbn4cdbhigc7mt5e9bj8iflhf06kos8.apps.googleusercontent.com',   /* OAuthクライアントID（…apps.googleusercontent.com） */
  apiKey:'AIzaSyATNL9A0MJZPvTETq027pvKlrFa22GtVC8',     /* APIキー（Google Picker API に制限） */
  appId:'793646954613'       /* プロジェクト番号 */
};
const DRIVE_SCOPE='https://www.googleapis.com/auth/drive.file';
const Drive=(()=>{
  let tok=null,tokExp=0,tokClient=null,user=null;
  const ready=()=>!!(DRIVE_CFG.clientId&&DRIVE_CFG.apiKey&&DRIVE_CFG.appId);
  const loadScript=src=>new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();
    const s=document.createElement('script');s.src=src;s.async=true;s.onload=res;s.onerror=()=>rej(new Error('Googleに接続できません'));document.head.appendChild(s)});
  async function init(){
    await loadScript('https://accounts.google.com/gsi/client');
    if(!tokClient)tokClient=google.accounts.oauth2.initTokenClient({client_id:DRIVE_CFG.clientId,scope:DRIVE_SCOPE,callback:()=>{}});
  }
  /* ボタンを押した操作の中で呼ぶ（ログイン画面がポップアップで開くため） */
  function token(){
    if(tok&&Date.now()<tokExp-60000)return Promise.resolve(tok);
    return new Promise((res,rej)=>{
      tokClient.callback=r=>{if(r.error)return rej(new Error(r.error==='access_denied'?'ドライブの利用が許可されませんでした':'ログインできませんでした（'+r.error+'）'));
        if(!google.accounts.oauth2.hasGrantedAllScopes(r,DRIVE_SCOPE))return rej(new Error('ドライブのファイルを扱う許可にチェックを入れてください'));
        tok=r.access_token;tokExp=Date.now()+(+r.expires_in||3600)*1000;res(tok)};
      tokClient.error_callback=e=>rej(new Error(e&&e.type==='popup_closed'?'ログインの画面が閉じられました':'ログインの画面を開けませんでした。ポップアップを許可してください'));
      tokClient.requestAccessToken({prompt:''});
    });
  }
  async function api(path,opt={}){
    const t=await token();
    const r=await fetch('https://www.googleapis.com'+path,Object.assign({},opt,{headers:Object.assign({Authorization:'Bearer '+t},opt.headers||{})}));
    if(r.status===401){tok=null;throw new Error('ログインの期限が切れました。もう一度押してください')}
    if(r.status===404)throw new Error('ドライブにファイルが見つかりません（削除されたか、共有が外された可能性があります）');
    if(r.status===403)throw new Error('このファイルを扱う権限がありません（共有の設定で「編集者」になっているか確認してください）');
    if(!r.ok)throw new Error('ドライブとの通信に失敗しました（'+r.status+'）');
    return r;
  }
  async function whoami(){if(user)return user;
    const j=await(await api('/drive/v3/about?fields=user(displayName)')).json();user=j.user||{};return user}
  const META='id,name,version,modifiedTime,lastModifyingUser(displayName),webViewLink';
  async function create(name,text,desc){
    const b='saibai'+Math.random().toString(36).slice(2);
    const body=`--${b}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n`+JSON.stringify({name,mimeType:'application/json',description:desc||''})
      +`\r\n--${b}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n`+text+`\r\n--${b}--`;
    return (await api('/upload/drive/v3/files?uploadType=multipart&fields='+META,{method:'POST',headers:{'Content-Type':'multipart/related; boundary='+b},body})).json();
  }
  async function update(id,text){
    return (await api(`/upload/drive/v3/files/${id}?uploadType=media&fields=${META}`,{method:'PATCH',headers:{'Content-Type':'application/json; charset=UTF-8'},body:text})).json();
  }
  async function meta(id){return (await api(`/drive/v3/files/${id}?fields=${META},trashed`)).json()}
  /* このアプリで作ったファイル（どの端末で作ったものでも）の一覧 */
  async function list(){const q=encodeURIComponent("trashed=false and mimeType='application/json'");
    return ((await(await api(`/drive/v3/files?q=${q}&orderBy=modifiedTime desc&pageSize=50&fields=files(${META})`)).json()).files||[])}
  async function read(id){return (await api(`/drive/v3/files/${id}?alt=media`)).text()}
  /* Googleのファイル選択画面。選んだファイルだけ、このアプリから扱えるようになる */
  async function pick(title){
    const t=await token();
    await loadScript('https://apis.google.com/js/api.js');
    await new Promise((res,rej)=>gapi.load('picker',{callback:res,onerror:()=>rej(new Error('ファイル選択画面を開けません'))}));
    return new Promise(res=>{
      const view=new google.picker.DocsView(google.picker.ViewId.DOCS).setMimeTypes('application/json,text/plain').setMode(google.picker.DocsViewMode.LIST).setIncludeFolders(true);
      const shared=new google.picker.DocsView(google.picker.ViewId.DOCS).setMimeTypes('application/json,text/plain').setMode(google.picker.DocsViewMode.LIST).setOwnedByMe(false);
      const p=new google.picker.PickerBuilder().setOAuthToken(t).setDeveloperKey(DRIVE_CFG.apiKey).setAppId(DRIVE_CFG.appId)
        .addView(view).addView(shared).setTitle(title||'ファイルを選ぶ').setLocale('ja')
        .setCallback(d=>{const a=d[google.picker.Response.ACTION];
          if(a===google.picker.Action.PICKED){const f=d[google.picker.Response.DOCUMENTS][0];res({id:f[google.picker.Document.ID],name:f[google.picker.Document.NAME]})}
          else if(a===google.picker.Action.CANCEL)res(null)}).build();
      p.setVisible(true);
    });
  }
  /* 共有ファイルの仲間（このアプリで作ったファイルだけ扱える） */
  async function members(id){return ((await(await api(`/drive/v3/files/${id}/permissions?fields=permissions(id,type,role,emailAddress,displayName)`)).json()).permissions||[])}
  async function addMember(id,email,msg){return (await api(`/drive/v3/files/${id}/permissions?sendNotificationEmail=true&emailMessage=${encodeURIComponent(msg||'')}&fields=id`,
    {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({role:'writer',type:'user',emailAddress:email})})).json()}
  async function removeMember(id,pid){await api(`/drive/v3/files/${id}/permissions/${pid}`,{method:'DELETE'})}
  function signOut(){if(tok&&window.google&&google.accounts)google.accounts.oauth2.revoke(tok,()=>{});tok=null;user=null}
  return {ready,init,token,whoami,create,update,meta,read,list,members,addMember,removeMember,pick,signOut,signedIn:()=>!!tok&&Date.now()<tokExp};
})();
