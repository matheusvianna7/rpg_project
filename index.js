import characterData from "./data.js";
import Character from "./Character.js";

const monsterIds = ["orc", "demon", "goblin"];
let monstersArray = [];
let heroesArray = ["wizard", "knight", "elf"];
let isWaiting = false;
let hero;
let monster;

function getShuffledMonsters() {
  const shuffledMonsters = [...monsterIds];
  for (let index = shuffledMonsters.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffledMonsters[index], shuffledMonsters[randomIndex]] = [
      shuffledMonsters[randomIndex],
      shuffledMonsters[index],
    ];
  }
  return shuffledMonsters;
}

function getNewMonster() {
  const nextMonsterData = characterData[monstersArray.shift()];
  return nextMonsterData ? new Character(nextMonsterData) : {};
}

function calculateAttackDamage(character) {
  const diceTotal = character.currentDiceScore.reduce(
    (total, num) => total + num,
    0,
  );

  return diceTotal + character.attack;
}

function calculateFireballDamage(character) {
  return character.currentDiceScore.reduce((total, roll) => {
    if (roll <= 3) return total + 1;
    if (roll <= 5) return total + 8;
    return total + 10;
  }, 0);
}

function calculateShieldBashDamage(character) {
  const rolls = character.currentDiceScore;
  if (rolls.every((roll) => roll === 6)) return 25;
  if (rolls.includes(6)) return 22;

  return rolls.reduce((total, roll) => total + (roll <= 3 ? 1 : 10), 0);
}

function calculateArrowShotDamage(character) {
  const highestRoll = Math.max(...character.currentDiceScore);
  if (highestRoll <= 2) return 4;
  if (highestRoll <= 4) return 8;
  if (highestRoll === 5) return 10;
  return 15;
}

function calculateCounterAttackDamage(character, applySixBonus = false) {
  const reducedDamage = Math.ceil(calculateAttackDamage(character) / 2);
  const bonusDamage =
    applySixBonus && character.currentDiceScore.includes(6) ? 5 : 0;

  return reducedDamage + bonusDamage;
}

function showBattleMessage(message) {
  const messageElement = document.getElementById("battle-message");
  messageElement.innerHTML = message;
  messageElement.hidden = false;
}

function formatAttackRoll(character) {
  const diceTotal = character.currentDiceScore.reduce(
    (total, roll) => total + roll,
    0,
  );
  const attackBonus = character.attack ? ` (+${character.attack} attack)` : "";

  return `${character.currentDiceScore.join(" + ")} = ${diceTotal}${attackBonus}`;
}

function formatDiceRolls(character) {
  return character.currentDiceScore.join(" + ");
}

const abilityDamageCalculators = {
  Fireball: calculateFireballDamage,
  "Shield Bash": calculateShieldBashDamage,
  "Arrow Shot": calculateArrowShotDamage,
};

function calculateActionDamage(character, action, isHeroAction) {
  if (action === "ability") {
    return abilityDamageCalculators[character.specialAttack](character);
  }

  if (action === "counterAttack") {
    return calculateCounterAttackDamage(character, isHeroAction);
  }

  return calculateAttackDamage(character);
}

function getActionMessage(actor, target, action, damage) {
  let heading;
  let emoji;
  if (action === "ability") {
    heading = actor.specialAttack.toUpperCase();
    emoji = { Fireball: "🔥", "Shield Bash": "🛡️", "Arrow Shot": "🏹" }[
      actor.specialAttack
    ];
  } else if (action === "counterAttack") {
    heading = `${actor.name.toUpperCase()} COUNTERS!`;
    emoji = "🛡️";
  } else {
    heading = `${actor.name.toUpperCase()} ATTACKS!`;
    emoji = "⚔️";
  }

  const diceResult =
    action === "ability" || action === "counterAttack"
      ? formatDiceRolls(actor)
      : formatAttackRoll(actor);
  const damageMessage =
    action === "ability"
      ? `${actor.name} deals ${damage} damage!`
      : `${target.name} takes ${damage} damage!`;

  return `
    <strong class="battle-message-title">${emoji} ${heading}</strong>
    <span class="battle-message-line">🎲 ${diceResult}</span>
    <span class="battle-message-line">💥 ${damageMessage}</span>
  `;
}

function resolveTurn(playerAction) {
  if (isWaiting) return;
  if (
    playerAction === "ability" &&
    (!hero.specialAttack ||
      hero.abilityUsed ||
      !abilityDamageCalculators[hero.specialAttack])
  ) {
    return;
  }

  hero.setDiceHtml();
  monster.setDiceHtml();

  const heroActsFirst = hero.speed >= monster.speed;
  const firstActor = heroActsFirst ? hero : monster;
  const secondActor = heroActsFirst ? monster : hero;
  const turnMessages = [
    `<span class="battle-message-line">🏁 Speed: ${hero.name} ${hero.speed} vs ${monster.name} ${monster.speed}. ${firstActor.name} acts first${hero.speed === monster.speed ? " (tie)" : ""}.</span>`,
  ];

  const executeAction = (actor) => {
    const isHeroAction = actor === hero;
    const action = isHeroAction ? playerAction : "attack";
    const target = isHeroAction ? monster : hero;
    const calculatedDamage = calculateActionDamage(actor, action, isHeroAction);
    const isCounteringEnemyAttack =
      !isHeroAction && playerAction === "counterAttack";
    const damage = isCounteringEnemyAttack
      ? Math.ceil(calculatedDamage / 2)
      : calculatedDamage;

    if (isCounteringEnemyAttack) {
      turnMessages.push(
        `<span class="battle-message-line">🛡️ ${hero.name} reduces incoming damage by half.</span>`,
      );
    }

    if (isHeroAction && action === "ability") {
      hero.abilityUsed = true;
      document.getElementById("hability-button").disabled = true;
    }

    target.takeDamage(damage);
    turnMessages.push(getActionMessage(actor, target, action, damage));
  };

  executeAction(firstActor);
  if (!hero.dead && !monster.dead) {
    executeAction(secondActor);
  }

  render();
  finishTurn(turnMessages);
}

function finishTurn(turnMessages) {
  if (hero.dead) {
    turnMessages.push(
      `<strong class="battle-message-title">💀 ${hero.name.toUpperCase()} DEFEATED!</strong>`,
    );
    showBattleMessage(turnMessages.join(""));
    endGame();
  } else if (monster.dead) {
    const previousHealth = hero.health;
    hero.heal(10);
    const healedHealth = hero.health - previousHealth;
    render();
    isWaiting = true;
    showBattleMessage(turnMessages.join(""));
    setTimeout(() => {
      const defeatedMessage = `
        <strong class="battle-message-title">💀 ${monster.name.toUpperCase()} DEFEATED!</strong>
        <span class="battle-message-line">💚 ${hero.name} recovers ${healedHealth} HP.</span>
      `;

      if (monstersArray.length > 0) {
        turnMessages.push(defeatedMessage);
        showBattleMessage(turnMessages.join(""));
        hero.clearDiceHtml();
        hero.abilityUsed = false;
        document.getElementById("hability-button").disabled = false;
        monster = getNewMonster();
        render();
        showBattleMessage(defeatedMessage);
        isWaiting = false;
      } else {
        turnMessages.push(defeatedMessage);
        showBattleMessage(turnMessages.join(""));
        endGame();
      }
    }, 2000);
  } else {
    showBattleMessage(turnMessages.join(""));
  }
}

function endGame() {
  isWaiting = true;
  const endTitle = hero.health > 0 ? "Congratulations" : "Game Over";
  let endMessage = "";
  if (hero.health === 0 && monster.health === 0 && monstersArray.length === 0) {
    endMessage = "No victors - all creatures are dead ";
  } else if (hero.health > 0 && monster.health === 0) {
    endMessage = `The ${hero.name} Wins`;
  } else {
    endMessage = `The ${monster.name} is Victorious`;
  }

  const endEmoji = hero.health > 0 ? `${hero.emoji}` : `${monster.emoji}`;
  setTimeout(() => {
    document.body.innerHTML = `
                <div class="end-game">
                    <h2>${endTitle}</h2> 
                    <h3>${endMessage}</h3>
                    <p class="end-emoji">${endEmoji}</p>
                    <button id="new-game-button" type="button">New Game</button>
                </div>
                `;
    document
      .getElementById("new-game-button")
      .addEventListener("click", () => window.location.reload());
  }, 3000);
}

document
  .getElementById("attack-button")
  .addEventListener("click", () => resolveTurn("attack"));
document
  .getElementById("counter-button")
  .addEventListener("click", () => resolveTurn("counterAttack"));
document
  .getElementById("hability-button")
  .addEventListener("click", () => resolveTurn("ability"));

function renderHeroOptions() {
  const optionsHtml = heroesArray
    .map((heroId) => {
      const {
        name,
        avatar,
        health,
        attack,
        speed,
        diceCount,
        specialAttack,
        specialAttackDescription,
      } = characterData[heroId];
      return `
            <button class="hero-choice" type="button" data-hero="${heroId}">
                <img class="hero-choice-avatar" src="${avatar}" alt="${name}" />
                <span class="hero-choice-name">${name}</span>
                <span class="hero-choice-stat">Health <b>${health}</b></span>
                <span class="hero-choice-stat">Attack <b>+${attack}</b></span>
                <span class="hero-choice-stat">Speed <b>${speed}</b></span>
                <span class="hero-choice-stat">Attack dice <b>${diceCount}</b></span>
                <span class="hero-choice-ability"><b>${specialAttack}</b>: ${specialAttackDescription} <small>Once per enemy</small></span>
            </button>`;
    })
    .join("");

  document.getElementById("hero-options").innerHTML = optionsHtml;
  document.querySelectorAll(".hero-choice").forEach((choice) => {
    choice.addEventListener("click", () => startGame(choice.dataset.hero));
  });
}

function startGame(heroId) {
  hero = new Character(characterData[heroId]);
  monstersArray = getShuffledMonsters();
  monster = getNewMonster();
  const abilityButton = document.getElementById("hability-button");
  abilityButton.textContent = hero.specialAttack;
  abilityButton.hidden = !hero.specialAttack;
  abilityButton.disabled = false;
  hero.abilityUsed = false;
  document.getElementById("hero-selection").hidden = true;
  document.getElementById("battle").hidden = false;
  document.getElementById("actions").hidden = false;
  render();
}

function render() {
  document.getElementById("hero").innerHTML = hero.getCharacterHtml();
  document.getElementById("monster").innerHTML = monster.getCharacterHtml();
}

renderHeroOptions();
