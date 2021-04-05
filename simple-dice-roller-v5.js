class SimpleDiceRollerV5 {

    static async Init(controls, html) {

        const diceRollbtn = $(
            `
            <li class="scene-control sdrv5-scene-control" data-control="simple-dice-roller-v5" title="Simple Dice Roller v5">
                <i class="fas df-d10-0"></i>
            
                <ol class="control-tools">
                    <div id="SDRpopupV5" class="simple-dice-roller-v5-popup" style="display: none;">
                    </div>
                </ol>
            </li>
            `
        );

        html.append(diceRollbtn);

        diceRollbtn[0].addEventListener('click', ev => this.PopupSheet(ev, html));

        this._createDiceTable(html);
    }

    static _createDiceTableHtmlOneCell(diceType, diceRoll, isLast) {
        
        let s = [];
        s.push('<li data-dice-type="', diceType, '" data-dice-roll="', diceRoll, '"');
        
        if (diceRoll == 1) {
            
            s.push(' class="sdr-col1">');
            
            if(diceType == 100) {
                s.push('<i class="df-d10-10" data-dice-type="', diceType, '" data-dice-roll="1"></i>');
                s.push('<i class="df-d10-10" data-dice-type="', diceType, '" data-dice-roll="1"></i>');
            } else {
                s.push('<i class="df-d', diceType, '-', diceType, '" data-dice-type="', diceType, '" data-dice-roll="1"></i>');
            }
        
            s.push(' d' + diceType);
            
        } else if (isLast) {
            s.push(' class="sdr-lastcol">' + diceRoll);
        } else {
            s.push('>' + diceRoll);
        }
        s.push('</li>');
        
        return s.join('');
    }
    
    static _createDiceTableHtmlOneLine(diceType, maxDiceCount) {
        
        let s = [];
        
        s.push('<ul>');
        
        for(let i = 1; i <= maxDiceCount; ++i) {
            let isLast = (i == maxDiceCount);
            s.push(this._createDiceTableHtmlOneCell(diceType, i, isLast));
        }
        
        s.push('</ul>');
        
        return s.join('');
    }

    static _createDiceTableHtmlOneCellForVtmv5(totalDice, hungerDice, isLast) {
        
        let cleanDice = Math.max((totalDice - hungerDice), 0);
        hungerDice = Math.min(totalDice, hungerDice);
        let formula = '' + cleanDice + 'dvcs>5 + ' + hungerDice + 'dhcs>5';
        
        let styleValue = (cleanDice > 0) ? ('') : ('background : rgba(255, 0, 0, 0.25);');
        
        let s = [];
        s.push('<li data-dice-type="VtmV5" data-dice-formula="', formula, '"');
        s.push(' data-dice-clean="', cleanDice, '"');
        s.push(' data-dice-hunger="', hungerDice, '"');
        s.push(' style="', styleValue, '"');
        
        if (totalDice == 1) {
            
            s.push(' class="sdr-col1">');
            s.push('<i class="df-d10-0" data-dice-type="10" data-dice-roll="1"></i> V:tM5');
            
        } else if (isLast) {
            s.push(' class="sdr-lastcol">' + totalDice);
        } else {
            s.push('>' + totalDice);
        }
        s.push('</li>');
        
        return s.join('');
    }
    
    static _createDiceTableHtmlOneLineForVtmv5(hungerDice, maxDiceCount) {
        
        let s = [];
        
        s.push('<ul>');
        
        for(let i = 1; i <= maxDiceCount; ++i) {
            let isLast = (i == maxDiceCount);
            s.push(this._createDiceTableHtmlOneCellForVtmv5(i, hungerDice, isLast));
        }
        
        s.push('</ul>');
        
        return s.join('');
    }

    static _createVtmV5Flavor(rollResult, label = '', difficulty = 0)
    {
        let difficultyResult = '<span></span>';
        let success = 0;
        let hungerSuccess = 0;
        let critSuccess = 0;
        let hungerCritSuccess = 0;
        let fail = 0;
        let hungerFail = 0;
        let hungerCritFail = 0;

        rollResult.terms[0].results.forEach((dice) => {
            if (dice.success) {
                if (dice.result === 10) {
                    critSuccess++
                } else {
                    success++
                }
            } else {
                fail++
            }
        });

        rollResult.terms[2].results.forEach((dice) => {
            if (dice.success) {
                if (dice.result === 10) {
                    hungerCritSuccess++
                } else {
                    hungerSuccess++
                }
            } else {
                if (dice.result === 1) {
                    hungerCritFail++
                } else {
                    hungerFail++
                }
            }
        });

        let totalCritSuccess = 0;
        totalCritSuccess = Math.floor((critSuccess + hungerCritSuccess) / 2);
        const totalSuccess = (totalCritSuccess * 2) + success + hungerSuccess + critSuccess + hungerCritSuccess;
        let successRoll = false;
        if (difficulty !== 0) {
            successRoll = totalSuccess >= difficulty;
            difficultyResult = `( <span class="danger">${game.i18n.localize('VTM5E.Fail')}</span> )`;
            if (successRoll) {
                difficultyResult = `( <span class="success">${game.i18n.localize('VTM5E.Success')}</span> )`;
            }
        }

        label = `<p class="roll-label uppercase">${label}</p>`;

        if (hungerCritSuccess && totalCritSuccess) {
            label = label + `<p class="roll-content">${game.i18n.localize('VTM5E.MessyCritical')}</p>`;
        } else if (totalCritSuccess) {
            label = label + `<p class="roll-content">${game.i18n.localize('VTM5E.CriticalSuccess')}</p>`;
        }
        if (hungerCritFail && !successRoll && difficulty > 0) {
            label = label + `<p class="roll-content">${game.i18n.localize('VTM5E.BestialFailure')}</p>`;
        }
        if (hungerCritFail && !successRoll && difficulty === 0) {
            label = label + `<p class="roll-content">${game.i18n.localize('VTM5E.PossibleBestialFailure')}</p>`;
        }

        label = label + `<p class="roll-label">${game.i18n.localize('VTM5E.Successes')}: ${totalSuccess} ${difficultyResult}</p>`;
        let firstLine = !!critSuccess || !!success || !!fail;

        for (let i = 0, j = critSuccess; i < j; i++) {
            label = label + '<img src="systems/vtm5e/assets/images/normal-crit.png" alt="Normal Crit" class="roll-img">';
        }
        for (let i = 0, j = success; i < j; i++) {
            label = label + '<img src="systems/vtm5e/assets/images/normal-success.png" alt="Normal Success" class="roll-img">';
        }
        for (let i = 0, j = fail; i < j; i++) {
            label = label + '<img src="systems/vtm5e/assets/images/normal-fail.png" alt="Normal Fail" class="roll-img">';
        }

        if(firstLine) {
            label = label + '<br>';
        }

        for (let i = 0, j = hungerCritSuccess; i < j; i++) {
            label = label + '<img src="systems/vtm5e/assets/images/red-crit.png" alt="Hunger Crit" class="roll-img">';
        }
        for (let i = 0, j = hungerSuccess; i < j; i++) {
            label = label + '<img src="systems/vtm5e/assets/images/red-success.png" alt="Hunger Success" class="roll-img">';
        }
        for (let i = 0, j = hungerCritFail; i < j; i++) {
            label = label + '<img src="systems/vtm5e/assets/images/bestial-fail.png" alt="Bestial Fail" class="roll-img">';
        }
        for (let i = 0, j = hungerFail; i < j; i++) {
            label = label + '<img src="systems/vtm5e/assets/images/red-fail.png" alt="Hunger Fail" class="roll-img">';
        }

        return label;
    }

    static _createDiceTableHtml(maxDiceCount) {
        
        let s = [];
        
        s.push(this._createDiceTableHtmlOneLine(2, maxDiceCount));
        s.push(this._createDiceTableHtmlOneLine('c', maxDiceCount));
        // s.push(this._createDiceTableHtmlOneLine(4, maxDiceCount));
        // s.push(this._createDiceTableHtmlOneLine(6, maxDiceCount));
        // s.push(this._createDiceTableHtmlOneLine(8, maxDiceCount));
        // s.push(this._createDiceTableHtmlOneLine(10, maxDiceCount));
        // s.push(this._createDiceTableHtmlOneLine(12, maxDiceCount));
        // s.push(this._createDiceTableHtmlOneLine(20, maxDiceCount));
        // s.push(this._createDiceTableHtmlOneLine(100, maxDiceCount));
        
        if(game.vtm5e)
        {
            for(let i = 0, iMax = 6; i < iMax; ++i)
            {
                s.push(this._createDiceTableHtmlOneLineForVtmv5(i, maxDiceCount));
            }
        }
        
        return s.join('');
    }
    
    static _cachedMaxDiceCount = NaN;
    
    static async _createDiceTable(html) {
        
        let maxDiceCount = parseInt(game.settings.get("simple-dice-roller-v5", "maxDiceCount"), 10);
        
        if(isNaN(maxDiceCount) || (maxDiceCount < 1) || (maxDiceCount > 30)) {
            maxDiceCount = 5;
        }
        
        this._cachedMaxDiceCount = maxDiceCount;

        const tableContentsHtml = this._createDiceTableHtml(maxDiceCount);
        
        const tableContents = $(tableContentsHtml);

        html.find('.simple-dice-roller-v5-popup ul').remove();

        html.find('.simple-dice-roller-v5-popup').append(tableContents);

        html.find('.simple-dice-roller-v5-popup li').click(ev => this._rollDice(ev, html));
    }

    static async _rollDice(event, html) {

        let diceType = event.target.dataset.diceType;
        
        if(diceType == "VtmV5")
        {
            let diceFormula = event.target.dataset.diceFormula;
            let diceClean = event.target.dataset.diceClean;
            let diceHunger = event.target.dataset.diceHunger;

            let r = new Roll(diceFormula);
            const rollResult = r.evaluate();
            let label = this._createVtmV5Flavor(rollResult);

            r.toMessage({
                user: game.user._id,
                flavor: label
            });

            this._close(event, html);
        }
        else
        {
            let diceRoll = event.target.dataset.diceRoll;

            let formula = diceRoll + "d" + diceType;

            let r = new Roll(formula);

            r.toMessage({
                user: game.user._id,
            });

            this._close(event, html);
        }
    }
    
    static async PopupSheet(event, html) {
        //console.log("SDR | clicked");
        //canvas.stage.children.filter(layer => layer._active).forEach(layer => layer.deactivate());
        if (html.find('.sdrv5-scene-control').hasClass('active')) {
            this._close(event, html);
        } else {
            this._open(event, html);
        }
    }

    static async _close(event, html) {
        //console.log("SDR | closed");
        html.find('#SDRpopupV5').hide();
        html.find('.sdrv5-scene-control').removeClass('active');
        html.find('.scene-control').first().addClass('active');
        
        event.stopPropagation();
    }

    static async _open(event, html) {
        //console.log("SDR | opened");
        this._createDiceTable(html);
        html.find('.scene-control').removeClass('active');
        html.find('#SDRpopupV5').show();
        html.find('.sdrv5-scene-control').addClass('active');
        event.stopPropagation();
    }


}

Hooks.on('renderSceneControls', (controls, html) => { SimpleDiceRollerV5.Init(controls, html); });

Hooks.once("init", () => {
	game.settings.register("simple-dice-roller-v5", "maxDiceCount", {
		name: game.i18n.localize("simpleDiceRollerV5.maxDiceCount.name"),
		hint: game.i18n.localize("simpleDiceRollerV5.maxDiceCount.hint"),
		scope: "world",
		config: true,
		default: 15,
		type: Number
	});
});



console.log("SDR | Simple Dice Roller V5 loaded");