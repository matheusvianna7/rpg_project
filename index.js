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

function attack() {
  if (!isWaiting) {
    hero.setDiceHtml();
    monster.setDiceHtml();
    hero.currentDiceScore.push(hero.attack);
    monster.currentDiceScore.push(monster.attack);
    hero.takeDamage(monster.currentDiceScore);
    monster.takeDamage(hero.currentDiceScore);
    render();

    if (hero.dead) {
      endGame();
    } else if (monster.dead) {
      isWaiting = true;
      if (monstersArray.length > 0) {
        setTimeout(() => {
          hero.clearDiceHtml();
          monster = getNewMonster();
          render();
          isWaiting = false;
        }, 1500);
      } else {
        endGame();
      }
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
                </div>
                `;
  }, 1500);
}

document.getElementById("attack-button").addEventListener("click", attack);

function renderHeroOptions() {
  const optionsHtml = heroesArray
    .map((heroId) => {
      const { name, avatar, health, attack, diceCount } = characterData[heroId];
      return `
            <button class="hero-choice" type="button" data-hero="${heroId}">
                <img class="hero-choice-avatar" src="${avatar}" alt="${name}" />
                <span class="hero-choice-name">${name}</span>
                <span class="hero-choice-stat">Health <b>${health}</b></span>
                <span class="hero-choice-stat">Attack <b>+${attack}</b></span>
                <span class="hero-choice-stat">Attack dice <b>${diceCount}</b></span>
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
