function createHUD() {
    let posY = screenWidth / 23;

    this.scoreText = this.add.text(screenWidth / 40, posY, '', { fontFamily: 'pixel_nums', fontSize: (screenWidth / 65), align: 'left'});
    this.scoreText.setScrollFactor(0).depth = 5;

    this.highScoreText = this.add.text(screenWidth / 2, posY, 'HIGH SCORE\n 000000', { fontFamily: 'pixel_nums', fontSize: (screenWidth / 65), align: 'center'}).setOrigin(0.5, 0);
    this.highScoreText.setScrollFactor(0).depth = 5;

    this.timeLeftText = this.add.text(screenWidth * 0.925, posY, 'TIME\n' + timeLeft.toString().padStart(3, '0'), { fontFamily: 'pixel_nums', fontSize: (screenWidth / 65), align: 'right'});
    this.timeLeftText.setScrollFactor(0).depth = 5;

    let localHighScore = localStorage.getItem('high-score');
    if (localHighScore !== null) {
        this.highScoreText.setText('HIGH SCORE\n' + localHighScore.toString().padStart(6, '0'))
    }
    
    updateScore.call(this);
}

function updateScore() {
    if (!this.scoreText) return;

    this.scoreText.setText('SIMON\n' + score.toString().padStart(6, '0'));
}

function updateTimer() {
    if (!this.timeLeftText || timeLeft <= 0 || this.timeLeftText.stopped || playerBlocked) return;

    if (timeLeft == 100) {
        this.musicTheme.stop();
        this.undergroundMusicTheme.stop()
        this.timeWarningSound.play();
        setTimeout(() => {
            this.hurryMusicTheme.play();
            //this.musicTheme.rate = 1.2;
            //this.musicTheme.resume();
        }, 2400);
    }

    if (!this.timeLeftText.stopped) {
        timeLeft--;
        this.timeLeftText.setText('TIME\n' + timeLeft.toString().padStart(3, '0'));
    }

    setTimeout(() => {
        updateTimer.call(this);
    }, 500);
}

function addToScore(num, originObject) {
    
    for (i = 1; i <= num; i++) {
        setTimeout(() => {
            score++;
            updateScore.call(this);
        }, i);
    }
    
    if (!originObject) return;
    
    const textEffect = this.add.text(originObject.getBounds().x, originObject.getBounds().y, num, {
      fontFamily: 'pixel_nums',
      fontSize: (screenWidth / 150),
      align: 'center'
    });
    
    textEffect.setOrigin(0).smoothed = true;
    textEffect.depth = 5;
    
    this.tweens.add({
      targets: textEffect,
      duration: 600,
      y: textEffect.y - screenHeight / 6.5,
      onComplete: () => {
        this.tweens.add({
          targets: textEffect,
          duration: 100,
          alpha: 0,
          onComplete: () => {
            textEffect.destroy();
          }
        });
      }
    });
  }


// Game over functions

function gameOverScreen(outOfTime=false) {
    if (localStorage.getItem('high-score') !== null) {
        if (localStorage.getItem('high-score') < score) {
            localStorage.setItem('high-score', score);
            this.highScoreText.setText('NEW HIGH SCORE!\n' + score.toString().padStart(6, '0'))
        }
    } else {
        localStorage.setItem('high-score', score);
    }

    const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
    let gameOverScreen = this.add.rectangle(0, screenHeight / 2, worldWidth, screenHeight, 0x000000).setScrollFactor(0);
    gameOverScreen.alpha = 0;
    gameOverScreen.depth = 4;
    this.tweens.add({
        targets: gameOverScreen,
        duration: 200,
        alpha: 1
    });
    this.add.bitmapText(screenCenterX, screenHeight / 3, 'carrier_command', outOfTime ? 'TIME UP' : 'GAME OVER', screenWidth / 30).setOrigin(0.5).depth = 5;
    this.add.bitmapText(screenCenterX, screenHeight / 2, 'carrier_command', '> PLAY AGAIN', screenWidth / 50).setOrigin(0.5).setInteractive().on('pointerdown', () => location.reload()).depth = 5;
    this.add.bitmapText(screenCenterX, screenHeight / 1.7, 'carrier_command', '> SCREENSHOT', screenWidth / 50).setOrigin(0.5).setInteractive().on('pointerdown', () => getScreenshot()).depth = 5;
}

function gameOverFunc() {
    this.timeLeftText.stopped = true;
    player.anims.play('hurt', true);
    player.body.enable = false;
    
    // NON distruggere subito la faccia - lasciala seguire Mario durante l'animazione di morte
    // La faccia verrà distrutta solo dopo 3 secondi alla fine dell'animazione
    
    this.finalFlagMast.body.enable = false;
    let goombas = this.goombasGroup.getChildren();
    for (let i = 0; i < goombas.length; i++) {
        goombas[i].anims.stop();
        goombas[i].body.enable = false;
    }
    let platformPieces = this.platformGroup.getChildren();
    for (let i = 0; i < platformPieces.length; i++) {
        platformPieces[i].body.enable = false;
    }
    let blocks = this.blocksGroup.getChildren();
    for (let i = 0; i < blocks.length; i++) {
        blocks[i].body.enable = false;
    }
    let misteryBlocks = this.misteryBlocksGroup.getChildren();
    for (let i = 0; i < misteryBlocks.length; i++) {
        misteryBlocks[i].body.enable = false;
    }
    player.body.setSize(16, 16).setOffset(0);
    player.setVelocityX(0);
    setTimeout(() => {
    player.body.enable = true;
    player.setVelocityY(-velocityY * 1.1);
    
    // Crea un aggiornamento continuo della faccia durante la morte
    if (this.face) {
        this.deathFaceUpdate = setInterval(() => {
            if (this.face && player) {
                let headX = player.x - 25;
                let headY;
                let faceScale;
                
                if (playerState === 0) {
                    headY = player.y - 50;
                    faceScale = 0.10;
                } else if (playerState === 1) {
                    headY = player.y - 70;
                    faceScale = 0.12;
                } else {
                    headY = player.y - 70;
                    faceScale = 0.12;
                }
                
                this.face.x = headX;
                this.face.y = headY;
                this.face.setScale(faceScale);
                this.face.setFlipX(player.flipX);
            }
        }, 16); // Aggiorna ogni frame (60fps)
    }
}, 500);
    this.musicTheme.stop();
    this.undergroundMusicTheme.stop();
    this.hurryMusicTheme.stop();
    this.gameOverSong.play();
    setTimeout(() => {
        player.depth = 0;
        gameOverScreen.call(this, timeLeft <= 0);
        this.physics.pause();
        
        // Ferma l'aggiornamento della faccia e distruggila
        if (this.deathFaceUpdate) {
            clearInterval(this.deathFaceUpdate);
            this.deathFaceUpdate = null;
        }
        
        if (this.face) {
            this.face.destroy();
            this.face = null;
        }
    }, 3000);
    return;
}

function winScreen() {
    if (localStorage.getItem('high-score') !== null) {
        if (localStorage.getItem('high-score') < score) {
            localStorage.setItem('high-score', score);
            this.highScoreText.setText('NEW HIGH SCORE!\n' + score.toString().padStart(6, '0'))
        }
    } else {
        localStorage.setItem('high-score', score);
        this.highScoreText.setText('NEW HIGH SCORE!\n' + score.toString().padStart(6, '0'))
    }

    const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
    let winScreen = this.add.rectangle(0, screenHeight / 2, worldWidth, screenHeight, 0x000000).setScrollFactor(0);
    winScreen.alpha = 0;
    winScreen.depth = 4;
    this.tweens.add({
        targets: winScreen,
        duration: 300,
        alpha: 1
    });
    this.add.bitmapText(screenCenterX, screenHeight / 3, 'carrier_command', 'YOU WON!', screenWidth / 30).setOrigin(0.5).depth = 5;
    this.add.bitmapText(screenCenterX, screenHeight / 2, 'carrier_command', '> PLAY AGAIN', screenWidth / 50).setOrigin(0.5).setInteractive().on('pointerdown', () => location.reload()).depth = 5;
    this.add.bitmapText(screenCenterX, screenHeight / 1.7, 'carrier_command', '> SCREENSHOT', screenWidth / 50).setOrigin(0.5).setInteractive().on('pointerdown', () => getScreenshot()).depth = 5;
}
