export function handleArchCheck(pdfDoc, page, chekcs, _detail, p1, p2) {
    page = pdfDoc.getPage(p1);

    let yesAxis = 482;
    let noAxis = 517;
    let naAxis = 549;
    let fontSize = 11

    // -------------------- 1. ------------------ //

    let checkY = 682;
    let _check = chekcs[27];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    // -------------------- Rótulo ------------------ //
    checkY = 624;
    _check = chekcs[0];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 607;
    _check = chekcs[1];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 590;
    _check = chekcs[2];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 573;
    _check = chekcs[3];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    // -------------------- Características del predio ------------------ //

    checkY = 545;
    _check = chekcs[4];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 528;
    _check = chekcs[5];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 511;
    _check = chekcs[6];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 494;
    _check = chekcs[7];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 477;
    _check = chekcs[8];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }


    // -------------------- Cuadro de áreas ------------------ //

    checkY = 449;
    _check = chekcs[9];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    // -------------------- Plantas arquitectónicas por piso, sótano o semisótano cubiertas ------------------ //
    checkY = 421;
    _check = chekcs[10];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 404;
    _check = chekcs[11];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 387;
    _check = chekcs[12];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 370;
    _check = chekcs[13];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 353;
    _check = chekcs[14];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 336;
    _check = chekcs[15];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 298;
    _check = chekcs[26];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    // -------------------- Cortes ------------------ //

    checkY = 276;
    _check = chekcs[16];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 259;
    _check = chekcs[17];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 242;
    _check = chekcs[18];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 225;
    _check = chekcs[19];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 208;
    _check = chekcs[20];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    // -------------------- Fachadas ------------------ //
    checkY = 179;
    _check = chekcs[21];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 162;
    _check = chekcs[22];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 145;
    _check = chekcs[23];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    // -------------------- 3. & 4. ------------------ //
    checkY = 120;
    _check = chekcs[24];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 90;
    _check = chekcs[25];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    page = pdfDoc.getPage(p2);

    let detail = _detail || 'NO HAY OBSERVACIONES';

    let formatString = detail.split('\n');
    for (let i = 0; i < formatString.length; i++) {
        formatString[i] = formatString[i].replace(/^/, ``);
    }
    formatString = formatString.join('\n');
    const _detailsWrapped = (s) => s.replace(
        /(?![^\n]{1,170}$)([^\n]{1,170})\s/g, '$1\n'
    );
    if (_detailsWrapped(formatString)) {
        let _detailsArray = _detailsWrapped(formatString).split("\n");
        _detailsArray.map((value, i) => { page.moveTo(45, 666 - (i * 13.00)); page.drawText(`${value}`, { size: 7 }); })
    }
}

export function handleLAWhCheck(pdfDoc, page, chekcs, _detail, p1, p2) {
    page = pdfDoc.getPage(p1);
    function printValue(index, Y, offset = [0, 0, 0]) {
        const si_x = 480 + offset[0];
        const no_x = 515 + offset[1];
        const na_x = 549 + offset[2];
        const fontSize = 12;
        if (index > -1) {

            if (index == 0) { { page.moveTo(no_x, Y); page.drawText('X', { size: fontSize }) } }
            if (index == 1) { { page.moveTo(si_x, Y); page.drawText('X', { size: fontSize }) } }
            if (index == 2 ) { { page.moveTo(na_x, Y); page.drawText('X', { size: fontSize }) } }
        } else page.moveTo(na_x, Y); page.drawText('X', { size: fontSize })
    }

    chekcs.map(item => printValue(item.index, item.Y, item.offset))

    page = pdfDoc.getPage(p2);

    let detail = _detail || 'NO HAY OBSERVACIONES';

    let formatString = detail.split('\n');
    for (let i = 0; i < formatString.length; i++) {
        formatString[i] = formatString[i].replace(/^/, ``);
    }
    formatString = formatString.join('\n');
    const _detailsWrapped = (s) => s.replace(
        /(?![^\n]{1,170}$)([^\n]{1,170})\s/g, '$1\n'
    );
    if (_detailsWrapped(formatString)) {
        let _detailsArray = _detailsWrapped(formatString).split("\n");
        _detailsArray.map((value, i) => { page.moveTo(45, 660 - (i * 15.2)); page.drawText(`${value}`, { size: 7 }); })
    }

}

export function handleEnghCheck(pdfDoc, page, chekcs, _detail, p1, p2) {
    page = pdfDoc.getPage(p1);

    let yesAxis = 482;
    let noAxis = 516;
    let naAxis = 549;
    let fontSize = 11

    // -------------------- 1. ------------------ //

    let checkY = 659;
    let _check = chekcs[0];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 648;
    _check = chekcs[1];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    
    checkY = 609;
    _check = chekcs[2];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 592;
    _check = chekcs[3];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 575;
    _check = chekcs[4];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 558;
    _check = chekcs[5];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 541;
    _check = chekcs[6];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 524;
    _check = chekcs[7];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 507;
    _check = chekcs[8];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 490;
    _check = chekcs[9];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }


    // -------------------- 2. ------------------ //
    checkY = 451;
    _check = chekcs[10];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 434;
    _check = chekcs[11];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 395;
    _check = chekcs[12];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 378;
    _check = chekcs[13];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 361;
    _check = chekcs[14];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 344;
    _check = chekcs[15];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 327;
    _check = chekcs[16];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    
    checkY = 310;
    _check = chekcs[17];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 293;
    _check = chekcs[18];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 276;
    _check = chekcs[19];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }


    checkY = 248;
    _check = chekcs[20];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 231;
    _check = chekcs[21];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }


    // -------------------- 3. ------------------ //

    checkY = 157;
    _check = chekcs[22];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 105;
    _check = chekcs[23];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }


    // ----------------- NEXT PAGE --------------- //

    page = pdfDoc.getPage(p2);

    let detail = _detail || 'NO HAY OBSERVACIONES';

    let formatString = detail.split('\n');
    for (let i = 0; i < formatString.length; i++) {
        formatString[i] = formatString[i].replace(/^/, ``);
    }
    formatString = formatString.join('\n');
    const _detailsWrapped = (s) => s.replace(
        /(?![^\n]{1,170}$)([^\n]{1,170})\s/g, '$1\n'
    );
    if (_detailsWrapped(formatString)) {
        let _detailsArray = _detailsWrapped(formatString).split("\n");
        _detailsArray.map((value, i) => { page.moveTo(45, 656 - (i * 13.00)); page.drawText(`${value}`, { size: 7 }); })
    }
}