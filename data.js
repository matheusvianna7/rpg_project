const characterData = {
  wizard: {
    name: "Wizard",
    avatar: "wizard.png",
    health: 70,
    attack: 1,
    speed: 2,
    diceCount: 3,
    emoji: "🧙🏽‍♂️",
    specialAttack: "Fireball",
    specialAttackDescription:
      "Each dice deals 1 damage (1-3), 8 damage (4-5), or 10 damage (6).",
  },
  knight: {
    name: "Knight",
    avatar: "knight.png",
    health: 80,
    attack: 2,
    speed: 1,
    diceCount: 2,
    emoji: "🛡",
    specialAttack: "Shield Bash",
    specialAttackDescription:
      "Each dice deals 1 damage (1-3) or 10 damage (4-5). A 6 deals 22 total; two 6s deal 25.",
  },
  elf: {
    name: "Elf",
    avatar: "elf.png",
    health: 75,
    attack: 3,
    speed: 3,
    diceCount: 2,
    emoji: "🧝🏼‍♂️",
    specialAttack: "Arrow Shot",
    specialAttackDescription:
      "The highest dice deals 4 damage (1-2), 8 (3-4), 10 (5), or 15 (6).",
  },
  orc: {
    name: "Orc",
    avatar: "orc.png",
    health: 50,
    attack: 2,
    speed: 1,
    diceCount: 2,
    emoji: "💀",
  },
  demon: {
    name: "Demon",
    avatar: "demon.png",
    health: 40,
    attack: 3,
    speed: 3,
    diceCount: 1,
    emoji: "💀",
  },
  goblin: {
    name: "Goblin",
    avatar: "goblin.png",
    health: 30,
    attack: 1,
    speed: 2,
    diceCount: 3,
    emoji: "💀",
  },
};

export default characterData;
