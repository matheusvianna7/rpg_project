import characterData from "./data.js";
import Character from "./Character.js";

let monstersArray = ["orc", "demon", "goblin"];
let heroesArray = ["wizard", "knight", "elf"];
let isWaiting = false;
let hero;
let monster;

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

const abilityDamageCalculators = {
  Fireball: calculateFireballDamage,
  "Shield Bash": calculateShieldBashDamage,
  "Arrow Shot": calculateArrowShotDamage,
};

function attack() {
  if (!isWaiting) {
    hero.setDiceHtml();
    monster.setDiceHtml();
    const heroDamage = calculateAttackDamage(hero);
    const monsterDamage = calculateAttackDamage(monster);
    hero.takeDamage(monsterDamage);
    monster.takeDamage(heroDamage);
    render();
    finishTurn();
  }
}

function counterAttack() {
  if (!isWaiting) {
    hero.setDiceHtml();
    monster.setDiceHtml();

    const heroDamage = calculateCounterAttackDamage(hero, true);
    const monsterDamage = calculateCounterAttackDamage(monster);

    monster.takeDamage(heroDamage);
    hero.takeDamage(monsterDamage);
    render();
    finishTurn();
  }
}

function useAbility() {
  if (!isWaiting && hero.specialAttack && !hero.abilityUsed) {
    const calculateDamage = abilityDamageCalculators[hero.specialAttack];
    if (!calculateDamage) return;

    hero.setDiceHtml();
    monster.setDiceHtml();

    const abilityDamage = calculateDamage(hero);

    hero.abilityUsed = true;
    document.getElementById("hability-button").disabled = true;
    monster.takeDamage(abilityDamage);
    const monsterDamage = calculateAttackDamage(monster);
    hero.takeDamage(monsterDamage);
    render();
    finishTurn();
  }
}

function finishTurn() {
  if (hero.dead) {
    endGame();
  } else if (monster.dead) {
    hero.heal(10);
    render();
    isWaiting = true;
    if (monstersArray.length > 0) {
      setTimeout(() => {
        hero.clearDiceHtml();
        hero.abilityUsed = false;
        document.getElementById("hability-button").disabled = false;
        monster = getNewMonster();
        render();
        isWaiting = false;
      }, 1500);
    } else {
      endGame();
    }
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
  }, 1500);
}

document.getElementById("attack-button").addEventListener("click", attack);
document
  .getElementById("counter-button")
  .addEventListener("click", counterAttack);
document
  .getElementById("hability-button")
  .addEventListener("click", useAbility);

function renderHeroOptions() {
  const optionsHtml = heroesArray
    .map((heroId) => {
      const {
        name,
        avatar,
        health,
        attack,
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
