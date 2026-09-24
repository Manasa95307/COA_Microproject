const $ = (id) => document.getElementById(id);

const state = {
  level: 1,
  score: 0,
  lives: 3,
  correct: 0,
  attempts: 0,
  hintUsed: false,
  challenge: null,
  match: { cards: [], flipped: [], matched: 0, locked: false }
};

const levelInfo = {
  1: {title:"Binary Lab", desc:"Convert binary security codes into decimal values.", progress:20},
  2: {title:"Conversion Tunnel", desc:"Identify the missing base and crack the conversion.", progress:40},
  3: {title:"Four-Way Converter", desc:"Move values between Decimal, Binary, Octal and Hexadecimal.", progress:60},
  4: {title:"Glitch Hunt", desc:"Find the one corrupted representation in the system.", progress:80},
  5: {title:"Memory Match", desc:"Match equivalent values and recover the master code.", progress:100}
};

function showScreen(id){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  $(id).classList.add("active");
  window.scrollTo({top:0,behavior:"smooth"});
}

function updateStats(){
  $("levelStat").textContent = state.level;
  $("scoreStat").textContent = state.score;
  $("livesStat").textContent = "♥".repeat(state.lives) + "♡".repeat(3-state.lives);
  const info = levelInfo[state.level];
  $("missionTitle").textContent = info.title;
  $("missionDesc").textContent = info.desc;
  $("progressBar").style.width = info.progress + "%";
  $("progressText").textContent = info.progress + "%";
}

function startGame(){
  state.level=1; state.score=0; state.lives=3; state.correct=0; state.attempts=0;
  updateStats(); showScreen("game"); loadLevel();
}

function resetGame(){
  if(confirm("Reset the game and lose your current score?")) startGame();
}

function nextLevel(){
  if(state.level < 5){
    state.level++;
    state.hintUsed=false;
    updateStats();
    setTimeout(loadLevel,250);
  }else{
    $("finalScore").textContent=state.score;
    const acc=state.attempts?Math.round(state.correct/state.attempts*100):100;
    $("finalAccuracy").textContent=acc+"%";
    showScreen("complete");
  }
}

function loadLevel(){
  $("feedback").className="feedback";
  $("feedback").textContent="";
  updateStats();
  if(state.level===1) level1();
  if(state.level===2) level2();
  if(state.level===3) level3();
  if(state.level===4) level4();
  if(state.level===5) level5();
}

function randomInt(min,max){return Math.floor(Math.random()*(max-min+1))+min}

function baseName(base){
  return ({2:"BINARY",8:"OCTAL",10:"DECIMAL",16:"HEXADECIMAL"})[base];
}
function toBase(n,base){return n.toString(base).toUpperCase()}
function validForBase(value,base){
  value=value.trim().toUpperCase();
  if(!value) return false;
  if(base===2) return /^[01]+$/.test(value);
  if(base===8) return /^[0-7]+$/.test(value);
  if(base===10) return /^\d+$/.test(value);
  return /^[0-9A-F]+$/.test(value);
}
function parseValue(value,base){return parseInt(value.trim(),base)}

function level1(){
  const n=randomInt(12,63);
  const bin=toBase(n,2);
  state.challenge={answer:String(n)};
  $("challengeArea").innerHTML=`
    <div class="challenge-header">
      <div><div class="eyebrow">LEVEL 01 // BINARY LAB</div><h2>SECURITY CODE</h2><p>Translate the binary code before the system locks you out.</p></div>
      <div class="timer">● LIVE</div>
    </div>
    <div class="question-box">
      <div class="question-label">CONVERT TO DECIMAL</div>
      <div class="big-number">${bin}<small style="font-size:.35em;color:var(--muted)">₂</small></div>
      <div class="sub-question">What is this value in base 10?</div>
    </div>
    <div class="answer-row">
      <input id="answerInput" inputmode="numeric" placeholder="Enter decimal value" />
      <button class="primary" onclick="submitTextAnswer()">UNLOCK</button>
    </div>`;
  focusAnswer();
}

function level2(){
  const n=randomInt(15,200);
  const bases=[2,8,16];
  const target=bases[randomInt(0,bases.length-1)];
  const from=10;
  state.challenge={answer:toBase(n,target), target};
  $("challengeArea").innerHTML=`
    <div class="challenge-header">
      <div><div class="eyebrow">LEVEL 02 // CONVERSION TUNNEL</div><h2>FIND THE MISSING BASE</h2><p>The value is moving through the tunnel. Supply the missing representation.</p></div>
    </div>
    <div class="question-box">
      <div class="question-label">DECIMAL INPUT</div>
      <div class="big-number">${n}<small style="font-size:.35em;color:var(--muted)">₁₀</small></div>
      <div class="sub-question">Convert it to <b>${baseName(target)}</b>.</div>
    </div>
    <div class="answer-row">
      <input id="answerInput" placeholder="Enter ${baseName(target)} value" />
      <button class="primary" onclick="submitTextAnswer()">SEND</button>
    </div>`;
  focusAnswer();
}

function level3(){
  const n=randomInt(20,240);
  const bases=[2,8,10,16];
  const from=bases[randomInt(0,3)];
  let target=bases[randomInt(0,3)];
  while(target===from) target=bases[randomInt(0,3)];
  const shown=toBase(n,from);
  state.challenge={answer:toBase(n,target), target};
  $("challengeArea").innerHTML=`
    <div class="challenge-header">
      <div><div class="eyebrow">LEVEL 03 // FOUR-WAY CONVERTER</div><h2>CHOOSE THE PORTAL</h2><p>Pick the destination base, then enter the converted value.</p></div>
    </div>
    <div class="question-box">
      <div class="question-label">${baseName(from)} INPUT</div>
      <div class="big-number">${shown}<small style="font-size:.35em;color:var(--muted)">₍${from}₎</small></div>
      <div class="sub-question">Destination: <b>${baseName(target)}</b></div>
    </div>
    <div class="answer-row">
      <input id="answerInput" placeholder="Enter ${baseName(target)} value" />
      <button class="primary" onclick="submitTextAnswer()">CONVERT</button>
    </div>`;
  focusAnswer();
}

function level4(){
  const n=randomInt(25,200);
  const values={DECIMAL:String(n),BINARY:toBase(n,2),OCTAL:toBase(n,8),HEXADECIMAL:toBase(n,16)};
  const keys=Object.keys(values);
  const wrongKey=keys[randomInt(0,3)];
  let wrong;
  const baseMap={DECIMAL:10,BINARY:2,OCTAL:8,HEXADECIMAL:16};
  do{
    wrong=toBase(n+randomInt(1,7),baseMap[wrongKey]);
  }while(wrong===values[wrongKey]);
  values[wrongKey]=wrong;
  state.challenge={answer:wrongKey};
  $("challengeArea").innerHTML=`
    <div class="challenge-header">
      <div><div class="eyebrow">LEVEL 04 // GLITCH HUNT</div><h2>FIND THE CORRUPTION</h2><p>Three values are correct. One has been corrupted by a system glitch.</p></div>
    </div>
    <div class="question-box">
      <div class="question-label">ALL FOUR CLAIM TO REPRESENT THE SAME VALUE</div>
      <div class="code-grid">
        ${keys.map(k=>`<div class="code-cell"><span>${k}</span><b>${values[k]}</b></div>`).join("")}
      </div>
      <div class="sub-question">Click the corrupted representation.</div>
    </div>
    <div class="options">
      ${keys.map(k=>`<button class="option" onclick="chooseGlitch('${k}',this)">${k}</button>`).join("")}
    </div>`;
}

function level5(){
  const n1=randomInt(10,40), n2=randomInt(45,90);
  const nums=[n1,n2,randomInt(100,160),randomInt(170,230)];
  const cards=[];
  nums.forEach(n=>{
    cards.push({value:String(n),pair:n});
    cards.push({value:toBase(n,16),pair:n});
  });
  cards.sort(()=>Math.random()-.5);
  state.match={cards,flipped:[],matched:0,locked:false};
  $("challengeArea").innerHTML=`
    <div class="challenge-header">
      <div><div class="eyebrow">LEVEL 05 // MEMORY MATCH</div><h2>RECOVER THE MASTER CODE</h2><p>Match each decimal value with its hexadecimal twin.</p></div>
      <div class="timer">8 PAIRS OF DATA</div>
    </div>
    <div class="question-box" style="padding:25px">
      <div class="question-label">EQUIVALENT VALUES</div>
      <div class="match-grid" id="matchGrid">
        ${cards.map((c,i)=>`<button class="match-card" data-index="${i}" onclick="flipCard(${i})">?</button>`).join("")}
      </div>
      <div class="sub-question">Matches: <b id="matchCount">0</b> / 4</div>
    </div>`;
}

function focusAnswer(){
  setTimeout(()=>{const el=$("answerInput"); if(el) el.focus()},100);
}
function submitTextAnswer(){
  const input=$("answerInput");
  if(!input)return;
  const given=input.value.trim().toUpperCase();
  state.attempts++;
  if(given===String(state.challenge.answer).toUpperCase()){
    state.correct++;
    const points=100-(state.hintUsed?20:0);
    state.score+=Math.max(20,points);
    good(`✓ ACCESS GRANTED — ${given} is correct. +${Math.max(20,points)} points`);
    setTimeout(nextLevel,850);
  }else{
    state.lives--;
    updateStats();
    if(state.lives<=0){
      bad("✕ SYSTEM LOCKED. Restarting the mission...");
      setTimeout(startGame,1000);
    }else{
      bad(`✕ INCORRECT. ${state.lives} life${state.lives===1?"":"s"} remaining.`);
      input.select();
    }
  }
}
function chooseGlitch(key,button){
  state.attempts++;
  if(key===state.challenge.answer){
    state.correct++; state.score+=100;
    button.classList.add("correct");
    good("✓ GLITCH FIXED — you found the corrupted representation. +100");
    setTimeout(nextLevel,900);
  }else{
    state.lives--; button.classList.add("wrong"); updateStats();
    bad("✕ That representation is valid. Find the corrupted one.");
    if(state.lives<=0)setTimeout(startGame,1000);
  }
}
function flipCard(index){
  const m=state.match;
  if(m.locked || m.flipped.includes(index) || m.cards[index].matched)return;
  const btn=document.querySelector(`[data-index="${index}"]`);
  btn.textContent=m.cards[index].value;
  btn.classList.add("revealed");
  m.flipped.push(index);
  if(m.flipped.length===2){
    m.locked=true;
    const [a,b]=m.flipped;
    if(m.cards[a].pair===m.cards[b].pair){
      m.cards[a].matched=m.cards[b].matched=true;
      document.querySelector(`[data-index="${a}"]`).classList.add("matched");
      document.querySelector(`[data-index="${b}"]`).classList.add("matched");
      m.matched++;
      m.flipped=[]; m.locked=false;
      $("matchCount").textContent=m.matched;
      state.score+=75; state.correct++; state.attempts++;
      if(m.matched===4){
        good("✓ MEMORY CORE RESTORED — +300 bonus");
        state.score+=300;
        setTimeout(nextLevel,1000);
      }
    }else{
      state.attempts++;
      setTimeout(()=>{
        [a,b].forEach(i=>{
          const el=document.querySelector(`[data-index="${i}"]`);
          el.textContent="?"; el.classList.remove("revealed");
        });
        m.flipped=[];m.locked=false;
      },700);
    }
  }
}

function hint(){
  if(state.hintUsed){toast("Hint already used for this level.");return}
  if(state.score<20){toast("You need at least 20 points for a hint.");return}
  state.score-=20;state.hintUsed=true;updateStats();
  const c=state.challenge;
  if(state.level===1)toast("Hint: use powers of 2 from right to left.");
  else if(state.level===2)toast(`Hint: ${baseName(c.target)} uses base ${c.target}.`);
  else if(state.level===3)toast(`Hint: the destination is ${baseName(c.target)} (base ${c.target}).`);
  else if(state.level===4)toast(`Hint: convert each suspicious value back to decimal.`);
  else toast("Hint: decimal and hexadecimal cards form each pair.");
}
function good(msg){$("feedback").className="feedback good";$("feedback").textContent=msg;updateStats()}
function bad(msg){$("feedback").className="feedback bad";$("feedback").textContent=msg}
function toast(msg){
  const t=$("toast");t.textContent=msg;t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"),2300);
}

function convertLab(){
  const value=$("labInput").value.trim().toUpperCase();
  const base=Number($("labBase").value);
  const error=$("labError");
  if(!validForBase(value,base)){
    error.textContent=`⚠ Invalid ${baseName(base)} number. Allowed characters match base ${base}.`;
    error.classList.remove("hidden");$("results").classList.add("hidden");$("labBottom").classList.add("hidden");return;
  }
  const n=parseValue(value,base);
  if(!Number.isSafeInteger(n) || n<0){
    error.textContent="⚠ Please enter a safe non-negative integer.";
    error.classList.remove("hidden");return;
  }
  error.classList.add("hidden");
  const dec=String(n),bin=toBase(n,2),oct=toBase(n,8),hex=toBase(n,16);
  $("decResult").textContent=dec;$("binResult").textContent=bin;$("octResult").textContent=oct;$("hexResult").textContent=hex;
  $("results").classList.remove("hidden");$("labBottom").classList.remove("hidden");
  $("radarCenter").textContent=value;$("radarDec").textContent=dec;$("radarBin").textContent=bin;$("radarOct").textContent=oct;$("radarHex").textContent=hex;
  renderSteps(n,base,value);
}
function renderSteps(n,base,value){
  const out=[];
  if(base===10){
    let x=n;
    if(x===0)out.push(`<div class="step-line">0 is already <b>0₂</b>.</div>`);
    while(x>0){
      const q=Math.floor(x/2),r=x%2;
      out.push(`<div class="step-line">${x} ÷ 2 = <b>${q}</b> remainder <b>${r}</b></div>`);x=q;
    }
    out.push(`<div class="step-line">Read remainders bottom → top = <b>${toBase(n,2)}₂</b></div>`);
  }else if(base===2){
    const bits=value.split("");
    out.push(`<div class="step-line">Place values: <b>2⁰, 2¹, 2²...</b> from right to left.</div>`);
    let sum=0;
    [...bits].reverse().forEach((bit,i)=>{const term=Number(bit)*2**i;sum+=term;out.push(`<div class="step-line">${bit} × 2<sup>${i}</sup> = <b>${term}</b></div>`)});
    out.push(`<div class="step-line">Add the terms = <b>${sum}</b>₁₀</div>`);
  }else if(base===8){
    out.push(`<div class="step-line">Each octal digit represents a power of <b>8</b>.</div>`);
    [...value].reverse().forEach((d,i)=>out.push(`<div class="step-line">${d} × 8<sup>${i}</sup> = <b>${Number(d)*8**i}</b></div>`));
    out.push(`<div class="step-line">Decimal value = <b>${n}</b>₁₀</div>`);
  }else{
    out.push(`<div class="step-line">Hex digits use powers of <b>16</b> (A=10 ... F=15).</div>`);
    [...value].reverse().forEach((d,i)=>{const v=parseInt(d,16);out.push(`<div class="step-line">${d} × 16<sup>${i}</sup> = <b>${v*16**i}</b></div>`)});
    out.push(`<div class="step-line">Decimal value = <b>${n}</b>₁₀</div>`);
  }
  $("stepsContent").innerHTML=out.join("");
}

$("brandHome").onclick=()=>showScreen("home");
$("brandHome").addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" ")showScreen("home")});
$("startBtn").onclick=startGame;
$("labBtn").onclick=()=>{showScreen("lab");$("labInput").focus()};
$("labFromGameBtn").onclick=()=>showScreen("lab");
$("homeFromLab").onclick=()=>showScreen("home");
$("labCompleteBtn").onclick=()=>showScreen("lab");
$("playAgainBtn").onclick=startGame;
$("resetGameBtn").onclick=resetGame;
$("hintBtn").onclick=hint;
$("convertBtn").onclick=convertLab;
$("clearLabBtn").onclick=()=>{
  $("labInput").value="";$("results").classList.add("hidden");$("labBottom").classList.add("hidden");$("labError").classList.add("hidden");
};
$("labInput").addEventListener("keydown",e=>{if(e.key==="Enter")convertLab()});
$("answerInput")?.addEventListener("keydown",e=>{if(e.key==="Enter")submitTextAnswer()});

document.addEventListener("keydown",e=>{
  if(e.key==="Enter" && document.activeElement?.id==="answerInput") submitTextAnswer();
});
updateStats();
