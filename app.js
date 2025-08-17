// -------------------- PLAYER & JOYSTICK --------------------
const player = document.getElementById("player");
const joystick = document.getElementById("joystick");
const gameHolder = document.getElementById("gameHolder");

let posX = 300, posY = 300;
let moveSpeedX = 0, moveSpeedY = 0;
let targetSpeedX = 0, targetSpeedY = 0;
let maxSpeed = 4;
const accel = 0.2;

// -------------------- LOAD SAVED DATA --------------------
let coins = parseInt(localStorage.getItem('coins')) || 0;
let coinValue = parseInt(localStorage.getItem('coinValue')) || 1;
let coinSpawnSpeed = parseInt(localStorage.getItem('coinSpawnSpeed')) || 2000;
let coinsPerSpawn = parseInt(localStorage.getItem('coinsPerSpawn')) || 1;
let rebirths = parseInt(localStorage.getItem('rebirths')) || 0;

// Upgrade levels
let spawnLevel = parseInt(localStorage.getItem('spawnSpeedLevel')) || 0;
let coinValueLevel = parseInt(localStorage.getItem('coinValueLevel')) || 0;
let coinsPerSpawnLevel = parseInt(localStorage.getItem('coinsPerSpawnLevel')) || 0;

// Max upgrade base
const maxUpgradeBase = 10;

// Apply rebirth effects
if(rebirths>0){
    player.style.transform=`scale(${1+0.1*rebirths})`;
    maxSpeed = 4 + rebirths*0.5;
}

// -------------------- KEYBOARD CONTROLS --------------------
const keys={};
document.addEventListener("keydown",e=>{ keys[e.key.toLowerCase()]=true; updateTargetSpeed(); });
document.addEventListener("keyup",e=>{ keys[e.key.toLowerCase()]=false; updateTargetSpeed(); });
function updateTargetSpeed(){
    targetSpeedX=0; targetSpeedY=0;
    if(keys['a']||keys['arrowleft']) targetSpeedX=-maxSpeed;
    if(keys['d']||keys['arrowright']) targetSpeedX=maxSpeed;
    if(keys['w']||keys['arrowup']) targetSpeedY=-maxSpeed;
    if(keys['s']||keys['arrowdown']) targetSpeedY=maxSpeed;
}

// -------------------- JOYSTICK --------------------
let joyActive=false, joyStart={x:0,y:0}, joyOffset={x:0,y:0}, maxRange=40;
function startDrag(x,y){ joyActive=true; joyStart={x,y}; }
function moveDrag(x,y){
    if(!joyActive) return;
    const dx=x-joyStart.x, dy=y-joyStart.y;
    const dist=Math.min(Math.sqrt(dx*dx+dy*dy), maxRange);
    const angle=Math.atan2(dy,dx);
    joyOffset.x=Math.cos(angle)*dist;
    joyOffset.y=Math.sin(angle)*dist;
    joystick.style.transform=`translate(${joyOffset.x}px,${joyOffset.y}px)`;
    targetSpeedX=(joyOffset.x/maxRange)*maxSpeed;
    targetSpeedY=(joyOffset.y/maxRange)*maxSpeed;
}
function endDrag(){ joyActive=false; joyOffset={x:0,y:0}; joystick.style.transform='translate(0,0)'; targetSpeedX=0; targetSpeedY=0; }

joystick.addEventListener("touchstart",e=>startDrag(e.touches[0].clientX,e.touches[0].clientY));
joystick.addEventListener("touchmove",e=>moveDrag(e.touches[0].clientX,e.touches[0].clientY));
joystick.addEventListener("touchend",endDrag);
joystick.addEventListener("mousedown",e=>startDrag(e.clientX,e.clientY));
window.addEventListener("mousemove",e=>moveDrag(e.clientX,e.clientY));
window.addEventListener("mouseup",endDrag);

// -------------------- SAVE --------------------
function saveProgress(){
    localStorage.setItem('coins',coins);
    localStorage.setItem('coinValue',coinValue);
    localStorage.setItem('coinSpawnSpeed',coinSpawnSpeed);
    localStorage.setItem('coinsPerSpawn',coinsPerSpawn);
    localStorage.setItem('rebirths',rebirths);
    localStorage.setItem('spawnSpeedLevel',spawnLevel);
    localStorage.setItem('coinValueLevel',coinValueLevel);
    localStorage.setItem('coinsPerSpawnLevel',coinsPerSpawnLevel);
}

// -------------------- COINS --------------------
const coinCountSpan=document.getElementById('coinCount');
const MAX_COINS = 200;

function spawnCoins(){
    const existingCoins = document.querySelectorAll('.coin').length;
    if(existingCoins >= MAX_COINS) return;

    for(let i=0;i<coinsPerSpawn;i++){
        if(document.querySelectorAll('.coin').length >= MAX_COINS) break;

        const coin=document.createElement('div');
        coin.classList.add('coin'); 
        coin.textContent='¢';

        let x, y;
        const joystickSafeWidth = joystick.offsetLeft + joystick.offsetWidth + 100;
        const joystickSafeHeight = joystick.offsetTop + joystick.offsetHeight + 100;

        do {
            x = Math.random() * (gameHolder.clientWidth - 30);
            y = Math.random() * (gameHolder.clientHeight - 30);
        } while(x < joystickSafeWidth && y > gameHolder.clientHeight - joystickSafeHeight);

        coin.style.left = x + 'px'; 
        coin.style.top = y + 'px';
        gameHolder.appendChild(coin);
    }
}

// -------------------- SHOP --------------------
const shopToggle=document.getElementById('shopToggle');
const shopDropdown=document.getElementById('shopDropdown');
shopToggle.addEventListener('click',()=>{ shopDropdown.style.display=(shopDropdown.style.display==='block')?'none':'block'; updateUpgradeButtons(); });

function getUpgradeCost(base,level){ return Math.floor(base*Math.pow(1.5,level)); }

function updateUpgradeButtons(){
    const maxUpgradeMultiplier = 1 + rebirths;
    const spawnCost=getUpgradeCost(10,spawnLevel);
    const coinValueCost=getUpgradeCost(20,coinValueLevel);
    const coinsPerSpawnCost=getUpgradeCost(30,coinsPerSpawnLevel);

    const spawnBtn=document.getElementById('upgradeSpawnSpeed');
    const valueBtn=document.getElementById('upgradeCoinValue');
    const perSpawnBtn=document.getElementById('upgradeCoinsPerSpawn');

    spawnBtn.textContent=`Upgrade (${spawnCost} Coins)`;
    valueBtn.textContent=`Upgrade (${coinValueCost} Coins)`;
    perSpawnBtn.textContent=`Upgrade (${coinsPerSpawnCost} Coins)`;

    spawnBtn.disabled = coins<spawnCost || spawnLevel>=maxUpgradeBase*maxUpgradeMultiplier;
    valueBtn.disabled = coins<coinValueCost || coinValueLevel>=maxUpgradeBase*maxUpgradeMultiplier;
    perSpawnBtn.disabled = coins<coinsPerSpawnCost || coinsPerSpawnLevel>=maxUpgradeBase*maxUpgradeMultiplier;

    [spawnBtn,valueBtn,perSpawnBtn].forEach(btn=>{
        btn.style.opacity=btn.disabled?'0.5':'1';
        btn.style.cursor=btn.disabled?'not-allowed':'pointer';
    });
}

document.getElementById('upgradeSpawnSpeed').addEventListener('click',()=>{
    const maxUpgradeMultiplier = 1 + rebirths;
    const cost=getUpgradeCost(10,spawnLevel);
    if(coins>=cost && spawnLevel<maxUpgradeBase*maxUpgradeMultiplier){
        coins-=cost; coinSpawnSpeed=Math.max(200,coinSpawnSpeed-200); spawnLevel++;
        coinCountSpan.textContent=coins; saveProgress(); clearInterval(spawnInterval); spawnInterval=setInterval(spawnCoins,coinSpawnSpeed); updateUpgradeButtons();
    }
});
document.getElementById('upgradeCoinValue').addEventListener('click',()=>{
    const maxUpgradeMultiplier = 1 + rebirths;
    const cost=getUpgradeCost(20,coinValueLevel);
    if(coins>=cost && coinValueLevel<maxUpgradeBase*maxUpgradeMultiplier){
        coins-=cost; coinValue+=1; coinValueLevel++;
        coinCountSpan.textContent=coins; saveProgress(); updateUpgradeButtons();
    }
});
document.getElementById('upgradeCoinsPerSpawn').addEventListener('click',()=>{
    const maxUpgradeMultiplier = 1 + rebirths;
    const cost=getUpgradeCost(30,coinsPerSpawnLevel);
    if(coins>=cost && coinsPerSpawnLevel<maxUpgradeBase*maxUpgradeMultiplier){
        coins-=cost; coinsPerSpawn+=1; coinsPerSpawnLevel++;
        coinCountSpan.textContent=coins; saveProgress(); updateUpgradeButtons();
    }
});

// -------------------- REBIRTH --------------------
const rebirthToggle=document.getElementById('rebirthToggle');
const rebirthDropdown=document.getElementById('rebirthDropdown');
const doRebirthBtn=document.getElementById('doRebirth');
const rebirthCountSpan=document.getElementById('rebirthCount');
const rebirthCostSpan=document.getElementById('rebirthCost');

function getRebirthCost(level){ return 100000 * Math.pow(2,level); }
function updateRebirthUI(){ 
    rebirthCountSpan.textContent=rebirths; 
    const cost=getRebirthCost(rebirths);
    rebirthCostSpan.textContent=cost.toLocaleString();
    doRebirthBtn.disabled=coins<cost || rebirths>=10;
    doRebirthBtn.style.opacity=doRebirthBtn.disabled?'0.5':'1';
    doRebirthBtn.style.cursor=doRebirthBtn.disabled?'not-allowed':'pointer';
}
rebirthToggle.addEventListener('click',()=>{ rebirthDropdown.style.display=(rebirthDropdown.style.display==='block')?'none':'block'; updateRebirthUI(); });

doRebirthBtn.addEventListener('click',()=>{ 
    const cost=getRebirthCost(rebirths);
    if(coins>=cost && rebirths<10){
        coins=0; coinValue=1; coinSpawnSpeed=2000; coinsPerSpawn=1;
        spawnLevel=coinValueLevel=coinsPerSpawnLevel=0;

        localStorage.removeItem('spawnSpeedLevel'); 
        localStorage.removeItem('coinValueLevel'); 
        localStorage.removeItem('coinsPerSpawnLevel');

        rebirths+=1;
        player.style.transform=`scale(${1+0.1*rebirths})`;
        maxSpeed=4+rebirths*0.5;

        saveProgress();
        updateUpgradeButtons();
        updateRebirthUI();
        clearInterval(spawnInterval);
        spawnInterval=setInterval(spawnCoins,coinSpawnSpeed);
    }
});

// -------------------- ACCESSORIES --------------------
const accessoriesToggle = document.getElementById('accessoriesToggle');
const accessoriesDropdown = document.getElementById('accessoriesDropdown');
const equippedAccessorySpan = document.getElementById('equippedAccessory');

let ownedAccessories = JSON.parse(localStorage.getItem('ownedAccessories')) || [];
let equippedAccessory = localStorage.getItem('equippedAccessory') || null;

accessoriesToggle.addEventListener('click',()=>{
    accessoriesDropdown.style.display = accessoriesDropdown.style.display==='block'?'none':'block';
    updateAccessoriesUI();
});

function updateAccessoriesUI(){
    equippedAccessorySpan.textContent = equippedAccessory || 'None';
    document.querySelectorAll('.buyAccessory').forEach(btn=>{
        const item = btn.dataset.item;
        if(ownedAccessories.includes(item)){
            btn.textContent = (equippedAccessory === item) ? 'Equipped' : 'Equip';
            btn.disabled = (equippedAccessory === item);
        } else {
            btn.textContent = `Buy (${btn.dataset.cost} Coins)`;
            btn.disabled = coins < parseInt(btn.dataset.cost);
        }
        btn.style.opacity = btn.disabled ? '0.5' : '1';
        btn.style.cursor = btn.disabled ? 'not-allowed' : 'pointer';
    });
}

// Handle accessory clicks
document.querySelectorAll('.buyAccessory').forEach(btn=>{
    btn.addEventListener('click',()=>{
        const item = btn.dataset.item;
        const cost = parseInt(btn.dataset.cost);

        if(!ownedAccessories.includes(item) && coins >= cost){
            coins -= cost;
            ownedAccessories.push(item);
            equippedAccessory = item;
            localStorage.setItem('ownedAccessories', JSON.stringify(ownedAccessories));
            localStorage.setItem('equippedAccessory', equippedAccessory);
            coinCountSpan.textContent = coins;
            saveProgress();
            applyAccessory();
        } else if (ownedAccessories.includes(item) && equippedAccessory !== item){
            equippedAccessory = item;
            localStorage.setItem('equippedAccessory', equippedAccessory);
            applyAccessory();
        }
        updateAccessoriesUI();
    });
});

// Apply accessory by swapping character image
function applyAccessory(){
    if(equippedAccessory){
        const accName = equippedAccessory.charAt(0).toUpperCase() + equippedAccessory.slice(1);
        player.style.backgroundImage = `url('assets/Character${accName}.png')`;
    } else {
        player.style.backgroundImage = `url('assets/Character.png')`;
    }
}

// Apply on load
applyAccessory();
updateAccessoriesUI();

// -------------------- GIVE IDEAS BUTTON --------------------
document.getElementById('giveIdeasBtn').addEventListener('click', () => {
    window.open('https://docs.google.com/forms/d/e/1FAIpQLSeILZ3bEIn9grc5d05yv3WmxwtFrB6rldg7K_2y2G7s19D5WQ/viewform?usp=dialog', '_blank');
});

// -------------------- SPAWN INTERVAL --------------------
let spawnInterval = setInterval(spawnCoins, coinSpawnSpeed);

// -------------------- GAME LOOP --------------------
function gameLoop(){
    moveSpeedX += (targetSpeedX - moveSpeedX) * accel;
    moveSpeedY += (targetSpeedY - moveSpeedY) * accel;

    posX += moveSpeedX;
    posY += moveSpeedY;

    posX = Math.max(0, Math.min(gameHolder.clientWidth-50, posX));
    posY = Math.max(0, Math.min(gameHolder.clientHeight-50, posY));

    player.style.left = posX + 'px';
    player.style.top = posY + 'px';

    // Collect coins
    document.querySelectorAll('.coin').forEach(c=>{
        const rectC=c.getBoundingClientRect();
        const rectP=player.getBoundingClientRect();
        if(!(rectC.right<rectP.left || rectC.left>rectP.right || rectC.bottom<rectP.top || rectC.top>rectP.bottom)){
            coins+=coinValue;
            coinCountSpan.textContent = coins;
            c.remove();
            saveProgress();
            updateUpgradeButtons();
            updateAccessoriesUI();
            updateRebirthUI();
        }
    });

    requestAnimationFrame(gameLoop);
}

gameLoop();
