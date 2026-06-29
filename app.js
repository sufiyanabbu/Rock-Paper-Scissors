/* ═══════════════════════════════════════════════
   CURSOR
═══════════════════════════════════════════════ */
const cursor     = document.getElementById('cursor');
const cursorRing = document.getElementById('cursor-ring');
let cx = window.innerWidth/2, cy = window.innerHeight/2;
let ringX = cx, ringY = cy;
 
document.addEventListener('mousemove', e => {
  cx = e.clientX; cy = e.clientY;
  cursor.style.left = cx + 'px';
  cursor.style.top  = cy + 'px';
  document.documentElement.style.setProperty('--mx', (cx / window.innerWidth).toFixed(3));
  document.documentElement.style.setProperty('--my', (cy / window.innerHeight).toFixed(3));
  // parallax app
  const dx = (cx / window.innerWidth  - .5) * 14;
  const dy = (cy / window.innerHeight - .5) * 10;
  document.getElementById('app').style.transform = `translate(${-dx*.3}px,${-dy*.3}px)`;
});
 
// lag ring
(function ringLoop(){
  ringX += (cx - ringX) * .12;
  ringY += (cy - ringY) * .12;
  cursorRing.style.left = ringX + 'px';
  cursorRing.style.top  = ringY + 'px';
  requestAnimationFrame(ringLoop);
})();
 
document.querySelectorAll('button, .choice-btn').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.transform = 'translate(-50%,-50%) scale(2.5)';
    cursorRing.style.borderColor = 'rgba(255,106,0,.8)';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.transform = 'translate(-50%,-50%) scale(1)';
    cursorRing.style.borderColor = 'rgba(255,106,0,.5)';
  });
});
 
/* ═══════════════════════════════════════════════
   BACKGROUND GRID CANVAS
═══════════════════════════════════════════════ */
(function() {
  const cvs = document.getElementById('bg-canvas');
  const ctx = cvs.getContext('2d');
  let W, H;
 
  function resize() {
    W = cvs.width  = window.innerWidth;
    H = cvs.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();
 
  // floating particles
  const particles = Array.from({length: 60}, () => ({
    x: Math.random()*W,
    y: Math.random()*H,
    r: Math.random()*1.5 + .3,
    vx: (Math.random()-.5)*.25,
    vy: (Math.random()-.5)*.25,
    a: Math.random(),
  }));
 
  let t = 0;
  function draw() {
    ctx.clearRect(0,0,W,H);
    t += .003;
 
    // grid
    ctx.strokeStyle = 'rgba(255,106,0,0.028)';
    ctx.lineWidth = 1;
    const gs = 80;
    const ox = (t*12) % gs;
    for (let x = -gs+ox; x < W+gs; x+=gs) {
      ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke();
    }
    for (let y = 0; y < H+gs; y+=gs) {
      ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke();
    }
 
    // soft ray
    const mx = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--mx')) || .5;
    const grad = ctx.createRadialGradient(mx*W, .3*H, 0, mx*W, .3*H, W*.7);
    grad.addColorStop(0, 'rgba(255,106,0,0.04)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,W,H);
 
    // particles
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      const pulse = .4 + .6*Math.sin(t*3 + p.a*10);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(255,${130+Math.random()*60|0},0,${pulse*.35})`;
      ctx.fill();
    });
 
    requestAnimationFrame(draw);
  }
  draw();
})();
 
/* ═══════════════════════════════════════════════
   3D ICON RENDERER (Canvas 2D fake-3D)
═══════════════════════════════════════════════ */
function makeIcon(choice) {
  return {
    choice,
    angle: 0,
    hovered: false,
    liftY: 0,
    glowAlpha: 0,
  };
}
 
const ICONS = {
  rock:     makeIcon('rock'),
  paper:    makeIcon('paper'),
  scissors: makeIcon('scissors'),
};
 
function drawRock(ctx, cx, cy, t, glow) {
  // body
  const r = 36;
  const ofs = Math.sin(t)*.5;
  // shadow
  const sg = ctx.createRadialGradient(cx, cy+r+4+ofs, 0, cx, cy+r+4+ofs, r*1.3);
  sg.addColorStop(0, 'rgba(0,0,0,.35)'); sg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sg; ctx.beginPath(); ctx.ellipse(cx, cy+r+6+ofs, r*1.2, r*.28, 0, 0, Math.PI*2); ctx.fill();
 
  // rock body gradient
  const rg = ctx.createRadialGradient(cx-8, cy-8+ofs, 2, cx, cy+ofs, r);
  rg.addColorStop(0, '#888'); rg.addColorStop(.4, '#555'); rg.addColorStop(1, '#2a2a2a');
  ctx.fillStyle = rg;
  ctx.beginPath();
  ctx.moveTo(cx-20, cy+15+ofs);
  ctx.bezierCurveTo(cx-30, cy-5+ofs, cx-25, cy-25+ofs, cx-5, cy-30+ofs);
  ctx.bezierCurveTo(cx+10, cy-38+ofs, cx+32, cy-20+ofs, cx+28, cy+0+ofs);
  ctx.bezierCurveTo(cx+32, cy+18+ofs, cx+18, cy+28+ofs, cx-2, cy+30+ofs);
  ctx.bezierCurveTo(cx-18, cy+30+ofs, cx-24, cy+22+ofs, cx-20, cy+15+ofs);
  ctx.fill();
 
  // highlight
  ctx.fillStyle = 'rgba(255,255,255,.18)';
  ctx.beginPath(); ctx.ellipse(cx-12, cy-14+ofs, 10, 7, -Math.PI*.3, 0, Math.PI*2); ctx.fill();
 
  // orange glow rim
  if (glow > 0) {
    ctx.save();
    ctx.shadowColor = '#ff6a00'; ctx.shadowBlur = 20*glow;
    ctx.strokeStyle = `rgba(255,106,0,${glow*.6})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx-20, cy+15+ofs);
    ctx.bezierCurveTo(cx-30, cy-5+ofs, cx-25, cy-25+ofs, cx-5, cy-30+ofs);
    ctx.bezierCurveTo(cx+10, cy-38+ofs, cx+32, cy-20+ofs, cx+28, cy+0+ofs);
    ctx.bezierCurveTo(cx+32, cy+18+ofs, cx+18, cy+28+ofs, cx-2, cy+30+ofs);
    ctx.bezierCurveTo(cx-18, cy+30+ofs, cx-24, cy+22+ofs, cx-20, cy+15+ofs);
    ctx.stroke();
    ctx.restore();
  }
}
 
function drawPaper(ctx, cx, cy, t, glow) {
  const ofs = Math.sin(t)*.5;
  const w=44, h=54;
  const sx = cx-w/2, sy = cy-h/2+ofs;
 
  // shadow
  const sg = ctx.createRadialGradient(cx, cy+h/2+6+ofs, 0, cx, cy+h/2+6+ofs, w*1.1);
  sg.addColorStop(0,'rgba(0,0,0,.3)'); sg.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=sg; ctx.beginPath(); ctx.ellipse(cx, cy+h/2+6+ofs, w*.8, h*.18, 0,0,Math.PI*2); ctx.fill();
 
  // paper body
  const pg = ctx.createLinearGradient(sx, sy, sx+w, sy+h);
  pg.addColorStop(0,'#e8e0d0'); pg.addColorStop(1,'#c8c0b0');
  ctx.fillStyle=pg;
  ctx.beginPath();
  ctx.moveTo(sx+8, sy);
  ctx.lineTo(sx+w, sy);
  ctx.lineTo(sx+w, sy+h);
  ctx.lineTo(sx, sy+h);
  ctx.lineTo(sx, sy+8);
  ctx.closePath();
  ctx.fill();
 
  // folded corner
  ctx.fillStyle='#b0a898';
  ctx.beginPath();
  ctx.moveTo(sx,sy+8); ctx.lineTo(sx+8,sy); ctx.lineTo(sx+8,sy+8); ctx.closePath(); ctx.fill();
 
  // lines
  ctx.strokeStyle='rgba(0,0,0,.12)'; ctx.lineWidth=1.5;
  [14,22,30,38].forEach(dy => {
    ctx.beginPath(); ctx.moveTo(sx+6, sy+dy); ctx.lineTo(sx+w-6, sy+dy); ctx.stroke();
  });
 
  // highlight
  ctx.fillStyle='rgba(255,255,255,.25)';
  ctx.fillRect(sx+w-10, sy, 5, h*.4);
 
  if (glow > 0) {
    ctx.save();
    ctx.shadowColor='#ff6a00'; ctx.shadowBlur=20*glow;
    ctx.strokeStyle=`rgba(255,106,0,${glow*.6})`; ctx.lineWidth=2;
    ctx.strokeRect(sx, sy+8, w, h-8);
    ctx.restore();
  }
}
 
function drawScissors(ctx, cx, cy, t, glow) {
  const ofs = Math.sin(t)*.5;
  const tilt = Math.sin(t*1.4)*.04;
 
  ctx.save();
  ctx.translate(cx, cy+ofs);
  ctx.rotate(tilt);
 
  // shadow
  const sg = ctx.createRadialGradient(0, 36, 0, 0, 36, 30);
  sg.addColorStop(0,'rgba(0,0,0,.3)'); sg.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=sg; ctx.beginPath(); ctx.ellipse(0,38, 26, 8, 0,0,Math.PI*2); ctx.fill();
 
  const metalGrad = (x0,y0,x1,y1) => {
    const g = ctx.createLinearGradient(x0,y0,x1,y1);
    g.addColorStop(0,'#9a9a9a'); g.addColorStop(.4,'#e0e0e0'); g.addColorStop(1,'#5a5a5a');
    return g;
  };
 
  // blade 1
  ctx.save(); ctx.rotate(-.32);
  ctx.fillStyle = metalGrad(-4,-36, 4, 20);
  ctx.beginPath();
  ctx.moveTo(-3,-36); ctx.lineTo(3,-36); ctx.lineTo(5,18); ctx.lineTo(-5,18); ctx.closePath(); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.25)';
  ctx.beginPath(); ctx.moveTo(-1,-36); ctx.lineTo(1,-36); ctx.lineTo(2,18); ctx.lineTo(-1,18); ctx.closePath(); ctx.fill();
  ctx.restore();
 
  // blade 2
  ctx.save(); ctx.rotate(.32);
  ctx.fillStyle = metalGrad(-4,-36, 4, 20);
  ctx.beginPath();
  ctx.moveTo(-3,-36); ctx.lineTo(3,-36); ctx.lineTo(5,18); ctx.lineTo(-5,18); ctx.closePath(); ctx.fill();
  ctx.restore();
 
  // handles
  [-.38, .38].forEach(a => {
    ctx.save(); ctx.rotate(a);
    const hg = ctx.createEllipse ? null : ctx.createLinearGradient(-10,14,10,36);
    if (hg) { hg.addColorStop(0,'#666'); hg.addColorStop(1,'#333'); ctx.fillStyle=hg; }
    else { ctx.fillStyle='#555'; }
    ctx.beginPath(); ctx.ellipse(0,28, 9, 12, 0,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.15)'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.ellipse(0,28, 9, 12, 0,0,Math.PI*2); ctx.stroke();
    ctx.restore();
  });
 
  // pivot
  ctx.fillStyle='#ff6a00';
  ctx.beginPath(); ctx.arc(0,16, 5, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.5)';
  ctx.beginPath(); ctx.arc(-1.5,14.5, 2, 0, Math.PI*2); ctx.fill();
 
  if (glow > 0) {
    ctx.save();
    ctx.shadowColor='#ff6a00'; ctx.shadowBlur=20*glow;
    ctx.strokeStyle=`rgba(255,106,0,${glow*.6})`; ctx.lineWidth=2;
    ctx.save(); ctx.rotate(-.32);
    ctx.strokeRect(-5,-36,10,54); ctx.restore();
    ctx.save(); ctx.rotate(.32);
    ctx.strokeRect(-5,-36,10,54); ctx.restore();
    ctx.restore();
  }
 
  ctx.restore();
}
 
function drawChoice(ctx, choice, cx, cy, t, glow) {
  ctx.clearRect(0,0,ctx.canvas.width, ctx.canvas.height);
  if (choice === 'rock')     drawRock(ctx, cx, cy, t, glow);
  if (choice === 'paper')    drawPaper(ctx, cx, cy, t, glow);
  if (choice === 'scissors') drawScissors(ctx, cx, cy, t, glow);
}
 
/* ─ set up idle canvases ─ */
const idleCtxs = {};
['rock','paper','scissors'].forEach(name => {
  const cvs = document.getElementById('cv-' + name);
  cvs.width = 120; cvs.height = 120;
  idleCtxs[name] = cvs.getContext('2d');
});
 
/* hover glow targets */
const hoverGlow = { rock:0, paper:0, scissors:0 };
document.querySelectorAll('.choice-btn').forEach(btn => {
  const ch = btn.dataset.choice;
  btn.addEventListener('mouseenter', () => hoverGlow[ch] = 1);
  btn.addEventListener('mouseleave', () => hoverGlow[ch] = 0);
});
 
let idleT = 0;
(function idleLoop() {
  idleT += .018;
  ['rock','paper','scissors'].forEach(name => {
    const ctx = idleCtxs[name];
    const g = hoverGlow[name];
    drawChoice(ctx, name, 60, 60, idleT, g);
  });
  requestAnimationFrame(idleLoop);
})();
 
/* ═══════════════════════════════════════════════
   FX CANVAS — particles / shake / confetti
═══════════════════════════════════════════════ */
const fxCvs = document.getElementById('fx-canvas');
const fxCtx = fxCvs.getContext('2d');
fxCvs.width  = window.innerWidth;
fxCvs.height = window.innerHeight;
window.addEventListener('resize', () => { fxCvs.width=window.innerWidth; fxCvs.height=window.innerHeight; });
 
let fxParticles = [];
 
function spawnBurst(x, y, count, colors, sizeRange=[4,12], speedRange=[4,14]) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random()*Math.PI*2;
    const speed = speedRange[0] + Math.random()*(speedRange[1]-speedRange[0]);
    fxParticles.push({
      x, y,
      vx: Math.cos(angle)*speed,
      vy: Math.sin(angle)*speed - Math.random()*4,
      r: sizeRange[0] + Math.random()*(sizeRange[1]-sizeRange[0]),
      color: colors[Math.floor(Math.random()*colors.length)],
      alpha: 1,
      decay: .015 + Math.random()*.02,
      gravity: .3,
      shape: Math.random() > .5 ? 'rect' : 'circle',
      rot: Math.random()*Math.PI*2,
      rotV: (Math.random()-.5)*.2,
    });
  }
}
 
function fxLoop() {
  fxCtx.clearRect(0,0,fxCvs.width,fxCvs.height);
  fxParticles = fxParticles.filter(p => p.alpha > 0);
  fxParticles.forEach(p => {
    p.x += p.vx; p.y += p.vy; p.vy += p.gravity;
    p.vx *= .98; p.alpha -= p.decay; p.rot += p.rotV;
    fxCtx.save();
    fxCtx.globalAlpha = Math.max(0, p.alpha);
    fxCtx.translate(p.x, p.y);
    fxCtx.rotate(p.rot);
    fxCtx.fillStyle = p.color;
    if (p.shape === 'rect') {
      fxCtx.fillRect(-p.r/2, -p.r/2, p.r, p.r*.5);
    } else {
      fxCtx.beginPath(); fxCtx.arc(0,0,p.r/2,0,Math.PI*2); fxCtx.fill();
    }
    fxCtx.restore();
  });
  requestAnimationFrame(fxLoop);
}
fxLoop();
 
/* screen shake */
function shake(intensity=8, duration=400) {
  const start = Date.now();
  const app = document.getElementById('app');
  (function loop() {
    const t = (Date.now()-start)/duration;
    if (t >= 1) { app.style.transform = ''; return; }
    const s = intensity * (1-t);
    app.style.transform = `translate(${(Math.random()-.5)*s}px,${(Math.random()-.5)*s}px)`;
    requestAnimationFrame(loop);
  })();
}
 
/* impact flash */
function flash(color='rgba(255,106,0,0.18)') {
  const div = document.createElement('div');
  Object.assign(div.style, {
    position:'fixed', inset:0, zIndex:200, pointerEvents:'none',
    background: color, borderRadius:'0',
  });
  document.body.appendChild(div);
  div.animate([{opacity:1},{opacity:0}],{duration:350,fill:'forwards'}).onfinish = () => div.remove();
}
 
/* ═══════════════════════════════════════════════
   GAME STATE
═══════════════════════════════════════════════ */
const state = {
  playerScore: 0, botScore: 0, draws: 0, rounds: 0,
  streak: 0, bestStreak: 0,
  playing: false,
};
const choices = ['rock','paper','scissors'];
const choiceEmoji = { rock:'✊', paper:'✋', scissors:'✌️' };
const choiceLabel = { rock:'Rock', paper:'Paper', scissors:'Scissors' };
 
function getWinner(player, bot) {
  if (player === bot) return 'draw';
  if ((player==='rock'&&bot==='scissors')||(player==='scissors'&&bot==='paper')||(player==='paper'&&bot==='rock')) return 'player';
  return 'bot';
}
 
/* ─ UI helpers ─ */
function updateScore() {
  document.getElementById('score-player').textContent = state.playerScore;
  document.getElementById('score-bot').textContent    = state.botScore;
  document.getElementById('score-draw').textContent   = state.draws;
  const total = state.playerScore + state.botScore;
  const wr = total ? Math.round(state.playerScore/total*100) : 0;
  document.getElementById('winrate-text').textContent = `Win Rate ${wr}%`;
  document.getElementById('stat-streak').textContent  = state.streak;
  document.getElementById('stat-rounds').textContent  = state.rounds;
  document.getElementById('stat-best').textContent    = state.bestStreak;
}
 
function bumpCard(id) {
  const el = document.getElementById(id);
  el.classList.remove('bump');
  void el.offsetWidth;
  el.classList.add('bump');
  setTimeout(() => el.classList.remove('bump'), 400);
}
 
/* ─ Battle canvas setup ─ */
const battleCtxP = document.getElementById('cv-battle-player').getContext('2d');
const battleCtxB = document.getElementById('cv-battle-bot').getContext('2d');
let battleAnim = null;
let battleT = 0;
let currentPlayerChoice = null, currentBotChoice = null;
 
function startBattleAnimation(pChoice, bChoice) {
  currentPlayerChoice = pChoice;
  currentBotChoice    = bChoice;
  if (battleAnim) cancelAnimationFrame(battleAnim);
  (function loop() {
    battleT += .025;
    drawChoice(battleCtxP, pChoice, 50, 50, battleT, .6);
    drawChoice(battleCtxB, bChoice, 50, 50, battleT+1.5, .6);
    battleAnim = requestAnimationFrame(loop);
  })();
}
 
/* ═══════════════════════════════════════════════
   SLOT MACHINE
═══════════════════════════════════════════════ */
function runSlot(onDone) {
  const slot = document.getElementById('slot-display');
  const total = 2400;
  const start = Date.now();
  let interval = 80;
  let idx = 0;
 
  function tick() {
    const elapsed = Date.now() - start;
    const progress = elapsed / total;
 
    slot.style.opacity = '0';
    setTimeout(() => {
      slot.textContent = choiceEmoji[choices[idx % 3]];
      slot.style.opacity = '1';
    }, 40);
    idx++;
 
    // ease out — slow down at end
    const factor = progress < .7 ? 1 : 1 + (progress-.7)*15;
    interval = Math.min(80 * factor, 420);
 
    if (elapsed < total - 300) {
      setTimeout(tick, interval);
    } else {
      setTimeout(onDone, 350);
    }
  }
  tick();
}
 
/* ═══════════════════════════════════════════════
   PLAY ROUND
═══════════════════════════════════════════════ */
function playRound(playerChoice) {
  if (state.playing) return;
  state.playing = true;
 
  // disable buttons
  document.querySelectorAll('.choice-btn').forEach(b => b.style.pointerEvents = 'none');
  document.getElementById('play-again').classList.remove('show');
 
  // reset UI
  const ba = document.getElementById('battle-area');
  ba.classList.remove('visible');
  const rb = document.getElementById('result-banner');
  rb.classList.remove('show');
  rb.querySelector('#result-title').className = '';
 
  // show thinking
  const thinking = document.getElementById('thinking-overlay');
  thinking.classList.add('show');
 
  // run slot machine
  runSlot(() => {
    const botChoice = choices[Math.floor(Math.random()*3)];
    const winner    = getWinner(playerChoice, botChoice);
 
    // hide thinking, show battle
    thinking.classList.remove('show');
    ba.classList.add('visible');
 
    document.getElementById('player-choice-name').textContent = choiceLabel[playerChoice];
    document.getElementById('bot-choice-name').textContent    = choiceLabel[botChoice];
 
    startBattleAnimation(playerChoice, botChoice);
 
    // impact
    setTimeout(() => {
      // particles at center
      const rect = document.getElementById('impact-zone').getBoundingClientRect();
      const impX = rect.left + rect.width/2;
      const impY = rect.top  + rect.height/2;
      spawnBurst(impX, impY, 30,
        ['#ff6a00','#ffb000','#fff','rgba(255,106,0,.7)'],
        [3,10],[3,12]);
      flash();
      shake(5, 350);
 
      // score
      state.rounds++;
      if (winner === 'player') {
        state.playerScore++;
        state.streak++;
        if (state.streak > state.bestStreak) state.bestStreak = state.streak;
        bumpCard('card-player');
        spawnBurst(impX, impY, 50,
          ['#ff6a00','#ffb000','#ffe066','#fff'],
          [5,14],[6,18]);
        // confetti from top
        for (let i=0;i<60;i++) spawnBurst(
          Math.random()*fxCvs.width, -10, 1,
          ['#ff6a00','#ffb000','#fff','#ff2d55','#a78bfa'],
          [6,14],[4,10]);
 
        showResult('Victory!', 'You crushed it', 'win');
        if (state.streak >= 3) showStreak(state.streak);
 
      } else if (winner === 'bot') {
        state.botScore++;
        state.streak = 0;
        bumpCard('card-bot');
        shake(10, 500);
        flash('rgba(255,45,85,0.15)');
        spawnBurst(impX, impY, 20, ['#ff2d55','#ff6a00'], [3,8],[2,8]);
        showResult('Defeated', 'The bot wins this round', 'lose');
 
      } else {
        state.draws++;
        bumpCard('card-draw');
        spawnBurst(impX, impY, 15, ['rgba(255,255,255,.4)'], [3,8],[2,6]);
        showResult('Draw', 'Perfect balance…', 'draw');
      }
 
      updateScore();
      state.playing = false;
      document.querySelectorAll('.choice-btn').forEach(b => b.style.pointerEvents = '');
      document.getElementById('play-again').classList.add('show');
 
    }, 600);
  });
}
 
function showResult(title, sub, type) {
  const rb    = document.getElementById('result-banner');
  const rtEl  = document.getElementById('result-title');
  const rsSEl = document.getElementById('result-sub');
  rtEl.textContent  = title;
  rtEl.className    = type;
  rsSEl.textContent = sub;
  rb.classList.add('show');
}
 
let streakTimer;
function showStreak(n) {
  const badge = document.getElementById('streak-badge');
  document.getElementById('streak-text').textContent = `${n}x Streak!`;
  badge.classList.add('show');
  clearTimeout(streakTimer);
  streakTimer = setTimeout(() => badge.classList.remove('show'), 2200);
}
 
/* ─ event listeners ─ */
document.querySelectorAll('.choice-btn').forEach(btn => {
  btn.addEventListener('click', () => playRound(btn.dataset.choice));
});
 
document.getElementById('play-again').addEventListener('click', () => {
  document.getElementById('battle-area').classList.remove('visible');
  document.getElementById('result-banner').classList.remove('show');
  document.getElementById('play-again').classList.remove('show');
});
 
updateScore();
