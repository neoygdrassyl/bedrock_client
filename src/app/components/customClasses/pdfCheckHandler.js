export function handleArchCheck(pdfDoc, page, chekcs, _detail, p1, p2, model) {
    page = pdfDoc.getPage(p1);

    let yesAxis = 482;
    let noAxis = 517;
    let naAxis = 549;
    let fontSize = 11

    let model_con_1 = Number(model) >= 2022
    if (model_con_1) fontSize = 12

    if (model_con_1) {
        yesAxis = 482 - 10;
        noAxis = 517 - 3;
        naAxis = 549 + 6;
    }

    // -------------------- 1. ------------------ //

    let checkY = 682;
    if (model_con_1) checkY = 546
    let _check = chekcs[27];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    // -------------------- Rótulo ------------------ //
    checkY = 624;
    if (model_con_1) checkY = 505
    _check = chekcs[0];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 607;
    if (model_con_1) checkY = 494
    _check = chekcs[1];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 590;
    if (model_con_1) checkY = 483
    _check = chekcs[2];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 573;
    if (model_con_1) checkY = 472
    _check = chekcs[3];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    // -------------------- Características del predio ------------------ //

    checkY = 545;
    if (model_con_1) checkY = 450
    _check = chekcs[4];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 528;
    if (model_con_1) checkY = 439
    _check = chekcs[5];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 511;
    if (model_con_1) checkY = 428
    _check = chekcs[6];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 494;
    if (model_con_1) checkY = 417
    _check = chekcs[7];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 477;
    if (model_con_1) checkY = 406
    _check = chekcs[8];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }


    // -------------------- Cuadro de áreas ------------------ //

    checkY = 449;
    if (model_con_1) checkY = 384
    _check = chekcs[9];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    // -------------------- Plantas arquitectónicas por piso, sótano o semisótano cubiertas ------------------ //
    checkY = 421;
    if (model_con_1) checkY = 362
    _check = chekcs[10];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 404;
    if (model_con_1) checkY = 351
    _check = chekcs[11];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 387;
    if (model_con_1) checkY = 340
    _check = chekcs[12];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 370;
    if (model_con_1) checkY = 329
    _check = chekcs[13];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 353;
    if (model_con_1) checkY = 318
    _check = chekcs[14];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 336;
    if (model_con_1) checkY = 302
    _check = chekcs[15];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 298;
    if (model_con_1) checkY = 287
    _check = chekcs[26];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    // -------------------- Cortes ------------------ //

    checkY = 276;
    if (model_con_1) checkY = 265
    _check = chekcs[16];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 259;
    if (model_con_1) checkY = 254
    _check = chekcs[17];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 242;
    if (model_con_1) checkY = 243
    _check = chekcs[18];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 225;
    if (model_con_1) checkY = 232
    _check = chekcs[19];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 208;
    if (model_con_1) checkY = 221
    _check = chekcs[20];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    // -------------------- Fachadas ------------------ //
    checkY = 179;
    if (model_con_1) checkY = 199
    _check = chekcs[21];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 162;
    if (model_con_1) checkY = 188
    _check = chekcs[22];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 145;
    if (model_con_1) checkY = 177
    _check = chekcs[23];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    // -------------------- 3. & 4. ------------------ //
    checkY = 120;
    if (model_con_1) checkY = 161
    _check = chekcs[24];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 90;
    if (model_con_1) checkY = 122
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
            if (index == 2) { { page.moveTo(na_x, Y); page.drawText('X', { size: fontSize }) } }
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

export function handleEnghCheck(pdfDoc, page, chekcs, _detail, p1, p2, model) {
    page = pdfDoc.getPage(p1);

    let yesAxis = 482;
    let noAxis = 516;
    let naAxis = 549;
    let fontSize = 11

    let model_con_1 = Number(model) >= 2022
    if (model_con_1) fontSize = 12

    if (model_con_1) {
        yesAxis = 482 - 10;
        noAxis = 517 - 3;
        naAxis = 549 + 6;
    }

    // -------------------- 1. ------------------ //

    let checkY = 659;
    if (model_con_1) checkY = 543
    let _check = chekcs[0];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 648;
    if (model_con_1) checkY = 531
    _check = chekcs[1];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 609;
    if (model_con_1) checkY = 499
    _check = chekcs[2];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 592;
    if (model_con_1) checkY = 488
    _check = chekcs[3];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 575;
    if (model_con_1) checkY = 477
    _check = chekcs[4];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 558;
    if (model_con_1) checkY = 466
    _check = chekcs[5];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 541;
    if (model_con_1) checkY = 455
    _check = chekcs[6];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 524;
    if (model_con_1) checkY = 444
    _check = chekcs[7];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 507;
    if (model_con_1) checkY = 433
    _check = chekcs[8];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 490;
    if (model_con_1) checkY = 422
    _check = chekcs[9];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }


    // -------------------- 2. ------------------ //
    checkY = 451;
    if (model_con_1) checkY = 398
    _check = chekcs[10];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 434;
    if (model_con_1) checkY = 387
    _check = chekcs[11];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 395;
    if (model_con_1) checkY = 353
    _check = chekcs[12];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 378;
    if (model_con_1) checkY = 342
    _check = chekcs[13];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 361;
    if (model_con_1) checkY = 331
    _check = chekcs[14];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 344;
    if (model_con_1) checkY = 320
    _check = chekcs[15];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 327;
    if (model_con_1) checkY = 309
    _check = chekcs[16];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 310;
    if (model_con_1) checkY = 298
    _check = chekcs[17];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 293;
    if (model_con_1) checkY = 287
    _check = chekcs[18];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 276;
    if (model_con_1) checkY = 276
    _check = chekcs[19];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }


    checkY = 248;
    if (model_con_1) checkY = 254
    _check = chekcs[20];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 231;
    if (model_con_1) checkY = 243
    _check = chekcs[21];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }


    // -------------------- 3. ------------------ //

    checkY = 157;
    if (model_con_1) checkY = 192
    _check = chekcs[22];
    if (_check == 0) { page.moveTo(noAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 1) { page.moveTo(yesAxis, checkY); page.drawText(`X`, { size: fontSize }); }
    if (_check == 2 || _check == undefined || _check == null) { page.moveTo(naAxis, checkY); page.drawText(`X`, { size: fontSize }); }

    checkY = 105;
    if (model_con_1) checkY = 148
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