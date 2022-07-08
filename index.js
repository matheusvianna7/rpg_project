import characterData from './data.js'
import Character from './Character.js'

let monstersArray = ["orc", "demon", "goblin"]
let heroesArray = ["wizard", "knight", "elf"]
let isWaiting = false
let indexHero = Number(prompt(`Choose your hero and answer with a number: \ 
1 - Wizard \ 2 - Knight \ 3 - Elf`))

function getNewHero() {
    return new Character(characterData[heroesArray[indexHero - 1]])
}

function getNewMonster() {
    const nextMonsterData = characterData[monstersArray.shift()]
    return nextMonsterData ? new Character(nextMonsterData) : {}
}

function attack() {
    if(!isWaiting){
        hero.setDiceHtml()
        monster.setDiceHtml()
        hero.currentDiceScore.push(hero.attack)
        monster.currentDiceScore.push(monster.attack)
        hero.takeDamage(monster.currentDiceScore)
        monster.takeDamage(hero.currentDiceScore)
        render()
        
        if(hero.dead){
            endGame()
        }
        else if(monster.dead){
            isWaiting = true
            if(monstersArray.length > 0){
                setTimeout(()=>{
                    monster = getNewMonster()
                    render()
                    isWaiting = false
                },1500)
            }
            else{
                endGame()
            }
        }    
    }
}

function endGame() {
    isWaiting = true
    const endTitle = hero.health > 0 ? "Congratulations" : "Game Over"
    let endMessage = ''
    if(hero.health === 0 && monster.health === 0 && monstersArray.length === 0){
        endMessage = "No victors - all creatures are dead "
    } else if(hero.health > 0 && monster.health === 0){
        endMessage = `The ${hero.name} Wins`
    } else {
        endMessage = `The ${monster.name} is Victorious`
    }

    const endEmoji = hero.health > 0 ? `${hero.emoji}` : `${monster.emoji}`
        setTimeout(()=>{
            document.body.innerHTML = `
                <div class="end-game">
                    <h2>${endTitle}</h2> 
                    <h3>${endMessage}</h3>
                    <p class="end-emoji">${endEmoji}</p>
                </div>
                `
        }, 1500)
}

document.getElementById("attack-button").addEventListener('click', attack)

function render() {
    document.getElementById('hero').innerHTML = hero.getCharacterHtml()
    document.getElementById('monster').innerHTML = monster.getCharacterHtml()
}

let hero = getNewHero()
let monster = getNewMonster()
render()