// ============================================
//  特殊兒童收養互動新聞 — script.js
// ============================================

const familyCases = [
    { 
        id: 1, 
        title: "收養檔案號：001", 
        content: "<strong>【高社經菁英家庭】</strong><br><strong>背景：</strong>先生（45歲）為科技業副總，太太（42歲）為外商銀行高管。年收破千萬，居住於市中心豪宅，並預先聘請全職保母。<br><strong>收養動機：</strong>經歷多年不孕，認為自身擁有頂級資源，能給予孩子最好的醫療與教育。<br><strong>社工評估筆記：</strong>夫妻雙方皆處於極高壓環境，無法配合請育嬰假。面對早療需求傾向「花錢請保母解決」，期待孩子能透過醫療跟上一般人的發展標準。" 
    },
    { 
        id: 2, 
        title: "收養檔案號：002", 
        content: "<strong>【雙薪彈性辦公家庭】</strong><br><strong>背景：</strong>先生（41歲）為遠距接案工程師，太太（39歲）為兼職會計。收入中等財務穩健。<br><strong>收養動機：</strong>結婚 8 年未生育，具備特殊兒早療志工經驗，理解「進步不是直線的」。<br><strong>社工評估筆記：</strong>展現極高的<strong>「包容度」與「工作彈性」</strong>。先生能隨時機動配合醫院復健；太太計畫前兩年轉全職建立依附關係。不期待孩子變得「正常」，而是準備好陪孩子面對真實人生。" 
    },
    { 
        id: 3, 
        title: "收養檔案號：003", 
        content: "<strong>【傳統大家族企業】</strong><br><strong>背景：</strong>先生（38歲）為傳產接班人，與父母親戚同住透天別墅。太太（36歲）為全職家庭主婦。<br><strong>收養動機：</strong>面臨長輩傳宗接代壓力，妥協轉而尋求收養。<br><strong>社工評估筆記：</strong>太太承受極大壓力，收養動機參雜「穩固地位」考量。同住長輩對特殊狀況帶有偏見，認為是「業障」。特殊兒童極易成為家族矛盾導火線，缺乏無條件接納的空間。" 
    }
];

// ---------- 狀態與全局路由 ----------
let gameState = {
  childAgeMonths: 12,     
  ageTimerInterval: null,
  currentCardIndex: 0,
  acceptedFamilies: 0,
  rejectedFamilies: 0,
  gameFailed: false
};

let currentSectionId = 'stage-1-result';
let currentGameId = null;
let screenHistory = []; 
let isNavigating = false;

// 核心：絲滑轉場與歷史紀錄功能
function navigateTo(secId, gameId = null, isBack = false) {
    if (isNavigating) return;
    isNavigating = true;

    // 清理舊頁面的計時器
    cleanupScreen(currentGameId);

    // 儲存歷史 (往前時)
    if (!isBack && currentSectionId !== 'stage-3') {
        screenHistory.push({ sec: currentSectionId, game: currentGameId });
    }

    // 隱藏所有
    document.querySelectorAll('.screen-section, .game-screen').forEach(el => {
        el.classList.remove('active');
        el.classList.add('hidden');
    });

    // 顯示新頁面
    const sec = document.getElementById(secId);
    if (sec) {
        sec.classList.remove('hidden');
        sec.classList.add('active');
    }
    if (gameId) {
        const game = document.getElementById(gameId);
        if (game) {
            game.classList.remove('hidden');
            game.classList.add('active');
        }
    }

    currentSectionId = secId;
    currentGameId = gameId;

    initScreen(gameId);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 設定轉場冷卻時間 (配合 CSS 0.6s)
    setTimeout(() => isNavigating = false, 650); 
}

// 統一的返回上一頁邏輯
function goBack() {
    if (isNavigating || screenHistory.length === 0) return;
    const prev = screenHistory.pop();
    navigateTo(prev.sec, prev.game, true);
}

// 清理離開頁面時的資源
function cleanupScreen(id) {
    if (id === 'game-g3') {
        clearInterval(spawnInterval);
        clearInterval(countdownInterval);
        clearInterval(stressIncreaseInterval);
    }
}

// 進入新頁面時的初始化
function initScreen(id) {
    if (id === 'game-g1' && !gameState.ageTimerInterval && !gameState.gameFailed) {
        startAgeTimer();
    }
    if (id === 'game-g3') {
        document.getElementById('btn-start-foster-game').classList.remove('hidden');
        document.getElementById('stress-meter-container').classList.add('hidden');
        document.getElementById('foster-game-area').classList.add('hidden');
        document.getElementById('foster-result-msg').classList.add('hidden');
        document.getElementById('btn-g3-to-g4').classList.add('hidden');
    }
    if (id === 'game-g4') {
        gameState.currentCardIndex = 0;
        gameState.acceptedFamilies = 0;
        gameState.rejectedFamilies = 0;
        document.getElementById('g4-action-btns').classList.remove('hidden');
        document.getElementById('g4-complete-area').classList.add('hidden');
        renderCurrentCard();
    }
    if (id === 'game-g6') {
        ['btn-proc-1', 'btn-proc-2', 'btn-proc-3'].forEach(b => {
            const btn = document.getElementById(b);
            if(btn) {
                btn.classList.remove('btn-pressed');
                if(b !== 'btn-proc-1') {
                    btn.disabled = true;
                    btn.style.opacity = '0.5';
                }
            }
        });
        document.getElementById('g6-msg').classList.add('hidden');
        document.getElementById('btn-g6-to-r').classList.add('hidden');
    }

    // 控制全局返回按鈕的顯示
    const backBtn = document.getElementById('global-back-btn');
    if (screenHistory.length > 0) backBtn.classList.remove('hidden');
    else backBtn.classList.add('hidden');
}


// ---------- 年齡計算系統 ----------
function updateAgeDisplay() {
  const years = Math.floor(gameState.childAgeMonths / 12);
  const months = gameState.childAgeMonths % 12;
  const el = document.getElementById('child-age');
  if (el) el.textContent = `${years}歲 ${months}個月`;

  const warning = document.getElementById('age-warning');
  if (warning) {
    if (gameState.childAgeMonths >= 36) warning.classList.remove('hidden');
    else warning.classList.add('hidden');
  }

  if (gameState.childAgeMonths >= 72 && !gameState.gameFailed) {
    gameState.gameFailed = true;
    stopAgeTimer();
    navigateTo('stage-2', 'game-r1'); // 直達失敗結局
  }
}

function startAgeTimer() {
  stopAgeTimer();
  gameState.ageTimerInterval = setInterval(() => {
    gameState.childAgeMonths++;
    updateAgeDisplay();
  }, 3000); 
}

function stopAgeTimer() {
  if (gameState.ageTimerInterval) {
    clearInterval(gameState.ageTimerInterval);
    gameState.ageTimerInterval = null;
  }
}

// ---------- 第二步：寄養家庭壓力小遊戲 ----------
let stressLevel = 0;
let gameTimer = 10;
let spawnInterval, countdownInterval, stressIncreaseInterval;
const crises = ["急診發燒", "早療排不到", "情緒失控", "半夜哭鬧", "加班", "家長生病"];

function updateStressUI() {
    const bar = document.getElementById('stress-bar');
    const text = document.getElementById('stress-text');
    bar.style.width = `${stressLevel}%`;
    text.innerText = `${Math.floor(stressLevel)}%`;
    if(stressLevel < 50) bar.style.background = '#2ecc71';
    else if (stressLevel < 80) bar.style.background = '#f1c40f';
    else bar.style.background = '#e74c3c';
}

function endFosterGame(isWin) {
    clearInterval(spawnInterval);
    clearInterval(countdownInterval);
    clearInterval(stressIncreaseInterval);
    
    document.getElementById('foster-game-area').innerHTML = ''; 
    document.getElementById('foster-game-area').classList.add('hidden');
    
    const msgBox = document.getElementById('foster-result-msg');
    msgBox.classList.remove('hidden');
    
    if (isWin) {
        msgBox.innerHTML = "<p><strong>驚險撐過這段時期！</strong><br>寄養家庭成功維持了孩子的穩定，但我們必須趕快幫孩子尋找永久的家。</p>";
        msgBox.className = 'pixel-box-inner success-state';
    } else {
        msgBox.innerHTML = "<p><strong>💥 壓力爆表！</strong><br>寄養家庭無法負荷照顧壓力，孩子被迫轉換安置機構... <strong>(耗時增加 3 個月)</strong></p>";
        msgBox.className = 'pixel-box-inner error-state';
        gameState.childAgeMonths += 3;
        updateAgeDisplay();
    }
    document.getElementById('btn-g3-to-g4').classList.remove('hidden');
}

function spawnSingleBubble(area) {
    const bubble = document.createElement('div');
    bubble.className = 'stress-bubble';
    bubble.innerText = crises[Math.floor(Math.random() * crises.length)];
    
    const maxX = area.clientWidth - 100;
    const maxY = area.clientHeight - 40;
    bubble.style.left = `${Math.floor(Math.random() * maxX)}px`;
    bubble.style.top = `${Math.floor(Math.random() * maxY)}px`;

    bubble.addEventListener('mousedown', function onBubbleClick() {
        bubble.removeEventListener('mousedown', onBubbleClick);
        bubble.classList.add('popped');
        stressLevel = Math.max(0, stressLevel - 5);
        updateStressUI();
        setTimeout(() => { if (area.contains(bubble)) bubble.remove(); }, 200);
    });

    area.appendChild(bubble);
    setTimeout(() => {
        if (area.contains(bubble) && !bubble.classList.contains('popped')) bubble.remove();
    }, 1500);
}

function startFosterGame() {
    stressLevel = 0;
    gameTimer = 10;
    updateStressUI();
    
    document.getElementById('btn-start-foster-game').classList.add('hidden');
    document.getElementById('stress-meter-container').classList.remove('hidden');
    document.getElementById('foster-game-area').classList.remove('hidden');
    document.getElementById('game-timer-text').innerText = `剩餘時間：${gameTimer} 秒`;
    
    const area = document.getElementById('foster-game-area');
    
    countdownInterval = setInterval(() => {
        gameTimer--;
        document.getElementById('game-timer-text').innerText = `剩餘時間：${gameTimer} 秒`;
        if (gameTimer <= 0) endFosterGame(true); 
    }, 1000);

    stressIncreaseInterval = setInterval(() => {
        stressLevel += 1;
        if (stressLevel >= 100) {
            stressLevel = 100;
            updateStressUI();
            endFosterGame(false); 
        } else {
            updateStressUI();
        }
    }, 33);

    spawnSingleBubble(area);
    spawnInterval = setInterval(() => {
        if (stressLevel >= 100 || gameTimer <= 0) return;
        spawnSingleBubble(area);
    }, 200); 
}

// ---------- 第三步：卡片渲染 (筆記本風格) ----------
function renderCurrentCard() {
  const container = document.getElementById('family-cards-container');
  if (!container) return;

  if (gameState.currentCardIndex >= familyCases.length) {
    container.innerHTML = '';
    document.getElementById('g4-action-btns').classList.add('hidden');
    document.getElementById('g4-complete-area').classList.remove('hidden');
    return;
  }

  const family = familyCases[gameState.currentCardIndex];
  container.innerHTML = `
    <div class="family-card">
      <div class="notebook-title">${family.title}</div>
      <div class="notebook-content">${family.content}</div>
    </div>
  `;
}

function swipeCard(isAccepted) {
  const container = document.getElementById('family-cards-container');
  const card = container ? container.querySelector('.family-card') : null;

  if (card) {
    const stamp = document.createElement('div');
    stamp.style.position = 'absolute';
    stamp.style.top = '50%';
    stamp.style.left = '50%';
    stamp.style.transform = 'translate(-50%, -50%) rotate(-15deg) scale(2)';
    stamp.style.fontSize = '3rem';
    stamp.style.fontWeight = 'bold';
    stamp.style.border = '6px solid';
    stamp.style.padding = '10px 25px';
    stamp.style.borderRadius = '15px';
    stamp.style.zIndex = '100';
    stamp.style.opacity = '0';
    stamp.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    stamp.style.fontFamily = 'monospace';
    stamp.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    
    if (isAccepted) {
        stamp.innerText = '適 合';
        stamp.style.color = '#2ecc71';
        stamp.style.borderColor = '#2ecc71';
    } else {
        stamp.innerText = '不適合';
        stamp.style.color = '#e74c3c';
        stamp.style.borderColor = '#e74c3c';
    }
    card.appendChild(stamp);
    
    setTimeout(() => {
        stamp.style.opacity = '1';
        stamp.style.transform = 'translate(-50%, -50%) rotate(-5deg) scale(1)';
    }, 10);

    setTimeout(() => {
        card.style.transform = 'rotateY(-130deg)';
        card.style.opacity = '0';
    }, 600);
  }

  setTimeout(() => {
    if (isAccepted) gameState.acceptedFamilies++;
    else gameState.rejectedFamilies++;
    gameState.currentCardIndex++;
    renderCurrentCard();
  }, 1100);
}

// ---------- 事件綁定與全局滾輪/滑動邏輯 ----------

// 判定只在純閱讀畫面允許下滑切換下一頁
function handleScrollNext() {
    if (currentSectionId === 'stage-1-result') navigateTo('stage-2', 'game-main');
    else if (currentGameId === 'game-main') navigateTo('stage-2', 'game-g1');
    else if (currentGameId === 'game-g1') navigateTo('stage-2', 'game-g3');
    else if (currentGameId === 'game-g5') navigateTo('stage-2', 'game-g6');
}

document.addEventListener('DOMContentLoaded', () => {

  // 全局返回按鈕
  document.getElementById('global-back-btn')?.addEventListener('click', goBack);

  // 首頁專用下滑按鈕
  document.getElementById('btn-scroll-down')?.addEventListener('click', () => navigateTo('stage-2', 'game-main'));
  document.getElementById('btn-scroll-g1')?.addEventListener('click', () => navigateTo('stage-2', 'game-g1'));

  // 電腦滾輪：上滑回前一頁，下滑往下一頁
  window.addEventListener('wheel', (e) => {
      if (isNavigating) return;
      if (currentSectionId === 'stage-3') return; // 第三階段長文保留原生滾動
      
      if (e.deltaY < -30) goBack(); // 往上滾
      else if (e.deltaY > 30) handleScrollNext(); // 往下滾
  });

  // 手機觸控：上滑回前一頁，下滑往下一頁
  let touchStartY = 0;
  window.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
  });
  window.addEventListener('touchend', (e) => {
      if (isNavigating) return;
      if (currentSectionId === 'stage-3') return;

      const dy = touchStartY - e.changedTouches[0].clientY;
      if (dy > 40) handleScrollNext(); // 往上滑動 (代表頁面往下)
      else if (dy < -40) goBack(); // 往下滑動 (代表頁面往上)
  });

  // 各種連結按鈕
  document.querySelectorAll('.btn-to-stage-3').forEach(btn => {
    btn.addEventListener('click', () => {
      navigateTo('stage-3', null);
    });
  });

  document.getElementById('btn-g1-next')?.addEventListener('click', () => navigateTo('stage-2', 'game-g3'));
  document.getElementById('btn-start-foster-game')?.addEventListener('click', startFosterGame);
  document.getElementById('btn-g3-to-g4')?.addEventListener('click', () => {
    navigateTo('stage-2', 'game-g4');
  });

  document.getElementById('btn-g4-accept')?.addEventListener('click', () => swipeCard(true));
  document.getElementById('btn-g4-reject')?.addEventListener('click', () => swipeCard(false));

  document.getElementById('btn-g4-to-g5')?.addEventListener('click', () => {
    navigateTo('stage-2', 'game-g5');
    const nEl = document.getElementById('g5-n-value');
    if (nEl) nEl.textContent = gameState.acceptedFamilies;
    gameState.childAgeMonths += gameState.acceptedFamilies * 3;
    updateAgeDisplay();
  });

  document.getElementById('btn-g5-to-g6')?.addEventListener('click', () => {
    if (gameState.gameFailed) return;
    stopAgeTimer();
    navigateTo('stage-2', 'game-g6');
  });

  // 第五步程序按鈕
  const btnProc1 = document.getElementById('btn-proc-1');
  const btnProc2 = document.getElementById('btn-proc-2');
  const btnProc3 = document.getElementById('btn-proc-3');
  const g6Msg = document.getElementById('g6-msg');
  const btnG6ToR = document.getElementById('btn-g6-to-r');

  btnProc1?.addEventListener('click', () => {
      btnProc1.classList.add('btn-pressed');
      if (btnProc2) { btnProc2.disabled = false; btnProc2.style.opacity = '1'; }
  });

  btnProc2?.addEventListener('click', () => {
      btnProc2.classList.add('btn-pressed');
      if (btnProc3) { btnProc3.disabled = false; btnProc3.style.opacity = '1'; }
  });

  btnProc3?.addEventListener('click', () => {
      btnProc3.classList.add('btn-pressed');
      if (g6Msg && btnG6ToR) {
          if (gameState.acceptedFamilies > 0) {
              g6Msg.innerHTML = '<p><strong>🎉 恭喜！所有法定程序皆已完成，這個家庭非常適合收養孩子！</strong></p>';
              g6Msg.className = 'pixel-box-inner success-state';
          } else {
              g6Msg.innerHTML = '<p><strong>❌ 沒有合適的家庭可進行程序，收養宣告失敗。</strong></p>';
              g6Msg.className = 'pixel-box-inner error-state';
          }
          g6Msg.classList.remove('hidden');
          btnG6ToR.classList.remove('hidden');
      }
  });

  btnG6ToR?.addEventListener('click', () => {
    if (gameState.acceptedFamilies > 0) navigateTo('stage-2', 'game-r2');
    else navigateTo('stage-2', 'game-r1');
  });

});
