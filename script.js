// script.js - Quiz engine logic
// Author: Black Force 007 - Ready to use

// Configurable
const TOTAL_QUESTIONS = QUESTIONS.length;
let timePerQuestion = parseInt(document.getElementById('timerSelect').value, 10) || 15;

// State
let quizOrder = [];
let currentIdx = 0;
let score = 0;
let streak = 0;
let correctCount = 0;
let wrongCount = 0;
let timerValue = timePerQuestion;
let timerInterval = null;
let totalTimeSpent = 0;
let answeredThisRound = false;

// DOM
const startBtn = document.getElementById('startBtn');
const welcome = document.getElementById('welcome');
const quiz = document.getElementById('quiz');
const result = document.getElementById('result');
const questionText = document.getElementById('questionText');
const optionsDiv = document.getElementById('options');
const timerEl = document.getElementById('timer');
const currentIndexEl = document.getElementById('currentIndex');
const qTotalEl = document.getElementById('qTotal');
const scoreEl = document.getElementById('score');
const streakEl = document.getElementById('streak');
const correctCountEl = document.getElementById('correctCount');
const wrongCountEl = document.getElementById('wrongCount');
const nextBtn = document.getElementById('nextBtn');
const quitBtn = document.getElementById('quitBtn');
const finalScoreEl = document.getElementById('finalScore');
const finalCorrectEl = document.getElementById('finalCorrect');
const finalWrongEl = document.getElementById('finalWrong');
const finalTimeEl = document.getElementById('finalTime');
const achievementsDiv = document.getElementById('achievements');
const leaderList = document.getElementById('leaderList');
const playerNameInput = document.getElementById('playerName');
const saveScoreBtn = document.getElementById('saveScore');
const playAgainBtn = document.getElementById('playAgain');
const goHomeBtn = document.getElementById('goHome');
const timerSelect = document.getElementById('timerSelect');
const totalQuestionsEl = document.getElementById('totalQuestions');

totalQuestionsEl.textContent = TOTAL_QUESTIONS;
qTotalEl.textContent = TOTAL_QUESTIONS;
document.getElementById('qTotal').textContent = TOTAL_QUESTIONS;

// Helpers
function shuffle(arr){
  // Fisher-Yates
  for(let i = arr.length -1; i>0; i--){
    const j = Math.floor(Math.random()*(i+1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildQuizOrder(){
  const idxs = Array.from({length:TOTAL_QUESTIONS}, (_,i)=>i);
  shuffle(idxs);
  return idxs;
}

function startQuiz(){
  timePerQuestion = parseInt(timerSelect.value,10);
  resetState();
  quizOrder = buildQuizOrder();
  welcome.classList.remove('visible');
  result.classList.remove('visible');
  quiz.classList.add('visible');
  renderQuestion();
}

function resetState(){
  currentIdx = 0;
  score = 0;
  streak = 0;
  correctCount = 0;
  wrongCount = 0;
  timerValue = timePerQuestion;
  totalTimeSpent = 0;
  updateUI();
  clearInterval(timerInterval);
}

function updateUI(){
  scoreEl.textContent = score;
  streakEl.textContent = streak;
  correctCountEl.textContent = correctCount;
  wrongCountEl.textContent = wrongCount;
  currentIndexEl.textContent = currentIdx+1;
  timerEl.textContent = timerValue;
}

function renderQuestion(){
  answeredThisRound = false;
  if(currentIdx >= quizOrder.length){
    finishQuiz();
    return;
  }
  const qObj = QUESTIONS[quizOrder[currentIdx]];
  questionText.textContent = qObj.q;

  // create copy of options and shuffle display order but track correct
  const opts = qObj.options.map((o,i)=> ({text:o, idx:i}));
  shuffle(opts);

  optionsDiv.innerHTML = '';
  opts.forEach((opt, i) => {
    const btn = document.createElement('div');
    btn.className = 'option';
    btn.textContent = opt.text;
    btn.dataset.idx = opt.idx; // original index
    btn.addEventListener('click', onSelectOption);
    optionsDiv.appendChild(btn);
  });

  // reset timer
  timerValue = timePerQuestion;
  timerEl.textContent = timerValue;
  startTimer();
  updateUI();
  nextBtn.classList.add('muted');
}

function startTimer(){
  clearInterval(timerInterval);
  timerInterval = setInterval(()=>{
    timerValue--;
    timerEl.textContent = timerValue;
    if(timerValue <= 0){
      clearInterval(timerInterval);
      totalTimeSpent += timePerQuestion;
      handleTimeout();
    }
  }, 1000);
}

function handleTimeout(){
  if(answeredThisRound) return;
  answeredThisRound = true;
  // show correct and mark wrong
  revealCorrect();
  wrongCount++;
  streak = 0;
  updateUI();
  // auto proceed after short delay
  setTimeout(()=>{ currentIdx++; renderQuestion(); }, 1200);
}

function onSelectOption(e){
  if(answeredThisRound) return;
  answeredThisRound = true;
  clearInterval(timerInterval);
  const chosenIdx = parseInt(e.currentTarget.dataset.idx,10);
  const qObj = QUESTIONS[quizOrder[currentIdx]];
  const correctIdx = qObj.answer;

  // compute time spent
  const timeSpent = timePerQuestion - timerValue;
  totalTimeSpent += timeSpent;

  // mark UI
  if(chosenIdx === correctIdx){
    e.currentTarget.classList.add('correct','locked');
    correctCount++;
    // scoring
    const base = 100;
    const timeBonus = Math.max(0, Math.floor(timerValue * 2)); // 2 points per remaining sec
    const streakBonus = streak > 0 ? (20 * streak) : 0; // increasing with previous streak
    const gained = base + timeBonus + streakBonus;
    score += gained;
    streak++;
    showFloating(`+${gained}`);
  } else {
    // mark chosen wrong
    e.currentTarget.classList.add('wrong','locked');
    wrongCount++;
    streak = 0;
    // show correct too
    revealCorrect();
  }

  updateUI();
  nextBtn.classList.remove('muted');
}

function revealCorrect(){
  const qObj = QUESTIONS[quizOrder[currentIdx]];
  const correctIdx = qObj.answer;
  // find option element with that data idx
  const opts = optionsDiv.querySelectorAll('.option');
  opts.forEach(o=>{
    if(parseInt(o.dataset.idx,10) === correctIdx){
      // highlight with animation
      o.classList.add('correct');
      o.animate([{transform:'scale(1)'},{transform:'scale(1.03)'},{transform:'scale(1)'}],{duration:700});
    }
    o.classList.add('locked');
  });
}

function showFloating(text){
  const el = document.createElement('div');
  el.textContent = text;
  el.style.position = 'fixed';
  el.style.right = '22px';
  el.style.top = '20%';
  el.style.background = 'rgba(0,0,0,0.6)';
  el.style.padding = '8px 12px';
  el.style.borderRadius = '8px';
  el.style.zIndex = 9999;
  document.body.appendChild(el);
  setTimeout(()=> el.style.opacity = '0', 900);
  setTimeout(()=> el.remove(), 1400);
}

// Next & controls
nextBtn.addEventListener('click', ()=>{
  if(nextBtn.classList.contains('muted')) return;
  // accumulate remaining time as bonus to totalTimeSpent? we counted used time already
  currentIdx++;
  renderQuestion();
});

quitBtn.addEventListener('click', ()=>{
  if(confirm('আপনি কি কোইজ ছেড়ে দিতে চান?')) finishQuiz();
});

// finish
function finishQuiz(){
  clearInterval(timerInterval);
  quiz.classList.remove('visible');
  result.classList.add('visible');

  finalScoreEl.textContent = score;
  finalCorrectEl.textContent = correctCount;
  finalWrongEl.textContent = wrongCount;
  finalTimeEl.textContent = `${totalTimeSpent}s`;

  // Achievements
  const ach = computeAchievements();
  achievementsDiv.innerHTML = `<h3>অ্যাচিভমেন্ট:</h3><ul>${ach.map(a=>`<li>${a}</li>`).join('')}</ul>`;

  // Leaderboard
  renderLeaderboard();
}

function computeAchievements(){
  const list = [];
  if(score >= 4000) list.push("Master Agent: স্কোর 4000+");
  if(streak >= 5 || correctCount >= 20) list.push("Hot Streak: 5+ ধারাবাহিক সঠিক");
  if(correctCount === TOTAL_QUESTIONS) list.push("Perfectionist: সবকটি সঠিক");
  if(totalTimeSpent < TOTAL_QUESTIONS * (timePerQuestion/2)) list.push("Speed Runner: দ্রুত সমাপ্তি");
  if(list.length === 0) list.push("চলমান শেখার পথে — ভালো শুরু!");
  return list;
}

// Leaderboard (localStorage)
function getLeaders(){
  try {
    const raw = localStorage.getItem('bf007_leaderboard') || '[]';
    return JSON.parse(raw);
  } catch(e){
    return [];
  }
}

function saveLeader(name){
  const leaders = getLeaders();
  leaders.push({name: name || 'অজানা', score, time: totalTimeSpent, date: new Date().toISOString()});
  leaders.sort((a,b)=>b.score - a.score);
  // keep top 10
  localStorage.setItem('bf007_leaderboard', JSON.stringify(leaders.slice(0,20)));
  renderLeaderboard();
}

function renderLeaderboard(){
  const leaders = getLeaders();
  leaderList.innerHTML = leaders.slice(0,10).map(l=>`<li>${l.name} — ${l.score} pts <small>(${l.time}s)</small></li>`).join('') || '<li>কোন রেকর্ড নেই</li>';
}

// Save button
saveScoreBtn.addEventListener('click', ()=>{
  const name = playerNameInput.value.trim() || 'অজানা';
  saveLeader(name);
  alert('স্কোর সেভ সম্পন্ন!');
});

// replay / home
playAgainBtn.addEventListener('click', ()=>{
  startQuiz();
});
goHomeBtn.addEventListener('click', ()=>{
  result.classList.remove('visible');
  welcome.classList.add('visible');
});

// start btn
startBtn.addEventListener('click', startQuiz);

// default show leaderboard on load
document.addEventListener('DOMContentLoaded', ()=>{
  renderLeaderboard();
});
