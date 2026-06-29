// ============================================
//  特殊兒童收養互動新聞 — script.js
// ============================================

const familyCases = [
    { 
        id: 1, 
        title: "收養檔案號：001", 
        content: "<strong>【高社經菁英家庭】</strong><br><strong>背景：</strong>先生（45歲）為科技業副總，太太（42歲）為外商銀行高管。年收破千萬，居住於市中心豪宅，並預先聘請全職保母。<br><strong>收養動機：</strong>經歷多年不孕，認為自身擁有頂級資源，能給予孩子最好的醫療與教育。<br><strong>支持系統：</strong>雙方父母皆在國外，無法請育嬰假，打算請保母帶。長輩傾向收養健康的小孩。" 
    },
    { 
        id: 2, 
        title: "收養檔案號：002", 
        content: "<strong>【雙薪彈性辦公家庭】</strong><br><strong>背景：</strong>先生（41歲）為科技業工程師，太太（39歲）為兼職會計。兩人收入中等但財務穩健。<br><strong>收養動機：</strong>結婚 8 年未生育，具備特殊兒早療志工經驗，理解「進步不是直線的」。<br><strong>支持系統：</strong>雙方長輩皆在外縣市，無法幫忙育兒，對於收養並無太大意見。先生工時長，目前正向公司爭取部分遠端辦公，太太會是主要照顧者。夫妻兩人已主動加入特殊兒家長互助社群，並確認住家附近有充足的早療資源與友善托育機構。" 
    },
    { 
        id: 3, 
        title: "收養檔案號：003", 
        content: "<strong>【傳統大家族企業】</strong><br><strong>背景：</strong>先生（38歲）為傳產接班人，與父母親戚同住透天別墅。太太（36歲）為全職家庭主婦。<br><strong>收養動機：</strong>面臨長輩傳宗接代壓力，妥協轉而尋求收養。<br><strong>支持系統：</strong>與公婆同住，雖有人手，但長輩對特殊兒帶有嚴重偏見，認為是業障，無法提供正向支持，反而會對主要照顧者施加極大壓力。" 
    }
];

// ---------- 狀態與全局路由 ----------
let gameState = {
  childAgeMonths: 12,     
  ageTimerInterval: null,
  currentCardIndex: 0,
  acceptedFamilies: 0,
  rejectedFamilies: 0,
  gameFailed: false,
  choices: [] 
};

let currentSectionId = 'stage-1-result';
let currentGameId = null;
let isNavigating = false;

function navigateTo(secId, gameId = null) {
    if (isNavigating) return;
    isNavigating = true;

    cleanupScreen(currentGameId);

    document.querySelectorAll('.screen-section, .game-screen').forEach(el => {
        el.classList.remove('active');
        el.classList.add('hidden');
    });

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

    setTimeout(() => isNavigating = false, 650); 
}

function cleanupScreen(id) {
    if (id === 'game-g3') {
        clearInterval(spawnInterval);
        clearInterval(countdownInterval);
        clearInterval(stressIncreaseInterval);
    }
}

function showNarrative(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('hidden');
}

function initScreen(id) {
    if (id === 'game-g3' && !gameState.ageTimerInterval && !gameState.gameFailed) {
        startAgeTimer();
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
        gameState.choices = []; 
        document.getElementById('g4-action-btns').classList.remove('hidden');
        renderCurrentCard();
        
        if (!gameState.ageTimerInterval && !gameState.gameFailed) {
            startAgeTimer();
        }
    }
    if (id === 'game-g5') {
        ['btn-eval-1', 'btn-eval-2', 'btn-eval-3', 'btn-eval-4'].forEach(b => {
            const btn = document.getElementById(b);
            if(btn) {
                btn.classList.remove('btn-pressed');
                if(b !== 'btn-eval-1') {
                    btn.disabled = true;
                    btn.style.opacity = '0.5';
                } else {
                    btn.disabled = false;
                    btn.style.opacity = '1';
                }
            }
        });
        ['narrative-eval-1', 'narrative-eval-2', 'narrative-eval-3', 'narrative-eval-4'].forEach(nid => {
            const el = document.getElementById(nid);
            if (el) el.classList.add('hidden');
        });
        document.getElementById('btn-g5-to-g6').classList.add('hidden');
    }
    if (id === 'game-g6') {
        document.getElementById('g6-end-actions').classList.add('hidden');
        
        ['narrative-proc-1', 'narrative-proc-2'].forEach(nid => {
            const el = document.getElementById(nid);
            if (el) el.classList.add('hidden');
        });
        const popup = document.getElementById('eval-form-popup');
        if (popup) popup.classList.add('hidden');
        const proc3Reminder = document.getElementById('narrative-proc-3');
        if(proc3Reminder) proc3Reminder.remove();
        
        // 若全部拒絕 (在第二步被攔截)
        if (gameState.acceptedFamilies === 0 && !gameState.gameFailed) {
            document.getElementById('g6-title').innerText = "最終結局";
            document.getElementById('g6-subtitle').classList.add('hidden');
            document.getElementById('g6-process-buttons').classList.add('hidden');
            
            const g6Msg = document.getElementById('g6-msg');
            let msgHTML = '<p style="font-size:1.3em;"><strong>❌ 結局：未媒合到適合家庭</strong></p><div style="text-align: left; margin-top:15px; font-size: 0.95em;"><p><strong>【社工結案評估】</strong></p><p>你審慎評估後，認為目前的家庭都不適合收養這名特殊兒童，全部予以拒絕。</p>';
            
            if (gameState.choices[1] === false) {
                msgHTML += '<p style="color: #d35400; margin-top: 10px;"><strong>❗ 錯過 002 家庭的惋惜：</strong>其實 002 家庭具備極高的包容度，他們務實地盤點了早療與社群資源來彌補無後援的缺口，母親也願意全職投入。在不完美的現實中，這反而是特殊兒難得的避風港。可惜你放手了這個機會。</p>';
            }
            
            msgHTML += '<p style="margin-top:10px;">孩子沒有找到家，只能繼續留在寄養體系中等待。隨著孩子年紀增長，這是一場沒有盡頭的消耗戰...</p></div>';
            
            g6Msg.innerHTML = msgHTML;
            g6Msg.className = 'pixel-box-inner error-state';
            g6Msg.classList.remove('hidden');
            
            showEndActions(gameState.childAgeMonths >= 72 ? '重新遊戲' : '再玩一次');
        } 
        // 正常進入收養程序
        else if (!gameState.gameFailed) {
            document.getElementById('g6-subtitle').classList.remove('hidden');
            document.getElementById('g6-process-buttons').classList.remove('hidden');
            ['btn-proc-1', 'btn-proc-2', 'btn-proc-3'].forEach(b => {
                const btn = document.getElementById(b);
                if(btn) {
                    btn.classList.remove('btn-pressed');
                    if(b !== 'btn-proc-1') {
                        btn.disabled = true;
                        btn.style.opacity = '0.5';
                    } else {
                        btn.disabled = false;
                        btn.style.opacity = '1';
                    }
                }
            });
            document.getElementById('g6-msg').classList.add('hidden');
            const popup2 = document.getElementById('eval-form-popup');
            if (popup2) popup2.classList.add('hidden');
            const evalBody = document.getElementById('eval-form-body');
            if (evalBody) evalBody.innerHTML = '';
        }
    }
}

function showEndActions(replayText) {
    document.getElementById('g6-end-actions').classList.remove('hidden');
    document.getElementById('btn-replay-game').innerText = replayText;
}

// 觸發大童難出養結局 (逾時)
function triggerTimeoutOutcome() {
    navigateTo('stage-2', 'game-g6');
    document.getElementById('g6-title').innerText = "最終結局";
    document.getElementById('g6-subtitle').classList.add('hidden');
    document.getElementById('g6-process-buttons').classList.add('hidden');
    
    const g6Msg = document.getElementById('g6-msg');
    g6Msg.innerHTML = '<p style="font-size:1.3em; color:#e74c3c;"><strong>❌ 結局：超過黃金收養期</strong></p><div style="text-align: left; margin-top:15px; font-size: 0.95em;"><p><strong>【社工結案評估】</strong></p><p>孩子在漫長的等待與程序中，已經超過了 6 歲。在台灣的收養環境中，大童的媒合難度極高，多數家庭傾向收養嬰幼兒。</p><p>孩子錯過了國內出養的黃金時期，難以找到願意接納的家庭，只能繼續在安置體系中長大...</p></div>';
    g6Msg.className = 'pixel-box-inner error-state';
    g6Msg.classList.remove('hidden');
    
    showEndActions('重新遊戲');
}

// ---------- 年齡計算系統 ----------
function updateAgeDisplay() {
  const years = Math.floor(gameState.childAgeMonths / 12);
  const months = gameState.childAgeMonths % 12;
  const el = document.getElementById('child-age');
  if (el) el.textContent = `${years}歲 ${months}個月`;

  const warning = document.getElementById('age-warning');
  if (gameState.childAgeMonths >= 36) {
      if (warning) warning.classList.remove('hidden');
      if (el) el.classList.add('age-alert');
  } else {
      if (warning) warning.classList.add('hidden');
      if (el) el.classList.remove('age-alert');
  }

  // 6歲強制結束
  if (gameState.childAgeMonths >= 72 && !gameState.gameFailed) {
    gameState.gameFailed = true;
    stopAgeTimer();
    triggerTimeoutOutcome();
  }
}

function startAgeTimer() {
  stopAgeTimer();
  gameState.ageTimerInterval = setInterval(() => {
    gameState.childAgeMonths++;
    updateAgeDisplay();
  }, 2000); 
}

function stopAgeTimer() {
  if (gameState.ageTimerInterval) {
    clearInterval(gameState.ageTimerInterval);
    gameState.ageTimerInterval = null;
  }
}

// ---------- 第一步：寄養家庭壓力小遊戲 ----------
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
        
        stressLevel = Math.max(0, stressLevel - 25);
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

// ---------- 第四步：收養人評估表（依第二步選擇動態產生）----------
const familyEvalData = [
  {
    id: '001',
    label: '高社經菁英家庭',
    recommended: false, // 建議不適合
    rows: [
      { item: '收養動機',     result: '⚠ 有疑慮',  cls: 'eval-warn',    note: '以「擁有頂級資源」為由，忽視孩子情感需求' },
      { item: '親職能力',     result: '待確認',     cls: 'eval-pending', note: '計劃全委保母照顧，缺乏直接親職參與' },
      { item: '支持系統',     result: '⚠ 有疑慮',  cls: 'eval-warn',    note: '長輩傾向收養健康兒童，對特殊兒支持度低' },
      { item: '兒童依附關係', result: '待觀察',     cls: 'eval-pending', note: '主要照顧者為保母，依附關係難以穩定建立' },
      { item: '同住成員態度', result: '⚠ 有疑慮',  cls: 'eval-warn',    note: '長輩在國外，態度傾向不接受特殊需求' },
      { item: '居家環境',     result: '✓ 適合',    cls: 'eval-ok',      note: '空間寬裕，醫療資源充足' },
    ]
  },
  {
    id: '002',
    label: '雙薪彈性辦公家庭',
    recommended: true, // 建議適合
    rows: [
      { item: '收養動機',     result: '✓ 適當',    cls: 'eval-ok',      note: '具早療志工經驗，理解特殊兒發展歷程' },
      { item: '親職能力',     result: '✓ 良好',    cls: 'eval-ok',      note: '太太為主要照顧者，已研究早療資源' },
      { item: '支持系統',     result: '觀察中',     cls: 'eval-pending', note: '長輩在外縣市，但已加入家長互助社群' },
      { item: '兒童依附關係', result: '建立中',     cls: 'eval-pending', note: '試養初期反應良好，持續追蹤' },
      { item: '同住成員態度', result: '✓ 支持',    cls: 'eval-ok',      note: '夫妻共識一致，長輩無強烈反對' },
      { item: '居家環境',     result: '✓ 適合',    cls: 'eval-ok',      note: '住家鄰近早療機構與友善托育' },
    ]
  },
  {
    id: '003',
    label: '傳統大家族企業',
    recommended: false, // 建議不適合
    rows: [
      { item: '收養動機',     result: '⚠ 有疑慮',  cls: 'eval-warn',    note: '源於長輩傳宗接代壓力，非自主意願' },
      { item: '親職能力',     result: '待確認',     cls: 'eval-pending', note: '太太為全職主婦，但主要照顧動機不明確' },
      { item: '支持系統',     result: '✗ 不足',    cls: 'eval-warn',    note: '同住長輩對特殊兒有嚴重偏見，視為「業障」' },
      { item: '兒童依附關係', result: '風險高',     cls: 'eval-warn',    note: '長輩負面態度將嚴重干擾依附關係建立' },
      { item: '同住成員態度', result: '✗ 反對',    cls: 'eval-warn',    note: '公婆明確排斥，對主要照顧者施加極大壓力' },
      { item: '居家環境',     result: '待評估',     cls: 'eval-pending', note: '透天別墅空間足夠，但家庭氣氛存有疑慮' },
    ]
  }
];

function buildEvalTable() {
  const body = document.getElementById('eval-form-body');
  if (!body) return;

  // 只顯示玩家在第二步「判斷為適合」的家庭（即最終進入試養流程的）
  // 若全部拒絕則不會到此步，故至少有一筆
  const accepted = gameState.choices
    .map((chosen, i) => chosen ? familyEvalData[i] : null)
    .filter(Boolean);

  // 若沒有被接受的（理論上不應發生），顯示全部
  const toShow = accepted.length > 0 ? accepted : familyEvalData;

  body.innerHTML = toShow.map(fam => {
    const verdict = fam.recommended
      ? `<span style="color:#16a34a;font-weight:bold;">✓ 建議通過</span>`
      : `<span style="color:#dc2626;font-weight:bold;">✗ 建議不通過</span>`;

    const rows = fam.rows.map(r =>
      `<tr>
        <td style="font-size:0.82em;">${r.item}</td>
        <td class="${r.cls}" style="white-space:nowrap;">${r.result}</td>
      </tr>`
    ).join('');

    return `
      <div style="margin-bottom:12px;">
        <div style="font-weight:bold;font-size:0.9em;margin-bottom:4px;text-align:left;">
          檔案號 ${fam.id}・${fam.label}
        </div>
        <table class="eval-table">${rows}</table>
        <div style="margin-top:5px;text-align:right;font-size:0.82em;">${verdict}</div>
      </div>`;
  }).join('<hr style="margin:10px 0;border-color:#e5e7eb;">');
}
function renderCurrentCard() {
  const container = document.getElementById('family-cards-container');
  if (!container) return;

  if (gameState.currentCardIndex >= familyCases.length) {
    container.innerHTML = '';
    document.getElementById('g4-action-btns').classList.add('hidden');
    
    const g4 = document.getElementById('game-g4');
    if (g4) { g4.classList.remove('active'); g4.classList.add('hidden'); }

    if (gameState.acceptedFamilies === 0) {
        setTimeout(() => {
            stopAgeTimer();
            navigateTo('stage-2', 'game-g6');
        }, 500);
        return;
    } else {
        setTimeout(() => {
            navigateTo('stage-2', 'game-g5');
        }, 500);
        return;
    }
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

  gameState.choices.push(isAccepted);

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

// ---------- 事件綁定與防呆滾動邏輯 ----------

document.addEventListener('DOMContentLoaded', () => {

  document.getElementById('btn-scroll-down')?.addEventListener('click', () => navigateTo('stage-2', 'game-main'));

  window.addEventListener('scroll', () => {
      if (isNavigating) return;
      if (currentSectionId === 'stage-1-result' && window.scrollY > 10) {
          navigateTo('stage-2', 'game-main');
      }
  }, { passive: true });

  window.addEventListener('wheel', (e) => {
      if (isNavigating) return;
      if (currentSectionId === 'stage-1-result' && e.deltaY > 10) {
          navigateTo('stage-2', 'game-main');
      }
  });

  let touchStartY = 0;
  window.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
  }, { passive: true });
  
  window.addEventListener('touchend', (e) => {
      if (isNavigating) return;
      const dy = touchStartY - e.changedTouches[0].clientY;
      if (currentSectionId === 'stage-1-result' && dy > 20) {
          navigateTo('stage-2', 'game-main');
      }
  });

  // ====== 點擊跳轉至完整報導網頁 ======
  document.querySelectorAll('.btn-to-stage-3').forEach(btn => {
    btn.addEventListener('click', () => {
      window.location.href = 'https://ceuwan1113-sys.github.io/05292/';
    });
  });

  document.getElementById('btn-start-task')?.addEventListener('click', () => {
    navigateTo('stage-2', 'game-g3');
  });

  document.getElementById('btn-start-foster-game')?.addEventListener('click', startFosterGame);
  document.getElementById('btn-g3-to-g4')?.addEventListener('click', () => navigateTo('stage-2', 'game-g4'));

  document.getElementById('btn-g4-accept')?.addEventListener('click', () => swipeCard(true));
  document.getElementById('btn-g4-reject')?.addEventListener('click', () => swipeCard(false));

  // === 第三步審查評估按鈕 (+3個月年齡) ===
  const btnEval1 = document.getElementById('btn-eval-1');
  const btnEval2 = document.getElementById('btn-eval-2');
  const btnEval3 = document.getElementById('btn-eval-3');
  const btnEval4 = document.getElementById('btn-eval-4');
  const btnG5ToG6 = document.getElementById('btn-g5-to-g6');

  btnEval1?.addEventListener('click', () => {
      btnEval1.classList.add('btn-pressed');
      gameState.childAgeMonths += 3; updateAgeDisplay();
      showNarrative('narrative-eval-1');
      if (btnEval2) { btnEval2.disabled = false; btnEval2.style.opacity = '1'; }
  });

  btnEval2?.addEventListener('click', () => {
      btnEval2.classList.add('btn-pressed');
      gameState.childAgeMonths += 3; updateAgeDisplay();
      showNarrative('narrative-eval-2');
      if (btnEval3) { btnEval3.disabled = false; btnEval3.style.opacity = '1'; }
  });

  btnEval3?.addEventListener('click', () => {
      btnEval3.classList.add('btn-pressed');
      gameState.childAgeMonths += 3; updateAgeDisplay();
      showNarrative('narrative-eval-3');
      if (btnEval4) { btnEval4.disabled = false; btnEval4.style.opacity = '1'; }
  });

  btnEval4?.addEventListener('click', () => {
      btnEval4.classList.add('btn-pressed');
      gameState.childAgeMonths += 3; updateAgeDisplay();
      showNarrative('narrative-eval-4');
      if (btnG5ToG6) { btnG5ToG6.classList.remove('hidden'); }
  });

  document.getElementById('btn-g5-to-g6')?.addEventListener('click', () => {
    if (gameState.gameFailed) return;
    stopAgeTimer(); 
    navigateTo('stage-2', 'game-g6');
    document.getElementById('g6-title').innerText = "第四步：進入收養程序";
  });

  // === 第四步收養程序與結局判定 ===
  const btnProc1 = document.getElementById('btn-proc-1');
  const btnProc2 = document.getElementById('btn-proc-2');
  const btnProc3 = document.getElementById('btn-proc-3');
  const g6Msg = document.getElementById('g6-msg');

  btnProc1?.addEventListener('click', () => {
      btnProc1.classList.add('btn-pressed');
      showNarrative('narrative-proc-1');
      if (btnProc2) {
          btnProc2.disabled = false;
          btnProc2.style.opacity = '1';
      }
  });

  btnProc2?.addEventListener('click', () => {
      btnProc2.classList.add('btn-pressed');
      showNarrative('narrative-proc-2');
      buildEvalTable();
      const popup = document.getElementById('eval-form-popup');
      if (popup) popup.classList.remove('hidden');
      if (btnProc3) { btnProc3.disabled = false; btnProc3.style.opacity = '1'; }
  });

  btnProc3?.addEventListener('click', () => {
      btnProc3.classList.add('btn-pressed');
      
      const ageYears = Math.floor(gameState.childAgeMonths / 12);
      const ageMons = gameState.childAgeMonths % 12;
      const proc3Reminder = document.createElement('div');
      proc3Reminder.id = 'narrative-proc-3';
      proc3Reminder.className = 'eval-narrative';
      proc3Reminder.style.maxWidth = '420px';
      proc3Reminder.style.margin = '10px auto';
      proc3Reminder.innerHTML = `⚖️ 聲請書送出，法院平均處理時間：3–6 個月。<br><strong style="color:#e74c3c;">孩子現在 ${ageYears} 歲 ${ageMons} 個月了。</strong>`;
      btnProc3.parentElement.appendChild(proc3Reminder);
      
      const isPerfectMatch = (gameState.choices[0] === false && gameState.choices[1] === true && gameState.choices[2] === false);

      if (g6Msg) {
          if (isPerfectMatch) {
              document.getElementById('g6-title').innerText = "最終結局";
              g6Msg.innerHTML = '<p style="font-size:1.3em; color:#2ecc71;"><strong>🎉 恭喜！收養程序順利完成！</strong></p><div style="text-align: left; margin-top:15px; font-size: 0.95em;"><p><strong>【社工結案評估】</strong></p><p>你做出了最敏銳的判斷！002家庭雖然沒有長輩後援且先生工時長，但他們務實地尋求外部資源，主動加入互助社群並盤點早療機構。母親有全職投入的意願，加上過往的志工經驗，讓他們能以務實且包容的心態接住孩子。在不完美的現實中，這已是孩子難得的避風港。</p></div>';
              g6Msg.className = 'pixel-box-inner success-state';
          } else {
              document.getElementById('g6-title').innerText = "最終結局";
              let failReasons = '';
              if (gameState.choices[0] === true) {
                  failReasons += '<p><strong>❌ 001 高社經家庭：</strong>雙方皆無法親自陪伴，將照顧外包，且長輩傾向健康小孩。將醫療視為修復工具會給特殊兒帶來極大壓力，缺乏真正的包容。</p>';
              }
              if (gameState.choices[2] === true) {
                  failReasons += '<p><strong>❌ 003 大家族企業：</strong>太太承受極大家族壓力，同住長輩對特殊狀況帶有偏見。孩子極易成為家族矛盾導火線，缺乏無條件接納的安全感。</p>';
              }
              if (gameState.choices[1] === false) {
                  failReasons += '<p style="color: #d35400; margin-top: 10px;"><strong>❗ 錯過 002 家庭的惋惜：</strong>其實 002 家庭具備極高的包容度，他們務實地盤點了早療與社群資源來彌補無後援的缺口，母親也願意全職投入。在不完美的現實中，這反而是特殊兒難得的避風港。可惜你放手了這個機會。</p>';
              }
              
              g6Msg.innerHTML = `<p style="font-size:1.3em; color:#e74c3c;"><strong>❌ 結局：收養宣告失敗</strong></p><div style="text-align: left; margin-top:15px; font-size: 0.95em;"><p><strong>【社工結案評估】</strong></p><p>試養與評估過程中發生嚴重適應問題，程序被迫終止：</p>${failReasons}<p style="margin-top:10px;">孩子只能退回安置體系，繼續漫長而未知的等待...</p></div>`;
              g6Msg.className = 'pixel-box-inner error-state';
          }
          g6Msg.classList.remove('hidden');
          
          const replayText = gameState.childAgeMonths >= 72 ? '重新遊戲' : '再玩一次';
          showEndActions(replayText);
      }
  });

  // === 重新遊戲 / 再玩一次 邏輯 ===
  document.getElementById('btn-replay-game')?.addEventListener('click', () => {
      if (gameState.childAgeMonths >= 72 || gameState.gameFailed) {
          gameState.childAgeMonths = 12; 
          gameState.gameFailed = false;
      }
      
      navigateTo('stage-2', 'game-g4');
  });

});
