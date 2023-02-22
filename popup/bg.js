var $btnEnable=document.getElementById('btn_enable'),
    $btnDisable=document.getElementById('btn_disable'),
    $kindleConfig=document.getElementById('kindleConfig'),
    $btnTextSelect=document.getElementById('btn_textSelect'),
    $btnTextSelectConsole=document.getElementById('btn_textSelect_console'),
    $btnBodyBlack=document.getElementById('btn_bodyBlack');
function ruleStatusCheck(reloadTab){
  chrome.declarativeNetRequest.getDynamicRules(rules => {
    var ruleIds=rules.map((v)=>{
      return v.id
    });
    var ruleIsEnable=ruleIds.indexOf(1)>=0
    if(ruleIsEnable){
      $btnEnable.className="active"
      $btnDisable.className=""
      $kindleConfig.style.display='';
      textSelectStatusCheck();
      bodyThemeStatusCheck();
    }else{
      $btnEnable.className=""
      $btnDisable.className="active"
      $kindleConfig.style.display='none';
    }
    console.log("getDynamicRules", rules)
    chrome.storage.local.set({ ruleIsEnable }).then(() => {
      reloadTab && chrome.runtime.sendMessage({action:'activeTabReload'})
    });
    
  });
}
function bodyThemeStatusCheck(){
  chrome.storage.local.get(['bodyTheme'], function(result) {
    switch(result.bodyTheme){
      case 'black':
        $btnBodyBlack.className="active"
        break;
      default:
        $btnBodyBlack.className=""
    }
  });
}
function textSelectStatusCheck(){
  chrome.storage.local.get(['textSelectIsEnable'], function(result) {
    console.log('textSelectStatusCheck',result)
    if(result.textSelectIsEnable){
      $btnTextSelect.className="active"
      $btnTextSelectConsole.style.display='';
    }else{
      $btnTextSelect.className=""
      $btnTextSelectConsole.style.display='none';
    }
  });
}
ruleStatusCheck();
var dRules={
  "removeRuleIds": [1,2],
  "addRules": [],
};
var ruleTemplate={
  "priority": 9999999,
  "action": {
    "type": "modifyHeaders",
    "requestHeaders": [
      {
        "operation": "set",
        "header": "user-agent",
        "value": 'Mozilla/5.0 (X11; U; Linux armv7l like Android; en-us) AppleWebKit/531.2+ (KHTML, like Gecko) Version/5.0 Safari/533.2+ Kindle/3.0+',
      }
    ]
  },
  "condition": {
    "resourceTypes": [
      "main_frame",
      "sub_frame",
      "stylesheet",
      "script",
      "image",
      "font",
      "object",
      "xmlhttprequest",
      "ping",
      "csp_report",
      "media",
      "websocket",
      "webtransport",
      "webbundle",
      "other"
    ]
  }
}
dRules.addRules.push(JSON.parse(JSON.stringify(ruleTemplate)),JSON.parse(JSON.stringify(ruleTemplate)));

//拦截所有微信读书域名的请求
dRules.addRules[0].id=1;
// dRules.addRules[0].condition.domains=[];
dRules.addRules[0].condition.urlFilter='|https://weread.qq.com*';

//拦截所有微信读书网页发起的请求
dRules.addRules[1].id=2;
dRules.addRules[1].condition.domains=["weread.qq.com"];
dRules.addRules[1].condition.urlFilter='*';

$btnEnable.onclick = function () {
  chrome.runtime.sendMessage({
    action: 'declarativeNetRequestUpdateRules',
    payload: {
      "removeRuleIds": dRules.removeRuleIds,
      "addRules": dRules.addRules
    }
  }).then((res)=>{
    ruleStatusCheck(true)
  })
}
$btnDisable.onclick = function () {
  chrome.runtime.sendMessage({
    action: 'declarativeNetRequestUpdateRules',
    payload: {
      "removeRuleIds": dRules.removeRuleIds,
    }
  }).then((res)=>{
    ruleStatusCheck(true)
  })
}
function textSelectStatusChange(){
  chrome.storage.local.get(['textSelectIsEnable'], function(result) {
    chrome.storage.local.set({ textSelectIsEnable:!result.textSelectIsEnable }).then(() => {
      chrome.runtime.sendMessage({action:'activeTabReload'})
      textSelectStatusCheck()
    });
  });
}
textSelectStatusCheck();
$btnTextSelect.onclick = function () {
  textSelectStatusChange();
}
$btnBodyBlack.onclick = function () {
  chrome.storage.local.get(['bodyTheme'], function(result) {
    var targetTheme=result.bodyTheme!=='black'?'black':''
    chrome.storage.local.set({ bodyTheme:targetTheme }).then(() => {
      chrome.runtime.sendMessage({action:'activeTabReload'})
      bodyThemeStatusCheck()
    });
  });
} 