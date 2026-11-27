"use strict";
const one = selector => document.querySelector(selector);
const all = selector => [...document.querySelectorAll(selector)];
const languages = Object.entries({RU:"Русский",EN:"English",KK:"Қазақша",ES:"Español",FR:"Français",UZ:"O‘zbek",TK:"Türkmen",AR:"اللغة العربية",EL:"Ελληνικά",HE:"עִברִי",BE:"Беларуская",BG:"Български",TG:"Тоҷикӣ",UK:"Українська",AZ:"Azərbaycan",CS:"Čeština",DA:"Dansk",DE:"Deutsch",IT:"Italiano",HU:"Magyar",PT:"Português",RO:"Română",SL:"Slovenščina",SK:"Slovenčina",SR:"Srpski",FI:"Suomi",SV:"Svenska",TR:"Türkçe",FA:"فارسی",HI:"हिंदी",KA:"Georgian",HY:"Armenian",KO:"한국어",JP:"日本語",ZH:"漢語"});
const available = languages.slice(0,7);
const defaults = {format:"short",mode:"menu",style:"filled",color:"var(--gv-text-label-text-color)",hoverColor:"var(--gv-text-label-text-color)",pressColor:"var(--gv-text-label-text-color)",background:"var(--background-contrast-pale_color)",hoverBg:"var(--background-contrast-pale_hover_color)",pressBg:"var(--background-contrast-pale_active_color)",radius:100,border:false,shadow:false,font:"Inter",fontSize:15,fontStyle:"Основной текст",bold:false,italic:false,underline:false,strike:false,height:28,auto:true,px:2,py:0,mx:0,my:0,multi:false,only:false};
let settings = {...defaults}, saved = {...settings}, selected = ["RU"], screen = "main", phase = "rest", device = "web", view = "default", removed = false, origin;
const panel = one("#settings"), picker = one("#picker"), notice = one("#notice");
const styleNames = {filled:"Кнопка",ghost:"Кнопка",link:"Ссылка",dash:"Ссылка"};
const styleDescriptions={filled:"Кнопка с фоном",ghost:"Кнопка без фона",link:"Ссылка",dash:"Ссылка с подчёркиванием"};
function setStyle(style){
  const isLink=style==="link"||style==="dash";
  Object.assign(settings,{style,background:style==="filled"?defaults.background:"transparent",hoverBg:isLink?"transparent":defaults.hoverBg,pressBg:isLink?"transparent":defaults.pressBg,hoverColor:style==="filled"?settings.color:"var(--gv-text-label-hover-text-color)",pressColor:isLink?"var(--gv-text-label-hover-text-color)":settings.color});
}
const img = (file, alt="") => '<img src="assets/'+file+'.svg" alt="'+alt+'">';
const btn = (label,action,title=label,cls="") => '<button class="'+cls+'" data-action="'+action+'" aria-label="'+title+'" title="'+title+'">'+label+'</button>';
const go = (label,target,cls="") => cls==="arrow" ? btn("","screen:"+target,titles[target],"arrow-button arrow-button--size-m next-setting") : btn(label,"screen:"+target,target==="size"?"Размер":label,cls);
const row = (label,content) => '<div class="row"><span>'+label+'</span><div class="row-editor">'+content+'</div></div>';
const card = content => '<div class="card">'+content+'</div>';
const sw = (key,choices,cls="switch") => '<div class="'+(cls==="switch"?"tumbler tumbler--size-s":cls)+'">'+Object.entries(choices).map(([value,label])=>'<button class="'+(cls==="switch"?"tumbler__item ":"")+(settings[key]===value?"is-selected":"")+'" data-set="'+key+':'+value+'" aria-pressed="'+(settings[key]===value)+'"><span class="tumbler__caption">'+label+'</span></button>').join("")+'</div>';
const check = (key,label) => '<div class="check-row"><label class="checkbox checkbox--outlined checkbox--caption-start"><input class="checkbox__input" type="checkbox" data-field="'+key+'" '+(settings[key]?"checked":"")+'><span class="checkbox__box" aria-hidden="true"></span><span class="checkbox__caption">'+label+'</span></label></div>';
const number = (key,label,min,max) => '<span class="input numeric-field"><span class="input__body"><label class="input__field"><input class="input__control" aria-label="'+label+'" data-field="'+key+'" type="number" inputmode="numeric" min="'+min+'" max="'+max+'" value="'+settings[key]+'"></label></span></span>';
const paletteNames = [["--gv-text-text-color","text"],["--gv-text-contrast-text-color","contrast"],["--gv-text-primary-text-color","primary"],["--gv-text-secondary-text-color","secondary"],["--gv-text-label-text-color","label"],["--gv-text-label-contrast-text-color","label_contrast"],["--gv-text-link-text-color","link"],["--gv-text-danger-text-color","danger"],["--gv-text-success-text-color","success"],["--gv-text-warning-text-color","warning"],["--gv-text-info-text-color","info"],["--gv-background-contrast-pale-color","pale"],["--gv-background-contrast-pale-hover-color","pale_hover"],["--gv-background-contrast-pale-active-color","pale_active"],["--gv-extra-brand-color","brand"]];
const color = (key,label) => '<button class="token-picker" style="--sample:'+settings[key]+'" data-color="'+key+'" aria-label="'+label+'" title="'+label+'"></button>';
const fontPresets={"Основной текст":[15,false],"Усиленный текст":[15,true],"Дополнительный текст":[13,false],"Акцентный текст":[16,false],"Крупный текст":[18,false],"Усиленно-крупный текст":[20,true]};
const fontMenuSizes={"Основной текст":14,"Усиленный текст":15,"Дополнительный текст":12,"Акцентный текст":16,"Крупный текст":18,"Усиленно-крупный текст":20};
const fontFamilies=["Arial","Courier New","Garamond","Georgia","Tahoma","Times New Roman","Verdana","Inter","Oswald","PT Serif","Open Sans","PT Sans"];
const escapeText=value=>String(value).replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char]);
const familyInput=()=>'<span class="input font-family-field"><label class="input__field"><input class="input__control" data-field="font" role="combobox" aria-label="Гарнитура" aria-expanded="false" aria-controls="property-popup" aria-autocomplete="list" value="'+escapeText(settings.font)+'"><span class="family-chevron" aria-hidden="true"></span></label></span>';
const typeTools=()=>'<div class="type-tools">'+Object.entries({bold:["Полужирный","E6C3"],italic:["Курсив","E6C6"],underline:["Подчёркивание","E6CE"],strike:["Зачёркивание","E6CB"]}).map(([key,[label,code]])=>'<button aria-label="'+label+'" data-action="toggle:'+key+'" aria-pressed="'+settings[key]+'"><span aria-hidden="true">&#x'+code+';</span></button>').join("")+'</div>';
const popup=one("#property-popup");
const toolbarPopup=document.createElement("div");
toolbarPopup.id="toolbar-popup";toolbarPopup.setAttribute("popover","manual");toolbarPopup.setAttribute("role","dialog");document.body.append(toolbarPopup);
let toolbarScreen="main",toolbarAnchor=null,propertyAnchor=null;
const editorInstances=new WeakMap();
const editorValues={};
const pgRow=(label,kind)=>'<div class="pg-row"><span>'+label+'</span><div data-editor="'+kind+'"></div></div>';
function backgroundPalette(state){
  const suffix={rest:"",hover:"_hover",press:"_active"}[state];
  return [null,...["unaccented","primary","secondary","pale","danger","success","warning","info"].map(name=>{
    const token="--background-contrast-"+name+suffix+(name==="unaccented"?"_contrast_background-color":"_color");
    return {...parseBackground("var("+token+")"),label:token};
  })];
}
function mountEditors(panel){
  (editorInstances.get(panel)||[]).forEach(editor=>editor.destroy());
  const liveEditors=[];editorInstances.set(panel,liveEditors);
  panel.querySelectorAll("[data-editor]").forEach(host=>{
    if(host.dataset.editor==="size"){
      liveEditors.push(PGEditors.size(host,{
        axes:["h"],min:24,
        value:settings.heightSize||{...PGEditors.defaults.size,h:{mode:settings.auto?"auto":"px",px:settings.height,pct:100}},
        actual:()=>one(".demo .trigger").getBoundingClientRect().height,
        onChange(next){settings.heightSize=next;settings.auto=next.h.mode==="auto";settings.height=next.h.px;syncOtherPanel(panel);paint()}
      }));
      return;
    }
    const kind=host.dataset.editor,key=kind==="background"?{rest:"background",hover:"hoverBg",press:"pressBg"}[phase]:kind;
    const value=editorValues[key]||({...PGEditors.defaults[kind],...(kind==="radius"?{tl:settings.radius,tr:settings.radius,bl:settings.radius,br:settings.radius}:{}),...(kind==="border"?{color:settings.border?"#a39c97":null}:{}),...(kind==="shadow"?{color:"#000000",opacity:settings.shadow?6:0}:{}),...(kind==="background"?parseBackground(settings[key]):{})});
    liveEditors.push(PGEditors[kind](host,{value,...(kind==="background"?{palette:backgroundPalette(phase)}:{}),onChange(next){
      editorValues[key]=next;
      if(kind==="radius"){settings.radius=next.tl;settings.radiusCss=PGEditors.css.radius(next)}
      if(kind==="border"){settings.border=!!next.color;settings.borderCss=PGEditors.css.border(next)}
      if(kind==="shadow"){settings.shadow=!!next.color;settings.shadowCss=next.color?PGEditors.css.shadow(next):"none"}
      if(kind==="background")settings[key]=next.color?PGEditors.css.background(next):"transparent";
      syncOtherPanel(panel);paint();
    }}));
  });
}
function parseBackground(value){
  const token=value.match(/^var\(([^)]+)\)$/)?.[1];
  const hex=token?getComputedStyle(document.documentElement).getPropertyValue(token).trim():value;
  if(hex.startsWith("#"))return {color:hex.slice(0,7),opacity:hex.length===9?Math.round(parseInt(hex.slice(7),16)/255*100):100};
  const channels=hex.match(/^rgba?\(([^)]+)\)$/)?.[1].split(",").map(Number);
  if(channels)return {color:"#"+channels.slice(0,3).map(channel=>channel.toString(16).padStart(2,"0")).join(""),opacity:Math.round((channels[3]??1)*100)};
  return {color:null,opacity:100};
}
const effectButton=(key,title)=>btn(settings[key]?"●":img("img",""),"toggle:"+key,title,"effect-toggle");
function backgroundEditor(key){
  if(settings[key]==="transparent")return '<button class="effect-toggle" data-color="'+key+'" aria-label="Цвет фона">'+img("img","")+'</button>';
  const token=settings[key].slice(4,-1),hex=getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  const opacity=hex.length===9?", "+(parseInt(hex.slice(7),16)/255).toFixed(2):"";
  return '<button class="background-chip" data-color="'+key+'" aria-label="Цвет фона"><i style="background:'+settings[key]+'"></i>'+hex.slice(0,7).toUpperCase()+opacity+'</button>'+btn("","noFill","Убрать фон","close-button close-button--link-button remove-fill");
}
function openProperty(kind,anchor,key="color"){
  propertyAnchor=anchor;
  if(kind==="color"){
    if(popup.matches(":popover-open"))popup.hidePopover();
    const current=parseBackground(settings[key]);
    PGEditors.color(anchor,{...(anchor.closest(".tools")?{dx:0,dy:anchor.getBoundingClientRect().height+4}:{}),default:parseBackground(defaults[key]||settings[key]),title:key.includes("Bg")||key==="background"?"Фон":"Цвет",color:current.color,opacity:current.opacity,background:key.includes("Bg")||key==="background",palette:PGEditors.palettes.text,onApply(value,opacity){
      settings[key]=value?PGEditors.css.rgba(value,opacity):"transparent";
      delete editorValues[key];
      controls();paint();
    }});
    return;
  }
  const choice=(value,label,active,style="")=>'<button data-choice="'+value+'" aria-label="'+label+'" aria-pressed="'+active+'" style="'+style+'">'+label+'</button>';
  popup.dataset.kind=kind;popup.dataset.key=key;popup.setAttribute("aria-label",titles[kind]);
  const toolbarFont=kind==="font"&&!!anchor.closest(".tools");
  popup.classList.toggle("toolbar-font-menu",toolbarFont);
  const close='<button class="popup-close close-button '+(toolbarFont?'close-button--link-button':'close-button--external')+'" aria-label="Закрыть"></button>';
  if(kind==="style"){
    const styles=["ghost","filled","link","dash"].map(value=>'<button class="style-item preview-'+value+'" data-choice="'+value+'" aria-label="'+styleDescriptions[value]+'" aria-pressed="'+(value===settings.style)+'"><span class="style-toggle">'+img(settings.style===value?"font-style-selected":"font-style-empty")+'</span><span class="style-sample">Русский</span></button>');
    const group=label=>'<div class="style-group"><span>'+label+'</span></div>';
    popup.innerHTML=close+group("Кнопка")+'<div class="style-options">'+styles.slice(0,2).join("")+'</div>'+group("Ссылка")+'<div class="style-options">'+styles.slice(2).join("")+'</div>';
  }else if(kind==="font"){
    const item=(value,label,size)=>'<button class="font-style-item" data-choice="'+value+'" aria-label="'+label+'" aria-pressed="'+(settings.fontStyle===value)+'"><span class="font-style-toggle">'+img(settings.fontStyle===value?"font-style-selected":"font-style-empty")+'</span><span class="font-style-caption" style="font-size:'+size+'px">'+label+'</span><span class="style-option-arrow arrow-button arrow-button--size-m" aria-hidden="true"></span></button>';
    popup.innerHTML=close+(toolbarFont?'<div class="font-menu-heading">ШРИФТ</div>':'')+'<div class="font-style-list">'+Object.keys(fontPresets).map(name=>item(name,name,fontMenuSizes[name])).join("")+item("custom","Свой стиль",14)+'</div>';
  }else if(kind==="family"){
    popup.innerHTML=close+fontFamilies.map(name=>choice(name,name,settings.font===name)).join("");
    anchor.setAttribute("aria-expanded","true");
  }else{
    const tokens=["primary","secondary","label","label_contrast","link","danger","success","warning","info","unaccented","text","contrast","pale","brand"];
    const colors=[...paletteNames,["--gv-text-unaccented-text-color","unaccented"]];
    popup.innerHTML=close+'<header>Фон</header><div class="sample"><i style="background:'+settings[key]+'"></i><span>HEX</span><output></output></div><div class="samples">'+tokens.map(name=>{const token=colors.find(entry=>entry[1]===name)[0];return choice(token,name,settings[key]==="var("+token+")","background:var("+token+")")}).join("")+'</div>';
    const token=settings[key].match(/var\(([^)]+)\)/)?.[1];popup.querySelector("output").textContent=token?getComputedStyle(document.documentElement).getPropertyValue(token).trim().toUpperCase():"—";
  }
  if(kind==="color")anchor.setAttribute("aria-expanded","true");
  popup.showPopover();const rect=anchor.getBoundingClientRect();
  popup.style.left=Math.max(4,Math.min(innerWidth-popup.offsetWidth-4,rect.left))+"px";
  popup.style.top=Math.max(4,rect.bottom+popup.offsetHeight+6<=innerHeight?rect.bottom+4:rect.top-popup.offsetHeight-4)+"px";
}
popup.addEventListener("click",event=>{
  const button=event.target.closest("button");if(!button)return;
  if(event.target.closest(".style-option-arrow")){popup.hidePopover();openToolbar("font-editor",toolbarAnchor||propertyAnchor);return}
  const value=button.dataset.choice,kind=popup.dataset.kind;popup.hidePopover();if(!value)return;
  if(kind==="style")setStyle(value);
  if(kind==="family")settings.font=value;
  if(kind==="font"){if(value==="custom"){openToolbar("font-editor",toolbarAnchor||one('.tools [data-screen="font"]'));return}settings.fontStyle=value;[settings.fontSize,settings.bold]=fontPresets[value]}
  if(kind==="color")settings[popup.dataset.key]="var("+value+")";
  controls();paint();
});
popup.addEventListener("toggle",()=>{if(!popup.matches(":popover-open")){all("[data-color][aria-expanded]").forEach(button=>button.removeAttribute("aria-expanded"));one('[role="combobox"][data-field="font"]')?.setAttribute("aria-expanded","false")}});
const select = (key,items) => '<select aria-label="'+({font:"Гарнитура",fontStyle:"Стиль шрифта"})[key]+'" data-field="'+key+'">'+items.map(item=>'<option '+(settings[key]===item?"selected":"")+'>'+item+'</option>').join("")+'</select>';
const stepper = () => '<span class="size-stepper">'+btn('<span class="small-glyph" data-symbol="&#xEAE5;">−</span>',"smaller","Уменьшить размер","mini")+btn('<span class="small-glyph" data-symbol="&#xEADD;">+</span>',"larger","Увеличить размер","mini")+'</span>';
const titles={main:"Выбор языка",appearance:"Оформление",size:"Размер",font:"Шрифт","font-editor":"Основной текст",family:"Гарнитура",color:"Цвет",style:"Стиль",actions:"Дополнительно"};
function updateHeaderState(){
  all(".pe__reset").forEach(reset=>reset.disabled=!settings.heightSize&&!Object.entries(defaults).some(([key,value])=>settings[key]!==value));
}
function controls(){
  renderControls(panel,screen);
  if(toolbarPopup.matches(":popover-open")){renderControls(toolbarPopup,toolbarScreen);positionToolbar()}
  updateToolbar(toolbarPopup.matches(":popover-open")?toolbarAnchor?.dataset.screen:null);
}
function renderControls(panel,screen){
  panel.dataset.screen=screen;
  let content="";
  if(screen==="main"){
    content=card(row("Формат",sw("format",{short:"Сокращённый",full:"Полный"})))+
      card(row("Стиль",go(styleNames[settings.style],"style","pill")+go("›","appearance","arrow"))+row("Цвет",color("color","Цвет текста"))+
      row("Шрифт",go(settings.fontStyle,"font","link"))+row("Размер",stepper()+go("›","size","arrow")))+
      card(row("Открывать",sw("mode",{menu:"Меню",panel:"Панель"}))+check("multi","Разрешить выбор нескольких языков")+check("only","Показывать только доступные языки"));
  } else if(screen==="style"){
    content=card(row("Форма",sw("style",styleNames,"choices"))+go("Оформление →","appearance","link"));
  } else if(screen==="size"){
    content=card('<div data-editor="size"></div>')+
      card("<strong>Отступы</strong>"+row("Внешние",number("mx","Внешний по горизонтали",0,48)+number("my","Внешний по вертикали",0,48))+row("Внутренние",number("px","Внутренний по горизонтали",0,64)+number("py","Внутренний по вертикали",0,48)));
  } else if(screen==="appearance"||screen==="color"){
    const bgKey={rest:"background",hover:"hoverBg",press:"pressBg"}[phase], inkKey={rest:"color",hover:"hoverColor",press:"pressColor"}[phase];
    content='<div class="tabs tabs--style-unaccented tabs--no-border" role="tablist" aria-label="Состояние элемента">'+Object.entries({rest:"В покое",hover:"При наведении",press:"При нажатии"}).map(([key,label])=>'<button class="tabs__item" role="tab" aria-selected="'+(phase===key)+'" data-action="phase:'+key+'"><span class="tabs__caption">'+label+'</span></button>').join("")+'</div>'+
      card(pgRow("Скругления","radius")+pgRow("Границы","border"))+
      card(pgRow("Фон","background")+pgRow("Тень","shadow"))+
      card(row("Шрифт",go(settings.fontStyle,"font","link"))+row("",familyInput()+number("fontSize","Размер шрифта",10,40))+
      typeTools())+card(row("Текст",color(inkKey,"Цвет текста")));
  } else if(screen==="font-editor"){
    content=card(row("",familyInput()+number("fontSize","Размер шрифта",10,40))+typeTools());
  } else content=card(go("Настройки виджета","main")+btn("Сбросить настройки","reset")+btn("Удалить виджет","remove"));
  panel.innerHTML='<div class="pe__head">'+(screen!=="main"?btn('<span class="back__icon"></span>',"screen:main","Назад","back back--size-4xl back--functional-button back--style-default back--icon-primary pe__back"):"")+'<span class="pe__name pe__name--static">'+(screen==="font-editor"?settings.fontStyle:titles[screen])+'</span>'+(screen==="size"?stepper():"")+'<div class="pe__cmds">'+btn('<span class="btn__icon">&#xE629;</span>',"reset","Сбросить настройки","btn btn--link btn--style-secondary btn--icon btn--size-l pe__reset")+btn('<span class="btn__icon">&#xE75E;</span>',"save","Применить","btn btn--filled btn--style-success btn--icon btn--size-l pe__done")+btn("","cancel","Отменить и закрыть","close-button close-button--size-m close-button--link-button pe__close")+'</div></div>'+content;
  panel.classList.add("pe");
  panel.querySelectorAll(".card").forEach(cloud=>{
    if(cloud.querySelector(":scope > .row, :scope > .pg-row"))cloud.classList.add("aligned-properties");
  });
  panel.querySelector(".type-tools")?.closest(".card").classList.add("font-block");
  mountEditors(panel);
  updateHeaderState();
}
function paint(){
  updateHeaderState();
  document.body.dataset.widgetStyle=settings.style;
  const prop=(key,value)=>document.documentElement.style.setProperty("--"+key,value);
  const transparent=settings.style!=="filled";
  const props={ink:settings.color,hoverInk:settings.hoverColor,pressInk:settings.pressColor,fill:transparent?"transparent":settings.background,hover:settings.hoverBg,press:settings.pressBg,round:settings.radius+"px",edge:settings.border?"1px solid currentColor":"none",shade:settings.shadow?"0 2px 8px var(--gv-color-shadow-color-a)":"none",family:settings.font+", Arial, sans-serif",font:settings.fontSize+"px",weight:settings.bold?600:400,italic:settings.italic?"italic":"normal",line:[settings.style==="dash"||settings.underline?"underline":"",settings.strike?"line-through":""].filter(Boolean).join(" ")||"none",high:(settings.auto?Math.max(24,settings.fontSize+13):settings.height)+"px"};
  props.fill=settings.background;
  if(settings.radiusCss)props.round=settings.radiusCss;
  if(settings.borderCss)props.edge="none";
  if(settings.shadowCss)props.shade=settings.shadowCss;
  if(settings.heightSize)props.high=settings.heightSize.h.mode==="auto"?Math.max(24,settings.fontSize+13)+"px":"24px";
  if(settings.style==="ghost")props.weight=600;
  if(["dash","link"].includes(settings.style))props.font=Math.max(10,settings.fontSize-1)+"px";
  for(const key of ["px","py","mx","my"])props[key]=settings[key]+"px";
  Object.entries(props).forEach(([key,value])=>prop(key,value));
  const dimension=settings.heightSize?PGEditors.css.size(settings.heightSize):null;
  all(".trigger").forEach(button=>{
    button.style.height=dimension?dimension.height:"";
    button.style.minHeight=dimension?.minHeight?Math.max(24,settings.heightSize.minH)+"px":"";
    button.style.maxHeight=dimension?.maxHeight||"";
  });
  const label=selected.map(code=>settings.format==="short"?code:languages.find(([id])=>id===code)[1]).join(", ");
  all(".trigger").forEach(button=>{button.textContent=label;if(settings.borderCss)Object.assign(button.style,settings.borderCss);else ["border-style","border-color","border-width"].forEach(key=>button.style.removeProperty(key));button.hidden=removed;button.setAttribute("aria-label","Выбор языка: "+label);button.setAttribute("aria-haspopup","dialog")});
  one("#editor").hidden=removed;one("#restore").hidden=!removed;all(".outline").forEach(box=>box.hidden=removed);
  all("[data-device]").forEach(button=>button.setAttribute("aria-pressed",button.dataset.device===device));
  all("[data-view]").forEach(input=>{input.checked=input.value===view;input.closest(".df-radio").classList.toggle("is-on",input.checked)});
  one(".demo").classList.toggle("mobile",device==="mobile");one(".demo").classList.toggle("store",view==="store");one(".demo h2").textContent=view==="store"?"Превью в магазине":"Demo";
}
function openSettings(name){screen=name;panel.hidden=false;one("#reopen").hidden=true;controls()}
function syncOtherPanel(source){
  if(source!==panel)renderControls(panel,screen);
  else if(toolbarPopup.matches(":popover-open")){renderControls(toolbarPopup,toolbarScreen);positionToolbar()}
}
function positionToolbar(){
  if(!toolbarAnchor)return;
  const rect=toolbarAnchor.getBoundingClientRect();
  toolbarPopup.style.left=Math.max(4,Math.min(innerWidth-toolbarPopup.offsetWidth-4,rect.left))+"px";
  toolbarPopup.style.top=Math.max(4,Math.min(innerHeight-toolbarPopup.offsetHeight-4,rect.bottom+4))+"px";
}
function closeToolbar(){
  if(toolbarPopup.matches(":popover-open"))toolbarPopup.hidePopover();
  updateToolbar(null);
}
function openToolbar(name,anchor){
  toolbarAnchor=anchor;toolbarScreen=name;
  renderControls(toolbarPopup,name);toolbarPopup.setAttribute("aria-label",titles[name]||settings.fontStyle);
  toolbarPopup.showPopover();positionToolbar();updateToolbar(anchor.dataset.screen);
}
document.addEventListener("pointerdown",event=>{
  if(!event.target.closest("#toolbar-popup,#property-popup,.pge-pop,.tools"))closeToolbar();
});
document.addEventListener("keydown",event=>{
  if(event.key==="Escape"&&!popup.matches(":popover-open")&&!event.target.closest(".pge-pop"))closeToolbar();
});
function updateToolbar(active){
  all(".tools [data-screen]").forEach(button=>button.setAttribute("aria-pressed",button.dataset.screen==="main"||button.dataset.screen===active));
}
function hideSettings(){panel.hidden=true;one("#reopen").hidden=removed;updateToolbar(null)}
function removeWidget(){removed=true;hideSettings();paint();one("#restore").focus()}
function act(action,source=panel){
  const [kind,value]=action.split(":");
  if(source===toolbarPopup){
    if(kind==="screen"&&toolbarScreen==="font-editor"){closeToolbar();openProperty("font",toolbarAnchor);return}
    if(kind==="screen")return openToolbar(value,toolbarAnchor);
    if(kind==="save"){saved={...settings};closeToolbar();return}
    if(kind==="cancel"){closeToolbar();return}
  }
  if(kind==="screen")return openSettings(value);
  if(kind==="phase")phase=value;
  if(kind==="reset"){settings={...defaults};selected=["RU"];Object.keys(editorValues).forEach(key=>delete editorValues[key])}
  if(kind==="save"){saved={...settings};hideSettings()}
  if(kind==="cancel"){settings={...saved};if(!settings.multi)selected=selected.slice(0,1);hideSettings()}
  if(kind==="remove")return removeWidget();
  if(kind==="heightMode")settings.auto=!settings.auto;
  if(kind==="toggle")settings[value]=!settings[value];
  if(kind==="noFill")settings[{rest:"background",hover:"hoverBg",press:"pressBg"}[phase]]="transparent";
  if(kind==="larger"||kind==="smaller"){const delta=kind==="larger"?1:-1;settings.fontSize=Math.min(40,Math.max(10,settings.fontSize+delta));settings.height=Math.min(200,Math.max(24,settings.height+delta*2))}
  controls();paint();
}
document.addEventListener("click",event=>{
  if(event.target.closest(".pge-pop"))return;
  const button=event.target.closest("button");if(!button)return;
  if(button.closest(".tools")&&button.dataset.screen){
    const kind=button.dataset.screen;
    if(kind==="main"||kind==="actions")return;
    closeToolbar();toolbarAnchor=button;
    if(kind==="appearance")openProperty("style",button);
    else if(kind==="font")openToolbar("font-editor",button);
    else if(kind==="color")openProperty("color",button);
    else openToolbar(kind,button);
    return;
  }
  const target=button.dataset.screen||button.dataset.action?.replace(/^screen:/,"");
  if(button.dataset.color||["style","font","color"].includes(target)){
    openProperty(button.dataset.color?"color":target,button,button.dataset.color);return;
  }
  if(button.dataset.action)act(button.dataset.action,button.closest("#toolbar-popup")||panel);
  if(button.dataset.screen)openSettings(button.dataset.screen);
  if(button.dataset.set){const [key,value]=button.dataset.set.split(":");settings[key]=value;controls();paint()}
  if(button.dataset.device){device=button.dataset.device;paint()}
  if(button.classList.contains("trigger")){origin=button;openPicker(device==="mobile"?"panel":settings.mode)}
  if(button.id==="remove")removeWidget();
  if(button.id==="restore"){removed=false;openSettings("main");paint()}
  if(button.id==="reopen")openSettings("main");
});
one("[role=radiogroup]").addEventListener("change",event=>{view=event.target.value;openSettings(["size","appearance"].includes(view)?view:"main");paint()});
[panel,toolbarPopup].forEach(panel=>{
panel.addEventListener("input",event=>{
  const field=event.target,key=field.dataset.field;if(!key)return;
  if(field.type==="number"&&(!field.value||!field.validity.valid))return;
  settings[key]=field.type==="checkbox"?field.checked:field.type==="number"?Number(field.value):field.value;
  if(field.closest(".token-picker"))field.closest(".token-picker").style.setProperty("--sample",settings[key]);
  if(key==="background"&&settings.style==="ghost")settings.style="filled";
  if(key==="height")settings.auto=false;
  if(key==="fontStyle"){const [size,bold]=fontPresets[field.value];settings.fontSize=size;settings.bold=bold;controls()}
  if(key==="multi"&&!settings.multi)selected=selected.slice(0,1);
  syncOtherPanel(panel);
  paint();
});
panel.addEventListener("change",event=>{if(event.target.type==="number")controls()});
panel.addEventListener("click",event=>{
  if(event.target.matches('input[data-field="font"]'))openProperty("family",event.target);
});
panel.addEventListener("keydown",event=>{
  const field=event.target;
  if(!field.matches('input[data-field="font"]'))return;
  if(event.key==="ArrowDown"){
    event.preventDefault();
    if(!popup.matches(":popover-open"))openProperty("family",field);
    popup.querySelector("button[data-choice]:not([hidden])")?.focus({preventScroll:true});
  }
  if(event.key==="Enter"&&popup.matches(":popover-open"))popup.hidePopover();
});
if(panel.id==="settings")popup.addEventListener("keydown",event=>{
  if(popup.dataset.kind!=="family"||!["ArrowDown","ArrowUp"].includes(event.key))return;
  const choices=[...popup.querySelectorAll("button[data-choice]:not([hidden])")];
  if(!choices.length)return;
  event.preventDefault();
  const index=choices.indexOf(document.activeElement);
  choices[(index+(event.key==="ArrowDown"?1:-1)+choices.length)%choices.length].focus({preventScroll:true});
});
panel.addEventListener("input",event=>{
  if(event.target.dataset.field==="font"&&popup.matches(":popover-open")&&popup.dataset.kind==="family"){
    const query=event.target.value.toLocaleLowerCase();
    popup.querySelectorAll("[data-choice]").forEach(button=>button.hidden=!button.dataset.choice.toLocaleLowerCase().includes(query));
  }
});
panel.addEventListener("keydown",event=>{
  const field=event.target;
  if(!field.matches('input[type="number"][data-field]')||field.disabled||field.readOnly||!["ArrowUp","ArrowDown"].includes(event.key))return;
  event.preventDefault();
  const step=field.step&&field.step!=="any"?Number(field.step):1;
  const next=(Number(field.value)||0)+(event.key==="ArrowUp"?step:-step);
  field.value=Math.min(field.max===""?Infinity:Number(field.max),Math.max(field.min===""?-Infinity:Number(field.min),next));
  field.dispatchEvent(new Event("input",{bubbles:true}));
});
});
function openPicker(mode){
  const menu=mode==="menu",items=menu||settings.only?available:languages;
  picker.className=mode+(device==="mobile"?" mobile":"");picker.removeAttribute("style");
  picker.classList.toggle("multiple",settings.multi);
  picker.innerHTML='<header>'+(menu?"":"<strong>Выбор языка</strong>")+'<button class="x close-button '+(menu?"close-button--external":"close-button--link-button")+'" aria-label="Закрыть"></button></header><div class="langs">'+items.map(([code,label])=>'<button data-code="'+code+'" aria-pressed="'+selected.includes(code)+'"><b>'+code+'</b><span dir="auto">'+label+'</span></button>').join("")+'</div>'+(menu?'<button class="more" aria-label="Все языки">•••</button>':"");
  if(!picker.open)picker.showModal();
  if(menu){const anchor=origin.getBoundingClientRect(),width=picker.offsetWidth,height=picker.offsetHeight;picker.style.left=Math.max(4,Math.min(anchor.left,innerWidth-width-4))+"px";picker.style.top=Math.max(4,anchor.bottom+height+4<=innerHeight?anchor.bottom+4:anchor.top-height-4)+"px"}
  picker.querySelector('[aria-pressed="true"]')?.focus({preventScroll:true});
}
picker.addEventListener("click",event=>{
  const button=event.target.closest("button");
  if(!button){if(event.target===picker){const box=picker.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)picker.close()}return}
  if(button.classList.contains("x"))return picker.close();
  if(button.classList.contains("more"))return openPicker("panel");
  const code=button.dataset.code;
  if(!available.some(([id])=>id===code)){one("#notice h3").textContent=languages.find(([id])=>id===code)[1]+" — язык пока недоступен";notice.showModal();return}
  if(settings.multi){if(!selected.includes(code))selected.push(code);else if(selected.length>1)selected=selected.filter(id=>id!==code);button.setAttribute("aria-pressed",selected.includes(code))}
  else{selected=[code];picker.close()}paint();
});
one("#notice button").onclick=()=>notice.close();
picker.addEventListener("close",()=>origin?.focus({preventScroll:true}));
controls();paint();
document.fonts.load("14px WidgetIconsSmall").then(faces=>{if(faces.length)document.documentElement.classList.add("has-small-icons")}).catch(()=>{});
document.fonts.load("24px WidgetIcons").then(faces=>{if(faces.length)document.documentElement.classList.add("has-icons")}).catch(()=>{});
