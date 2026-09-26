/* 教师修改文案：优先编辑 STORIES 与 SUMMARY 中的文字。所有数据保存在本页运行内存，刷新即重置。 */
const STORIES = {
  xiao: {
    name: '小王', role: '政府财政工作人员', image: 'assets/xiao-wang.png',
    title: '第一份财政方案',
    situation: '当地准备建设大型光热电站。项目有长期价值，但前期投入大、回本慢，财政压力和社会质疑同时出现。',
    cue: '项目建设需要持续投入。\n面对财政压力，小王必须提出自己的意见。',
    choices: [
      '短期投入太大，先暂停项目，把资金投向见效更快的领域。',
      '可以继续支持，但必须压缩投入，尽快看到经济收益。',
      '不能只算眼前账。在充分论证、控制风险的基础上，看到长期生态价值和社会价值。'
    ],
    branches: {
      A: {mode:'paused', visual:'建设暂缓 · 镜场暗下', results:['财政压力暂时缓解。','几年后，能源转型项目重新启动。','当地已错过部分产业和技术积累机会。'], question:'他的判断，更重视什么？', keywords:['短期现实收益','长期社会发展']},
      B: {mode:'limited', visual:'工程继续 · 研发投入缩减', results:['项目保住了。','为尽快见效，一些长期技术研发被压缩。','短期数据改善，后续发展能力受到影响。'], question:'评价一种选择，只看眼前结果够吗？'},
      C: {mode:'supported', visual:'共同论证 · 评估风险 · 分阶段推进', results:['政府没有忽视财政压力。','风险评估后，项目继续得到支持。','技术逐步成熟，生态、能源和产业效益开始显现。'], question:'同样面对财政压力，为什么会作出不同判断？'}
    },
    concept: '价值观影响人们对事物的认识和评价，\n影响人们改造世界的活动和行为选择。'
  },
  li: {
    name: '李勇', role: '科研团队核心成员', image: 'assets/li-yong.png',
    title: '一封新的邀请',
    situation: '项目进入攻坚阶段：实验受挫，工作艰苦，前景尚不明朗。此时，一封邀请发到了李勇的手机上。',
    cue: '大城市科研机构邀请李勇加入：\n薪酬更高，环境更好，项目也更成熟。',
    choices: [
      '先离开这里。个人发展机会不能错过。',
      '暂时留下，先看看项目还有没有成功可能。',
      '项目正处于最需要人的时候。只要仍有技术突破的可能，我愿意继续留下来。'
    ],
    branches: {
      A: {mode:'city', visual:'新的工作 · 原团队出现空缺', results:['他的收入提高了。','工作环境也更加稳定。','原团队需要重新寻找核心技术人员。','项目进度因此受到影响。'], question:'评价一个人的人生价值，能不能只看他得到了什么？'},
      B: {mode:'limited', visual:'继续参与 · 攻关负责人尚未稳定', results:['他没有立即离开。','他一边准备其他岗位，一边参与项目。','最困难的攻关任务缺少稳定负责人，项目在犹豫中推进。'], question:'价值选择是否意味着必须面对取舍？'},
      C: {mode:'night', visual:'夜间调试 · 重新计算 · 镜场再点亮', results:['又一次实验失败。','重新计算。','再次调试。','技术问题逐步被攻克。','多年以后，数万面定日镜在戈壁上同时转向太阳。'], question:'李勇获得了什么？', keywords:['个人收入','职业发展','社会贡献']}
    },
    concept: '人的价值主要在于对社会的贡献。',
    note: '人的价值是社会价值和自我价值的统一。'
  }
};

const state = {screen:'intro',introStep:0,role:null,phase:null,branch:null,resultIndex:0,completed:{xiao:false,li:false},balanceSeen:{xiao:false,li:false},balancePhase:0,summaryStep:0,selectedKeywords:[],history:[]};
const $ = id => document.getElementById(id);
const stage=$('stage'), panel=$('storyPanel'), wide=$('widePanel'), left=$('leftControls'), right=$('rightControls');
let introTimers=[];
function clearIntroTimers(){introTimers.forEach(clearTimeout);introTimers=[]}
function snapshot(){const {history,...rest}=state;return JSON.parse(JSON.stringify(rest))}
function commit(fn){state.history.push(snapshot());fn();render()}
function back(){if(!state.history.length)return;clearIntroTimers();Object.assign(state,state.history.pop());render()}
function btn(label,action,kind='ghost'){return `<button type="button" class="${kind}" data-action="${action}">${label}</button>`}
function safe(text){return String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function clearView(){panel.innerHTML='';wide.innerHTML='';$('introCaption').innerHTML='';$('sceneLabel').textContent='';$('visualNotes').textContent='';$('character').classList.remove('visible');$('character').removeAttribute('src');$('character').alt='';left.innerHTML='';right.innerHTML='';stage.dataset.mode='normal';$('progress').textContent=''}
function setCharacter(role){const s=STORIES[role],im=$('character');im.src=s.image;im.alt=`${s.role}${s.name}，源自《详解.docx》`;im.classList.add('visible')}
function setControls(mainLabel,mainAction){left.innerHTML=state.history.length?btn('上一步','back'):'';let parts=[];if(state.screen==='role'){parts.push(btn('重新选择','rechoose'));parts.push(btn('返回角色','chooser'));if(mainLabel)parts.push(btn(mainLabel,mainAction,'action'))}else if(state.screen==='balance'||state.screen==='summary'){parts.push(btn('返回角色','chooser'));if(mainLabel)parts.push(btn(mainLabel,mainAction,'action'))}else if(state.screen==='chooser'){if(mainLabel)parts.push(btn(mainLabel,mainAction,'action'))}else if(mainLabel){parts.push(btn(mainLabel,mainAction,'action'))}right.innerHTML=parts.join('')}
function renderIntro(){stage.dataset.mode='intro';$('sceneLabel').textContent='故事导入 · 光热电站';$('progress').textContent='导入';const captions=['戈壁的清晨','数万面定日镜缓缓转向太阳','光线汇聚，吸热塔点亮','如果一项事业，\n今天投入巨大，\n明天未必立即见效，\n但可能改变未来，\n你会如何选择？'];$('introCaption').textContent=captions[Math.min(state.introStep,3)];if(state.introStep>=3){$('introCaption').innerHTML=`${safe(captions[3]).replace(/\n/g,'<br>')}<div>${btn('进入故事','chooser','action')}</div>`;setControls('进入故事','chooser')}else setControls('下一步','introNext')}
function startIntro(){render();[2300,4700,7100].forEach((ms,i)=>introTimers.push(setTimeout(()=>{if(state.screen==='intro'&&state.introStep===i){state.introStep++;render()}},ms)))}
function renderChooser(){stage.dataset.mode='supported';$('sceneLabel').textContent='请选择观察视角';$('progress').textContent=`已体验 ${Number(state.completed.xiao)+Number(state.completed.li)} / 2 个角色`;wide.innerHTML=`<div class="eyebrow">一项工程 · 两个位置</div><h2>你要先帮助谁作决定？</h2><div class="role-grid"><button class="role-card xiao ${state.completed.xiao?'done':''}" data-action="openXiao"><strong>政府视角：小王</strong><span>财政压力下，如何判断项目价值？${state.completed.xiao?' · 已体验':''}</span></button><button class="role-card li ${state.completed.li?'done':''}" data-action="openLi"><strong>科研人员视角：李勇</strong><span>个人机会面前，如何作出职业选择？${state.completed.li?' · 已体验':''}</span></button></div>`;setControls(state.completed.xiao&&state.completed.li?'进入总结':null,'balance')}
function renderRole(){const s=STORIES[state.role];setCharacter(state.role);$('sceneLabel').textContent=`${state.role==='xiao'?'第一幕':'第二幕'} · ${s.role}${s.name}`;$('progress').textContent=`${s.name} / ${({situation:'情境',cue:'矛盾',choice:'选择',result:'结果',question:'追问',reveal:'概念'})[state.phase]}`;let mode='normal';if(state.phase==='result'||state.phase==='question'||state.phase==='reveal')mode=s.branches[state.branch].mode;stage.dataset.mode=mode;
  if(state.phase==='situation'){panel.innerHTML=`<div class="eyebrow">${safe(s.role)}</div><h2>${safe(s.title)}</h2><p class="body-copy">${safe(s.situation)}</p>`;$('visualNotes').textContent=state.role==='xiao'?'生态效益与长期发展价值明显，建设初期却面临资金压力。':'技术瓶颈、实验失败与社会质疑，都还没有答案。';setControls('下一步','next')}
  if(state.phase==='cue'){panel.innerHTML=`<div class="eyebrow">现实矛盾</div><h2>${safe(s.title)}</h2><p class="body-copy">${safe(s.cue)}</p>`;$('visualNotes').textContent=state.role==='li'?'手机来信：更高薪酬 · 更好环境 · 更成熟的项目':'财政意见即将提交。';setControls('下一步','next')}
  if(state.phase==='choice'){panel.innerHTML=`<div class="eyebrow">请作出选择</div><h2>${safe(s.title)}</h2><div class="choice-list">${s.choices.map((t,i)=>`<button type="button" class="choice" data-action="choose${'ABC'[i]}"><span class="letter">${'ABC'[i]}</span><span>${safe(t)}</span></button>`).join('')}</div>`;$('visualNotes').textContent='先看行为后果，再讨论判断依据。';setControls(null,null)}
  if(state.phase==='result'){const b=s.branches[state.branch];const idx=state.resultIndex;if(state.role==='li'&&state.branch==='C'&&idx===b.results.length-1)stage.dataset.mode='breakthrough';$('visualNotes').textContent=b.visual;panel.innerHTML=`<div class="eyebrow">选择 ${state.branch} · 发展结果 ${idx+1}/${b.results.length}</div><h2>${idx===0?'接下来发生了什么？':'事情继续发展'}</h2><p class="body-copy">${safe(b.results[idx])}</p>`;setControls('下一步','next')}
  if(state.phase==='question'){const b=s.branches[state.branch];$('visualNotes').textContent=b.visual;let keywords='';if(b.keywords){keywords=`<div class="keyword-row">${b.keywords.map((t,i)=>`<button type="button" class="keyword ${state.selectedKeywords.includes(i)?'active':''} ${t==='社会贡献'?'social':''}" data-action="keyword${i}">${safe(t)}</button>`).join('')}</div>`}panel.innerHTML=`<div class="eyebrow">课堂追问</div><h2>${safe(b.question)}</h2>${keywords}<p class="small-note" id="keywordHint">${state.role==='xiao'&&state.branch==='A'&&state.selectedKeywords.length?'这个选择优先考虑眼前财政效果；还可以继续讨论长期影响。':''}</p><div>${btn('重新体验另一种选择','rechoose')}</div>`;setControls(state.role==='xiao'&&state.branch==='C'?'继续思考':'揭示知识','reveal')}
  if(state.phase==='reveal'){const b=s.branches[state.branch];$('visualNotes').textContent=b.visual;panel.innerHTML=`<div class="eyebrow">教师揭示 · 知识生成</div><h2>${state.role==='xiao'?'判断背后的导向':'怎样衡量人的价值？'}</h2><p class="body-copy reveal">${safe(s.concept)}</p>${s.note?`<p class="small-note">${safe(s.note)}</p>`:''}<div>${btn('重新体验另一种选择','rechoose')}</div>`;setControls(state.completed.xiao&&state.completed.li?'进入总结':'进入下一幕','nextAct')}
}
function renderBalance(){stage.dataset.mode='supported';$('sceneLabel').textContent='两个故事 · 价值天平';$('progress').textContent='综合讨论';if(state.balancePhase===0){wide.innerHTML=`<div class="eyebrow">现实选择的代价与依据</div><h2>价值天平</h2><div class="balance-grid"><div class="balance-side"><span>眼前利益</span><span>个人利益</span><span>经济成本</span><span>现实压力</span></div><div class="balance-icon"></div><div class="balance-side right"><span>长远发展</span><span>社会利益</span><span>生态价值</span><span>社会贡献</span></div></div><p class="body-copy">现实选择往往有代价。我们依据什么标准判断和取舍？</p><div class="balance-question-row" style="margin-top:2vh">${btn('小王为什么会有不同选择？','balanceXiao','question-link')}${btn('李勇为什么会有不同选择？','balanceLi','question-link')}</div><p class="small-note" id="balanceAnswer"></p>`;setControls(state.balanceSeen.xiao&&state.balanceSeen.li?'下一步':null,'balanceNext')}
else if(state.balancePhase===1){wide.innerHTML=`<div class="eyebrow">从故事回到共同问题</div><p class="prompt-line">面对同一件事，\n人们可能作出不同的认识、评价和选择。\n在这些判断背后，\n发挥导向作用的正是——</p>`;setControls('下一步','balanceNext')}else{wide.innerHTML=`<div class="eyebrow">概念生成</div><div class="final-word">价值观</div>`;setControls('进入知识归纳','summary')}}
function renderSummary(){stage.dataset.mode='supported';$('sceneLabel').textContent='知识归纳';$('progress').textContent='第六课 第一框';const steps=['看见问题','作出判断','作出选择','付诸行动'],concepts=['价值观','影响认识和评价','影响行为选择','影响人生道路'];const n=Math.min(state.summaryStep+1,4);wide.innerHTML=`<div class="eyebrow">回看故事中的动作</div><h2>从选择中认识价值观</h2><div class="flow-grid"><div class="flow-col"><strong>人物的行动</strong>${steps.slice(0,n).map((x,i)=>`<span>${x}</span>${i<n-1?'<b>↓</b>':''}`).join('')}</div><div class="flow-col"><strong>价值观的作用</strong>${concepts.slice(0,n).map((x,i)=>`<span>${x}</span>${i<n-1?'<b>↓</b>':''}`).join('')}</div></div>${state.summaryStep>=4?'<div class="knowledge-list"><p>1. 价值观对人们认识和改造世界的活动具有重要导向作用。</p><p>2. 价值观是人生的重要向导。</p><p>3. 人的价值主要在于对社会的贡献。</p></div>':''}`;setControls(state.summaryStep<4?'下一步':'重新开始',state.summaryStep<4?'summaryNext':'restart')}
function render(){clearView();if(state.screen==='intro')renderIntro();else if(state.screen==='chooser')renderChooser();else if(state.screen==='role')renderRole();else if(state.screen==='balance')renderBalance();else renderSummary()}
function handle(action){if(action==='back'){back();return}if(action==='introNext'){clearIntroTimers();commit(()=>state.introStep=Math.min(3,state.introStep+1));return}if(action==='chooser'){commit(()=>{state.screen='chooser';state.role=null;state.phase=null});return}if(action==='openXiao'||action==='openLi'){commit(()=>{state.screen='role';state.role=action==='openXiao'?'xiao':'li';state.phase='situation';state.branch=null;state.resultIndex=0;state.selectedKeywords=[]});return}if(action==='next'){commit(()=>{if(state.phase==='situation')state.phase='cue';else if(state.phase==='cue')state.phase='choice';else if(state.phase==='result'){const b=STORIES[state.role].branches[state.branch];if(state.resultIndex<b.results.length-1)state.resultIndex++;else state.phase='question'}});return}if(action.startsWith('choose')){const which=action.at(-1);if(state.phase!=='choice'||!STORIES[state.role].branches[which])return;commit(()=>{state.branch=which;state.resultIndex=0;state.selectedKeywords=[];state.phase='result'});return}if(action.startsWith('keyword')){const i=Number(action.slice(7));if(state.phase!=='question')return;commit(()=>{if(!state.selectedKeywords.includes(i))state.selectedKeywords.push(i)});return}if(action==='reveal'){if(state.phase!=='question')return;commit(()=>{state.phase='reveal';state.completed[state.role]=true});return}if(action==='rechoose'){if(state.screen!=='role')return;commit(()=>{state.phase='choice';state.branch=null;state.resultIndex=0;state.selectedKeywords=[]});return}if(action==='nextAct'){commit(()=>{state.screen=state.completed.xiao&&state.completed.li?'balance':'chooser';state.role=null;state.phase=null;if(state.screen==='balance'){state.balancePhase=0;state.balanceSeen={xiao:false,li:false}}});return}if(action==='balance'){if(!(state.completed.xiao&&state.completed.li))return;commit(()=>{state.screen='balance';state.balancePhase=0;state.balanceSeen={xiao:false,li:false}});return}if(action==='balanceXiao'||action==='balanceLi'){const role=action==='balanceXiao'?'xiao':'li';state.balanceSeen[role]=true;const answer=$('balanceAnswer');answer.textContent=role==='xiao'?'小王面对同一项目，对财政成本、生态效益和长远发展的权衡不同。':'李勇面对同一邀请，对个人发展和社会贡献的权衡不同。';setControls(state.balanceSeen.xiao&&state.balanceSeen.li?'下一步':null,'balanceNext');return}if(action==='balanceNext'){commit(()=>{state.balancePhase=Math.min(2,state.balancePhase+1)});return}if(action==='summary'){commit(()=>{state.screen='summary';state.summaryStep=0});return}if(action==='summaryNext'){commit(()=>{state.summaryStep=Math.min(4,state.summaryStep+1)});return}if(action==='restart'){location.reload()}}
document.addEventListener('click',e=>{const b=e.target.closest('button[data-action]');if(b)handle(b.dataset.action)});
function createMirrors(){const field=$('mirrorField');for(let row=0;row<5;row++){for(let col=0;col<16;col++){const m=document.createElement('i');m.className='mirror';m.style.left=`${col*6.2+(row%2)*2.8-2}%`;m.style.top=`${row*17+7}%`;m.style.transform=`scale(${.58+row*.12}) skew(-13deg) rotate(-5deg)`;field.appendChild(m)}}}
createMirrors();startIntro();
