// ============================================
//  特殊兒童收養互動新聞 — script.js
// ============================================

const familyCases = [
    { 
        id: 1, 
        title: "收養檔案號：001", 
        content: "<strong>【高社經菁英家庭】</strong><br><strong>背景：</strong>先生（45歲）為科技業副總，太太（42歲）為外商銀行高管。年收破千萬，居住於市中心豪宅，並已預先聘請全職保母。<br><strong>收養動機：</strong>經歷多年不孕，認為自身擁有頂級資源，能給予孩子最好的醫療與教育。<br><strong>社工評估筆記：</strong>夫妻雙方皆處於極高壓、長工時的環境，且表示無法配合請育嬰假。面對特殊兒密集的早療需求，他們傾向「花錢請專業保母與看護解決」，期待孩子能透過醫療跟上一般人的發展標準。" 
    },
    { 
        id: 2, 
        title: "收養檔案號：002", 
        content: "<strong>【雙薪彈性辦公家庭】</strong><br><strong>背景：</strong>先生（41歲）為遠距工作的接案工程師，太太（39歲）為兼職會計。兩人收入中等但財務規劃穩健，居住於有電梯的社區大樓。<br><strong>收養動機：</strong>結婚 8 年未生育，兩年前開始接觸特殊兒早療志工服務，深刻理解「進步不是直線的」，願意以孩子的步調為中心。<br><strong>社工評估筆記：</strong>家庭展現出極高的<strong>「包容度」與「工作彈性」</strong>。先生的遠端工作型態能隨時機動配合每週數次的醫院復健與早療課程；太太已計畫在收養初期的前兩年轉為全職，專心與孩子建立安全依附關係。他們在會談中表示，不期待孩子變得「正常」，而是準備好陪孩子面對真實的人生。" 
    },
    { 
        id: 3, 
        title: "收養檔案號：003", 
        content: "<strong>【傳統大家族企業】</strong><br><strong>背景：</strong>先生（38歲）為中南部傳統傳產接班人，與父母及親戚同住透天別墅。太太（36歲）為全職家庭主婦。<br><strong>收養動機：</strong>結婚 7 年無子，面臨家族長輩龐大的傳宗接代壓力，妥協轉而尋求收養。<br><strong>社工評估筆記：</strong>主要照顧者（太太）承受極大家族壓力，收養動機參雜了「穩固家庭地位」的考量。此外，同住的長輩對「特殊身心狀況」仍帶有傳統偏見，認為是「業障」或「有失顏面」。在這種環境下，特殊兒童極易成為家族矛盾的導火線，缺乏被無條件接納的空間。" 
    }
];

// ---------- 遊戲狀態 ----------
let gameState = {
  childAgeMonths: 12,     
  ageTimerInterval: null,
  currentCardIndex: 0,
  acceptedFamilies: 0,
  rejectedFamilies: 0,
  gameFailed: false
};

// ---------- 工具函式 ----------
function showScreen(id) {
  document.querySelectorAll('.screen-section').forEach(s => {
      s.classList.remove('active');
      s.classList.add('hidden');
  });
  const el = document.getElementById(id);
  if (el) {
      el.classList.remove('hidden');
      el.classList.add('active');
  }
}

function showGameScreen(id) {
  document.querySelectorAll('.game-screen').forEach(s => {
      s.classList.remove('active');
      s.classList.add('hidden');
  });
  const el = document.getElementById(id);
  if (el) {
      el.classList.remove('hidden');
      el.classList.add('active');
  }
}

function updateAgeDisplay() {
  const years = Math.floor(gameState.childAgeMonths / 12);
  const months = gameState.childAgeMonths % 12;
  const el = document.getElementById('child-age');
  if (el) el.textContent = `${years}歲 ${months}個月`;

  const warning = document.getElementById('age-warning');
  if (warning) {
    if (gameState.childAgeMonths >= 36) {
      warning.classList.remove('hidden');
    } else {
      warning.classList.add('hidden');
    }
  }

  if (gameState.childAgeMonths >= 72 && !gameState.gameFailed) {
    gameState.gameFailed = true;
    stopAgeTimer();
    showGameScreen('game-r1');
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
        msgBox.innerHTML = "<p><strong>驚險撐過這段時期！</strong><br>寄養家庭雖然辛苦，但成功維持了孩子的穩定。然而寄養只是短暫的過客，我們必須趕快幫孩子尋找永久的家。</p>";
        msgBox.className = 'pixel-box-inner success-state';
    } else {
        msgBox.innerHTML = "<p><strong>💥 壓力爆表！</strong><br>寄養家庭無法負荷照顧壓力，孩子被迫轉換安置機構，在等待與重新適應中耗費了大量光陰... <strong>(耗時增加 3 個月)</strong></p>";
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
        
        setTimeout(() => {
            if (area.contains(bubble)) bubble.remove();
        }, 200);
    });

    area.appendChild(bubble);

    setTimeout(() => {
        if (area.contains(bubble) && !bubble.classList.contains('popped')) {
            bubble.remove();
        }
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
        if (gameTimer <= 0) {
            endFosterGame(true); 
        }
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

// 蓋章與翻頁動畫
function swipeCard(isAccepted) {
  const container = document.getElementById('family-cards-container');
  const card = container ? container.querySelector('.family-card') : null;

  if (card) {
    const stamp = document.createElement('div');
    stamp.style.position = 'absolute';
    stamp.style.top = '40%';
    stamp.style.left = '50%';
    stamp.style.transform = 'translate(-50%, -50%) rotate(-15deg) scale(2)';
    stamp.style.fontSize = '2.5rem';
    stamp.style.fontWeight = 'bold';
    stamp.style.border = '5px solid';
    stamp.style.padding = '10px 25px';
    stamp.style.borderRadius = '15px';
    stamp.style.zIndex = '100';
    stamp.style.opacity = '0';
    stamp.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    stamp.style.fontFamily = 'monospace';
    stamp.style.backgroundColor = 'rgba(255, 255, 255, 0.85)';
    
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
    if (isAccepted) {
      gameState.acceptedFamilies++;
    } else {
      gameState.rejectedFamilies++;
    }
    gameState.currentCardIndex++;
    renderCurrentCard();
  }, 1100);
}

// ---------- 事件綁定與上下滑動控制 ----------
let hasScrolledToGame = false;
let hasStartedG1 = false; // 控制是否進入了遊戲的第一步(倒計時開始)

function goToStage2() {
    if (hasScrolledToGame) return;
    hasScrolledToGame = true;
    showScreen('stage-2');
    showGameScreen('game-main');
}

function goToStage1() {
    if (!hasScrolledToGame) return;
    hasScrolledToGame = false;
    showScreen('stage-1-result');
}

function goToG1() {
    if (hasStartedG1) return;
    hasStartedG1 = true;
    showGameScreen('game-g1');
    startAgeTimer();
}

document.addEventListener('DOMContentLoaded', () => {

  // --- 首頁下滑/上滑切換邏輯 ---
  document.getElementById('btn-scroll-down')?.addEventListener('click', goToStage2);
  document.getElementById('btn-scroll-g1')?.addEventListener('click', goToG1);

  // 滑鼠滾輪
  window.addEventListener('wheel', (e) => {
      const resultPage = document.getElementById('stage-1-result');
      const stage2 = document.getElementById('stage-2');
      const gameMain = document.getElementById('game-main');

      if (resultPage && resultPage.classList.contains('active')) {
          if (e.deltaY > 15) { // 下滑進入遊戲前導頁
              goToStage2();
          }
      } else if (stage2 && stage2.classList.contains('active') && gameMain && gameMain.classList.contains('active')) {
          if (e.deltaY < -15) { // 上滑回到首頁
              goToStage1();
          } else if (e.deltaY > 15) { // 下滑正式進入第一步
              goToG1();
          }
      }
  });

  // 手機觸控滑動
  let touchStartY = 0;
  window.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
  });
  window.addEventListener('touchend', (e) => {
      const touchEndY = e.changedTouches[0].clientY;
      const resultPage = document.getElementById('stage-1-result');
      const stage2 = document.getElementById('stage-2');
      const gameMain = document.getElementById('game-main');

      if (resultPage && resultPage.classList.contains('active')) {
          if (touchStartY - touchEndY > 40) { // 畫面上移 (向下滑動)
              goToStage2();
          }
      } else if (stage2 && stage2.classList.contains('active') && gameMain && gameMain.classList.contains('active')) {
          if (touchEndY - touchStartY > 40) { // 畫面下移 (向上滑動)
              goToStage1();
          } else if (touchStartY - touchEndY > 40) { // 向下滑動
              goToG1();
          }
      }
  });

  // --- 各區塊按鈕綁定 ---
  document.querySelectorAll('.btn-to-stage-3').forEach(btn => {
    btn.addEventListener('click', () => {
      showScreen('stage-3');
      window.scrollTo(0, 0);
    });
  });

  document.getElementById('btn-g1-next')?.addEventListener('click', () => {
    showGameScreen('game-g3');
  });

  document.getElementById('btn-start-foster-game')?.addEventListener('click', () => {
    startFosterGame();
  });

  document.getElementById('btn-g3-to-g4')?.addEventListener('click', () => {
    showGameScreen('game-g4');
    gameState.currentCardIndex = 0;
    gameState.acceptedFamilies = 0;
    gameState.rejectedFamilies = 0;
    renderCurrentCard();
  });

  document.getElementById('btn-g4-accept')?.addEventListener('click', () => {
    swipeCard(true);
  });

  document.getElementById('btn-g4-reject')?.addEventListener('click', () => {
    swipeCard(false);
  });

  document.getElementById('btn-g4-to-g5')?.addEventListener('click', () => {
    showGameScreen('game-g5');
    const nEl = document.getElementById('g5-n-value');
    if (nEl) nEl.textContent = gameState.acceptedFamilies;
    gameState.childAgeMonths += gameState.acceptedFamilies * 3;
    updateAgeDisplay();
  });

  document.getElementById('btn-g5-to-g6')?.addEventListener('click', () => {
    if (gameState.gameFailed) return;
    stopAgeTimer();
    showGameScreen('game-g6');
  });

  const btnProc1 = document.getElementById('btn-proc-1');
  const btnProc2 = document.getElementById('btn-proc-2');
  const btnProc3 = document.getElementById('btn-proc-3');
  const g6Msg = document.getElementById('g6-msg');
  const btnG6ToR = document.getElementById('btn-g6-to-r');

  btnProc1?.addEventListener('click', () => {
      btnProc1.classList.add('btn-pressed');
      if (btnProc2) {
          btnProc2.disabled = false;
          btnProc2.style.opacity = '1';
      }
  });

  btnProc2?.addEventListener('click', () => {
      btnProc2.classList.add('btn-pressed');
      if (btnProc3) {
          btnProc3.disabled = false;
          btnProc3.style.opacity = '1';
      }
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
    if (gameState.acceptedFamilies > 0) {
      showGameScreen('game-r2');
    } else {
      showGameScreen('game-r1');
    }
  });

});
