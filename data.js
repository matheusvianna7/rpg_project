const characterData = {
  wizard: {
    name: "Wizard",
    avatar: "wizard.png",
    health: 70,
    attack: 1,
    diceCount: 3,
    currentDiceScore: [],
    emoji: "🧙🏽‍♂️",
    specialAttack: "Fireball",
    specialAttackDescription:
      "Cada dado causa 1 de dano (1-3), 8 (4-5) ou 10 (6).",
  },
  knight: {
    name: "Knight",
    avatar: "knight.png",
    health: 80,
    attack: 2,
    diceCount: 2,
    currentDiceScore: [],
    emoji: "🛡",
    specialAttack: "Shield Bash",
    specialAttackDescription:
      "Cada dado causa 1 (1-3) ou 10 (4-5). Um 6 causa 22 no total; dois 6 causam 25.",
  },
  elf: {
    name: "Elf",
    avatar: "elf.png",
    health: 75,
    attack: 3,
    diceCount: 2,
    currentDiceScore: [],
    emoji: "🧝🏼‍♂️",
    specialAttack: "Arrow Shot",
    specialAttackDescription:
      "O maior dado causa 4 (1-2), 8 (3-4), 10 (5) ou 15 (6) de dano.",
  },
  orc: {
    name: "Orc",
    avatar: "orc.png",
    health: 50,
    attack: 2,
    diceCount: 2,
    currentDiceScore: [],
    emoji: "💀",
  },
  demon: {
    name: "Demon",
    avatar: "demon.png",
    health: 40,
    attack: 3,
    diceCount: 1,
    currentDiceScore: [],
    emoji: "💀",
  },
  goblin: {
    name: "Goblin",
    avatar: "goblin.png",
    health: 30,
    attack: 1,
    diceCount: 3,
    currentDiceScore: [],
    emoji: "💀",
  },
};

export default characterData;
