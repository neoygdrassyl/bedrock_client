/* @Function   : rowConfCols
* 
* @Description: Creates a row with configurable proportions of columns and other elements to remark
* @Parameters : doc        type: PDFDocument()     - The pdfkit component that allows to create and modify the pdf
*               Y          type: int               - The Y position in which the row is going to be printed
*               _data      type: []                - An array of String values that contains the values to be printed, the lendgth of _data and _col MUST be the same
*               _cols      type: []                - An array of int values that indicated how the columns should be distributed along side a _config.width value, the lendgth of _data and _col MUST be the same
*               _config    type: {
*                            pretty : true | false       - It will give the row a light gray background
*                            width : int | 500           - It will denote the total width of the row, if not given has a default of 500 units 
*                            align : string | 'center'   - It will denote the aligment of the text to be printed, default 'center'
*                            x : int | 56                - It will denote the X position of the table, default 56
*                            draw : boolean | true      - Whether or not do draw the table
*                        }
* @return   :  PDFDocument()
* @examples of usage :
*         doc = PDFDocument()
*         rowConfCols(doc, doc.y, ['First Name', 'Second Name'], [2,1], {pretty: true}) 
*         rowConfCols(doc, doc.y, ['Alex', 'Smith'], [2,1], {align: 'left'}) 
*
*       returns a row with a row with two columns, the first columsn is going to use two thirds of the total width and the second column the remaining 1 third
*/
function rowConfCols(doc, Y, _data, _cols, _config = {}) {
    var config = {
        pretty: (_config.pretty ? true : false),
        width: (_config.width ? _config.width : 500),
        align: (_config.align ? _config.align : 'center'),
        X: (_config.X ? _config.X : 56),
        draw: (_config.draw === false ? false : true)
    }
    var cells_width = [];
    const cols = _cols.length
    var total = 0;
    for (var i = 0; i < cols; i++) {
        total += _cols[i];
    }
    for (var i = 0; i < cols; i++) {
        cells_width.push((((_cols[i]) / (total)) * config.width))
    }
    var cell_heigh = 0;
    var _Y = Y

    for (var i = 0; i < cols; i++) {
        var i_heigh = doc.heightOfString(_data[i], {
            align: config.align,
            columns: 1,
            width: cells_width[i] - 5,
        });
        if (i_heigh > cell_heigh) cell_heigh = i_heigh;
    }
    _Y = checkForPageJump(doc, cell_heigh, _Y);




    for (var i = 0; i < cols; i++) {
        if (config.pretty) {
            doc.lineJoin('miter')
                .lineWidth(0.5)
                .rect(config.X + getXforCol(config.width, _cols, i), _Y, cells_width[i], cell_heigh + 5)
                .fill("silver", 0.3)
                .stroke();
        } if (config.draw) {
            doc.lineJoin('miter')
                .lineWidth(0.5)
                .rect(config.X + getXforCol(config.width, _cols, i), _Y, cells_width[i], cell_heigh + 5)
                .fillColor("black", 1)
                .strokeColor("black", 1)
                .stroke()
        }

    }

    for (var i = 0; i < cols; i++) {
        doc.text(_data[i], config.X + getXforCol(config.width, _cols, i) + 3, _Y + 5, {
            align: config.align,
            columns: 1,
            width: cells_width[i] - 5,
        });
    }

    doc.text('', config.X, _Y + cell_heigh + 5);
    return doc
}

/* @Function   : rowConfCols2
* 
* @Description: Creates a row with configurable proportions of columns and configurable styles for each column independentltly
* @Parameters : doc        type: PDFDocument()     - The pdfkit component that allows to create and modify the pdf
*               Y          type: int               - The Y position in which the row is going to be printed
*               _data      type: []                - An array of String values that contains the values to be printed, the lendgth of _data and _col MUST be the same
*               _cols      type: []                - An array of int values that indicated how the columns should be distributed along side a _config.width value, the lendgth of _data and _col MUST be the same
*               _colsConfig  type: [] 
*                        {
*                            pretty : true | false       - It will give the row a light gray background
*                            color : string | false      - If pretty is used, then it will change the color of the background of the cell, accepts conventional color naming rgb(0,0,0), #000, #000000 and html color names (name the color in lowercase only)
*                            align : string | 'center'   - It will denote the aligment of the text to be printed, default 'center'
*                            fontSize : string | false   - If given changes the fontSize for that cell
*                            bold : boolean | false       - If given changes the font used for that cell
*                        }
*               _config  type: {
*                            width : int | 500           - It will denote the total width of the row, if not given has a default of 500 units 
*                            x : int | 56                - It will denote the X position of the table, default 56
*                            draw : boolean | true      - Whether or not do draw the table
*                        }
* @return   :  PDFDocument()
* @examples of usage :
*         doc = PDFDocument()
*         rowConfCols(doc, doc.y, ['First Name', 'Second Name'], [2,1], {pretty: true}) 
*         rowConfCols(doc, doc.y, ['Alex', 'Smith'], [2,1], {align: 'left'}) 
*
*       returns a row with a row with two columns, the first columsn is going to use two thirds of the total width and the second column the remaining 1 third
*/
function rowConfCols2(doc, Y, _data, _cols, _colsConfig = [], _config = {}) {
    var config = {
        width: (_config.width ? _config.width : doc.page.width - doc.page.margins.left - doc.page.margins.right),
        X: (_config.X ? _config.X : doc.page.margins.left),
        draw: (_config.draw === false ? false : true)
    }
    var colsConfigs = _colsConfig;
    var _defaultColConfig = {
        pretty: false,
        align: 'center',
        fontSize: false,
        bold: false,
        color: false,
        fillColor: 'black',
    }
    for (var i = 0; i < colsConfigs.length; i++) {
        if (!colsConfigs[i].pretty) colsConfigs[i].pretty = _defaultColConfig.pretty;
        if (!colsConfigs[i].align) colsConfigs[i].align = _defaultColConfig.align;
        if (!colsConfigs[i].fontSize) colsConfigs[i].fontSize = _defaultColConfig.fontSize;
        if (!colsConfigs[i].bold) colsConfigs[i].bold = _defaultColConfig.bold;
        if (!colsConfigs[i].color) colsConfigs[i].color = _defaultColConfig.color;
        if (!colsConfigs[i].fillColor) colsConfigs[i].fillColor = _defaultColConfig.fillColor;
    }
    var cells_width = [];
    const cols = _cols.length
    var total = 0;
    for (var i = 0; i < cols; i++) {
        total += _cols[i];
    }
    for (var i = 0; i < cols; i++) {
        cells_width.push((((_cols[i]) / (total)) * config.width))
    }
    var cell_heigh = 0;
    var _Y = Y

    for (var i = 0; i < cols; i++) {
        if (colsConfigs[i].bold) doc.font('Helvetica-Bold')
        var i_heigh = doc.heightOfString(_data[i], {
            align: colsConfigs[i].align,
            columns: 1,
            width: cells_width[i] - 5,
        });
        doc.font('Helvetica')
        if (i_heigh > cell_heigh) cell_heigh = i_heigh;
    }

    _Y = checkForPageJump(doc, cell_heigh, _Y);

    for (var i = 0; i < cols; i++) {
        if (colsConfigs[i].pretty) {
            let color = colsConfigs[i].color ? colsConfigs[i].color : "silver";
            doc.lineJoin('miter')
                .lineWidth(0.5)
                .rect(config.X + getXforCol(config.width, _cols, i), _Y, cells_width[i], cell_heigh + 5)
                .fill(color, 0.3)
                .fillColor('black', 1)
                .stroke();
        } if (config.draw) {
            doc.lineJoin('miter')
                .lineWidth(0.5)
                .rect(config.X + getXforCol(config.width, _cols, i), _Y, cells_width[i], cell_heigh + 5)
                .fillColor('black', 1)
                .strokeColor("black", 1)
                .stroke()
        }
    }

    for (var i = 0; i < cols; i++) {
        if (colsConfigs[i].bold) doc.font('Helvetica-Bold')
        doc.fillColor(colsConfigs[i].fillColor, 1).text(_data[i], config.X + getXforCol(config.width, _cols, i) + 3, _Y + 5, {
            align: colsConfigs[i].align,
            columns: 1,
            width: cells_width[i] - 5,
        });
        doc.fillColor('black', 1)
        doc.font('Helvetica')
    }
    let startMarker = doc.y;
    doc.text('', config.X, _Y + cell_heigh + 5);
    let endMarker = doc.y;
    let markerDiff = startMarker - endMarker;
    coordinatePages(doc, markerDiff)

    return doc
}

/* @Function   : table
* 
* @Description: Creates table using a grid style pattern defined in the arguments, it can create more complex types to tables and handle
*               jump pages more efficiently
* @IMPORTANT:   Before using this function, some working variables must be set in the object doc, these are:
*               doc.startPage = doc.bufferedPageRange().count - 1;
                doc.lastPage = doc.bufferedPageRange().count - 1;
* @Parameters : doc        type: PDFDocument()     - The pdfkit component that allows to create and modify the pdf
*               _cells   type: [                   - The array of cells, each having its own configuration and place in the table
*                                   {
*                                       bold : true | false         - Gives the text the bold property
*                                       color : string | false      - Change the color of the font, it accepts conventional color naming rgb(0,0,0), #000, #000000 and html color names (name the color in lowercase only)
*                                       fill : string | false       - Change the color of the background, it accepts conventional color naming rgb(0,0,0), #000, #000000 and html color names (name the color in lowercase only)
*                                       align : string | 'center'   - It will denote the aligment of the text to be printed, default 'center',
*                                                                      Other values: 'center' | 'right' | 'left' | 'justify'
*                                       bold : boolean | false      - If given changes the font used for that cell
*                                       valign : boolean | false    - It will align the text vertically in the center
*                                       hide : boolean | false      - It will not print the border of the table
*                                       ygap : boolean | false      - This will try to adjust the case for compose tables when jumping pages
*                                   }
*                               ]                 
*               _start   type: [x,y]                - A 2 length array of integers, stating the start position of the table
*               _grid    type: [w,h]                - A 2 length array of integers, stating the grid pattern of the table
*               _config  type:                      - An object defining some various configurations for the whole table
*                        {
*                            lineHeight : string | 11             - It will force the heigt of each row, if used -1 as value, the value will adjust on the size of the text
*                            returnStart : boolean | false        - Using startPage and lastPage, it will place the cursor back at the beggining
*                            equalizePages : boolean | false      - Using startPage and lastPage, it will equalize both values at the end of the creation of the table
 eq                          forceNewPage : boolean | false       - If it detects a jump page, is going to cotninue to a new page
*                        }
* @return   :  PDFDocument()
* @examples of usage :
*         doc = PDFDocument()
            pdfSupport.table(doc,
                                [
                                    { coord: [32, 0], w: 8, h: 1, text: 'Parámetros', config: { align: 'center', bold: true, } },
                                    { coord: [40, 0], w: 5, h: 1, text: 'Proyecto', config: { align: 'center', bold: true, } },
                                    { coord: [45, 0], w: 5, h: 1, text: 'Norma', config: { align: 'center', bold: true, } },
                                    { coord: [50, 0], w: 6, h: 1, text: 'P;N', config: { align: 'center', bold: true, } },
                                    { coord: [56, 0], w: 6, h: 1, text: 'Evaluación', config: { align: 'center', bold: true, } },
                                ],
                                [doc.x, doc.y], 
                                [62, 1], 
                                {}
                            )
*
*/
function table(doc, _cells, _start, _grid, _config = {}) {
    let __start = _start;
    let startPage;
    let startY;
    let nextPageNivelator = 0;
    let forceNewPage = _config.forceNewPage
    if (_config.returnStart) {
        startPage = doc.startPage;
        startY = doc.startY;
    }

    let docWidth = _config.width ? _config.width : doc.page.width - doc.page.margins.left - doc.page.margins.right;
    let lineHeight = _config.lineHeight;
    if (lineHeight == null || lineHeight == undefined) lineHeight = 11;
    else if (lineHeight == -1) {
        let stringHeight = 0;
        _cells.map(cell => {
            let width = docWidth / _grid[0] * cell.w;
            let align = cell.config.align ? cell.config.align : 'center';
            let textOptions = {
                align: align,
                columns: 1,
                width: width - 4,
            }
            if (cell.config.bold) doc.font('Helvetica-Bold')
            let newHS = doc.heightOfString(cell.config.ignore ? ' ' : cell.text, textOptions);
            doc.font('Helvetica')
            if (newHS > stringHeight) stringHeight = newHS;
        })
        lineHeight = stringHeight + 3;
    }
    let cellDim = [docWidth / _grid[0], lineHeight];

    let rowsHeighhts = Array(_grid[1]).fill(0);
    _cells.map(_cell => {
        let _align = _cell.config.align ? _cell.config.align : 'center';
        let _width = cellDim[0] * _cell.w;

        let _textOptions = {
            align: _align,
            columns: 1,
            width: _width - 4,
        }
        if (_cell.config.bold) doc.font('Helvetica-Bold')
        let rowTh = doc.heightOfString(_cell.text, _textOptions);
        doc.font('Helvetica')
        if (rowsHeighhts[_cell.coord[1]] < rowTh) rowsHeighhts[_cell.coord[1]] = rowTh;
    })

    let yCoordOffset = 0 // VARIABLE TO ADJUST THE PLACEMENT OF THE CELL AFTER JUMPING PAGES
    let yCoordOffseti = 0// VARIABLE TO ADJUST THE PLACEMENT OF THE CELL AFTER JUMPING PAGES
    let yCoordOffsety = 0// VARIABLE TO ADJUST THE PLACEMENT OF THE CELL AFTER JUMPING PAGES
    let yCoordOffsetn = 0// VARIABLE TO ADJUST THE PLACEMENT OF THE CELL AFTER JUMPING PAGES
    let newPage = false;
    let jumpedPage = (doc.bufferedPageRange().count - 1) != doc.lastPage; // VARIABLE TO ADJUST THE PLACEMENT OF THE CELL AFTER JUMPING PAGES

    if (_config.adjustPageBreak) {
        _cells.map((cell, i) => {
            let _cellDim = cellDim;
            let start = [doc.x + _cellDim[0], doc.y + _cellDim[1]];
            let height = _cellDim[1] * cell.h;
            let afterY = start[1] + height;
            let jumpY = doc.page.height - doc.page.margins.bottom;
            if (jumpY < afterY) {
                if ((doc.lastPage == doc.startPage || forceNewPage)) {
                    doc.addPage();
                    let newLastPage = doc.bufferedPageRange().count - 1;
                    doc.switchToPage(newLastPage);
                    doc.lastPage = newLastPage;

                } else doc.switchToPage(doc.bufferedPageRange().count - 1);
                doc.x = doc.page.margins.left;
                doc.y = doc.page.margins.top;
                __start = [doc.x, doc.y];
            }
        })
    }


    _cells.map((cell, i) => {
        let _cellDim = cellDim;
        let nivelator = (cell.coord[1] - nextPageNivelator);
        if (newPage && jumpedPage) {
            nivelator++;
            newPage = false;
        }
        if (nivelator < 0) nivelator = 0;

        let start = [__start[0] + _cellDim[0] * cell.coord[0], __start[1] + _cellDim[1] * nivelator - (_cellDim[1] * yCoordOffsety * yCoordOffset)];
        let fill = cell.config.fill ? cell.config.fill : 'white';
        let color = cell.config.color ? cell.config.color : 'black';
        let lineColor = cell.config.lineColor ? cell.config.lineColor : 'black';
        let strokeColor = cell.config.strokeColor ? cell.config.strokeColor : 'black';
        let lineWidth = cell.config.lineWidth ? cell.config.lineWidth : 0.5;
        let align = cell.config.align ? cell.config.align : 'center';
        let width = _cellDim[0] * cell.w;
        let height = _cellDim[1] * cell.h;
        let hide = cell.config.hide ? cell.config.hide : false;

        let textOptions = {
            align: align,
            columns: 1,
            width: width - 4,
        }

        if (cell.config.bold) doc.font('Helvetica-Bold')
        let th = doc.heightOfString(cell.config.ignore ? ' ' : cell.text, textOptions);
        doc.font('Helvetica')

        let afterY = start[1] + height;
        let jumpY = doc.page.height - doc.page.margins.bottom;
        if (jumpY < afterY) {
            jumpedPage = true
            yCoordOffset = 1;
            yCoordOffseti = _cellDim[1] * (nivelator - 1);
            yCoordOffsety = nivelator - 1;
            __start[1] = doc.page.margins.top - _cellDim[1];
            __start[0] = doc.page.margins.left;

            if ((doc.lastPage == doc.startPage || forceNewPage)) {
                doc.addPage();
                let newLastPage = doc.bufferedPageRange().count - 1;
                doc.switchToPage(newLastPage);
                doc.lastPage = newLastPage;
            } else doc.switchToPage(doc.bufferedPageRange().count - 1);
            nextPageNivelator++;
            newPage = true;
            nivelator = (cell.coord[1] - nextPageNivelator);
            if (newPage) nivelator++;
            if (nivelator < 0) nivelator = 0;
            start = [__start[0] + _cellDim[0] * cell.coord[0], __start[1] + _cellDim[1] * nivelator - (_cellDim[1] * yCoordOffsety * yCoordOffset)];
        }

        if (!cell.config.ignore) {
            // THIS IS THE FIRST SQUARE
            doc.lineJoin('miter')
                .lineWidth(lineWidth)
                .rect(start[0], start[1], width, height)
                .fill(fill, 1)
                .fillColor(lineColor, 1)
                .strokeColor(strokeColor, 1)
                .stroke();
            // THIS IS THE OUTLINE SQUARE
            if (!hide) doc.lineJoin('miter')
                .lineWidth(0.5)
                .rect(start[0], start[1], width, height)
                .fillColor('black', 1)
                .strokeColor(strokeColor, 1)
                .stroke()
            // THIS IS THE TEXT ON THE SQUARE
            if (cell.config.valign) {
                if (cell.config.bold) doc.font('Helvetica-Bold')
                start[1] = start[1] + (height - th) / 2 - 2
                doc.font('Helvetica');
            }

            if (cell.config.bold) doc.font('Helvetica-Bold')
            let txt = String(cell.text || ' ').replace(/Ð/g, '');
            doc.fillColor(color, 1).text(cell.config.ignore ? ' ' : txt, start[0] + 2, start[1] + 3, textOptions);
            doc.strokeColor('black', 1)
            doc.fillColor('black', 1)
            doc.font('Helvetica');
        }


    })
    if (_config.returnStart) {
        let _y = doc.y;
        let _endY = doc._endY ? doc._endY : 0;
        if (_y > _endY) doc._endY = _y;
        doc.y = startY;
        doc.x = doc.page.margins.left;
        doc.switchToPage(startPage);
    } else {

        let finalX = doc.page.margins.left;
        let finalY = __start[1] + _grid[1] * lineHeight;
        let rowTh = doc.heightOfString(' ');
        let afterY = finalY + rowTh;
        let jumpY = doc.page.height - doc.page.margins.bottom;
        if (jumpY < afterY) {
            finalY = doc.page.margins.top;
            if (doc.lastPage == doc.startPage || forceNewPage) {
                doc.addPage();
                let newLastPage = doc.bufferedPageRange().count - 1;
                doc.switchToPage(newLastPage);
                doc.lastPage = newLastPage;
            } else {
                doc.switchToPage(doc.bufferedPageRange().count - 1);
            }
        }
        doc.text('', finalX, finalY - (yCoordOffseti) * yCoordOffset);
    }
    if (_config.equalizePages) doc.startPage = doc.lastPage;
    return doc
}

function table2(doc, _cells, _start, _grid, _config = {}) {
    let __start = _start;
    let startPage;
    let startY;
    let nextPageNivelator = 0;
    let forceNewPage = _config.forceNewPage
    if (_config.returnStart) {
        startPage = doc.startPage;
        startY = doc.startY;
    }
    

    let docWidth = _config.width ? _config.width : doc.page.width - doc.page.margins.left - doc.page.margins.right;
    let lineHeight = _config.lineHeight;
    let linesHeights = Array(_grid[1]).fill(0);
    if (lineHeight == null || lineHeight == undefined) lineHeight = 11;
    else if (lineHeight == -1) {
        let stringHeight = 0;
        _cells.map(cell => {

            let width = docWidth / _grid[0] * cell.w;
            let align = cell.config.align ? cell.config.align : 'center';
            let textOptions = {
                align: align,
                columns: 1,
                width: width - 4,
            }
            if (cell.config.bold) doc.font('Helvetica-Bold')
            let newHS = doc.heightOfString(cell.config.ignore ? ' ' : cell.text, textOptions);
            doc.font('Helvetica')
            if (newHS > (linesHeights[cell.coord[1]] / cell.h)) linesHeights[cell.coord[1]] = newHS / cell.h + 3;
            if (newHS > stringHeight) stringHeight = newHS;
        })
        lineHeight = stringHeight + 3;
    }
    let cellDim = [docWidth / _grid[0], lineHeight];

    let rowsHeighhts = Array(_grid[1]).fill(0);
    _cells.map(_cell => {
        let _align = _cell.config.align ? _cell.config.align : 'center';
        cellDim = [docWidth / _grid[0], linesHeights[_cell.coord[1]]];
        let _width = cellDim[0] * _cell.w;
        let _textOptions = {
            align: _align,
            columns: 1,
            width: _width - 4,
        }
        if (_cell.config.bold) doc.font('Helvetica-Bold')
        let rowTh = doc.heightOfString(_cell.text, _textOptions);
        doc.font('Helvetica')
        if (rowsHeighhts[_cell.coord[1]] < rowTh) rowsHeighhts[_cell.coord[1]] = rowTh;
    })

    let yCoordOffset = 0 // VARIABLE TO ADJUST THE PLACEMENT OF THE CELL AFTER JUMPING PAGES
    let yCoordOffseti = 0// VARIABLE TO ADJUST THE PLACEMENT OF THE CELL AFTER JUMPING PAGES
    let yCoordOffsety = 0// VARIABLE TO ADJUST THE PLACEMENT OF THE CELL AFTER JUMPING PAGES
    let yCoordOffsetn = 0// VARIABLE TO ADJUST THE PLACEMENT OF THE CELL AFTER JUMPING PAGES
    let newPage = false;
    let jumpedPage = (doc.bufferedPageRange().count - 1) != doc.lastPage; // VARIABLE TO ADJUST THE PLACEMENT OF THE CELL AFTER JUMPING PAGES

    _cells.map((cell, i) => {
        cellDim = [docWidth / _grid[0], linesHeights[cell.coord[1]]];
        let _cellDim = cellDim;
        let start = [doc.x + _cellDim[0], doc.y + _cellDim[1]];
        let height = _cellDim[1] * cell.h;
        let afterY = start[1] + height;
        let jumpY = doc.page.height - doc.page.margins.bottom;
        if (jumpY < afterY) {
            if ((doc.lastPage == doc.startPage || forceNewPage)) {
                doc.addPage();
                let newLastPage = doc.bufferedPageRange().count - 1;
                doc.switchToPage(newLastPage);
                doc.lastPage = newLastPage;

            } else doc.switchToPage(doc.bufferedPageRange().count - 1);
            doc.x = doc.page.margins.left;
            doc.y = doc.page.margins.top;
            __start = [doc.x, doc.y];
        }
    })


    _cells.map((cell, i) => {


        let addedHeightPrevW = linesHeights.reduce((current, next, i) => {
            if (i < cell.h && i > cell.coord[1]) return current += next;
            return current
        }, 0)

        let addedHeightPrev = linesHeights.reduce((current, next, i) => {
            if (i < cell.coord[1]) return current += next;
            return current
        }, 0)

        cellDim = [docWidth / _grid[0], linesHeights[cell.coord[1]]];
        let _cellDim = cellDim;

        let nivelator = (cell.coord[1] - nextPageNivelator);
        if (newPage && jumpedPage) {
            nivelator++;
            newPage = false;
        }
        if (nivelator < 0) nivelator = 0;

        let start = [__start[0] + _cellDim[0] * cell.coord[0], __start[1] + addedHeightPrev];
        let width = _cellDim[0] * cell.w;
        let height = _cellDim[1] + addedHeightPrevW;

        let fill = cell.config.fill ? cell.config.fill : 'white';
        let color = cell.config.color ? cell.config.color : 'black';
        let lineColor = cell.config.lineColor ? cell.config.lineColor : 'black';
        let strokeColor = cell.config.strokeColor ? cell.config.strokeColor : 'black';
        let lineWidth = cell.config.lineWidth ? cell.config.lineWidth : 0.5;
        let align = cell.config.align ? cell.config.align : 'center';

        let hide = cell.config.hide ? cell.config.hide : false;

        let textOptions = {
            align: align,
            columns: 1,
            width: width - 4,
        }

        if (cell.config.bold) doc.font('Helvetica-Bold')
        let th = doc.heightOfString(cell.config.ignore ? ' ' : cell.text, textOptions);
        doc.font('Helvetica')

        let afterY = start[1] + height;
        let jumpY = doc.page.height - doc.page.margins.bottom;
        if (jumpY < afterY) {
            jumpedPage = true
            yCoordOffset = 1;
            yCoordOffseti = _cellDim[1] * (nivelator - 1);
            yCoordOffsety = nivelator - 1;
            __start[1] = doc.page.margins.top - _cellDim[1];
            __start[0] = doc.page.margins.left;

            if ((doc.lastPage == doc.startPage || forceNewPage)) {
                doc.addPage();
                let newLastPage = doc.bufferedPageRange().count - 1;
                doc.switchToPage(newLastPage);
                doc.lastPage = newLastPage;
            } else doc.switchToPage(doc.bufferedPageRange().count - 1);
            nextPageNivelator++;
            newPage = true;
            nivelator = (cell.coord[1] - nextPageNivelator);
            if (newPage) nivelator++;
            if (nivelator < 0) nivelator = 0;
            start = [__start[0] + _cellDim[0] * cell.coord[0], __start[1] + _cellDim[1] * nivelator - (_cellDim[1] * yCoordOffsety * yCoordOffset)];
        }

        if (!cell.config.ignore) {
            // THIS IS THE FIRST SQUARE
            doc.lineJoin('miter')
                .lineWidth(lineWidth)
                .rect(start[0], start[1], width, height)
                .fill(fill, 1)
                .fillColor(lineColor, 1)
                .strokeColor(strokeColor, 1)
                .stroke();
            // THIS IS THE OUTLINE SQUARE
            if (!hide) doc.lineJoin('miter')
                .lineWidth(0.5)
                .rect(start[0], start[1], width, height)
                .fillColor('black', 1)
                .strokeColor(strokeColor, 1)
                .stroke()
            // THIS IS THE TEXT ON THE SQUARE
            if (cell.config.valign) {
                if (cell.config.bold) doc.font('Helvetica-Bold')
                start[1] = start[1] + (height - th) / 2 - 2
                doc.font('Helvetica');
            }

            if (cell.config.bold) doc.font('Helvetica-Bold')
            let txt = String(cell.text || ' ').replace(/Ð/g, '');
            doc.fillColor(color, 1).text(cell.config.ignore ? ' ' : txt, start[0] + 2, start[1] + 3, textOptions);
            doc.strokeColor('black', 1)
            doc.fillColor('black', 1)
            doc.font('Helvetica');
        }


    })
    if (_config.returnStart) {
        let _y = doc.y;
        let _endY = doc._endY ? doc._endY : 0;
        if (_y > _endY) doc._endY = _y;
        doc.y = startY;
        doc.x = doc.page.margins.left;
        doc.switchToPage(startPage);
    } else {

        let finalX = doc.page.margins.left;
        let finalY = __start[1] + linesHeights.reduce((current, next) => current += next, 0);
        let rowTh = doc.heightOfString(' ');
        let afterY = finalY + rowTh;
        let jumpY = doc.page.height - doc.page.margins.bottom;
        if (jumpY < afterY) {
            finalY = doc.page.margins.top;
            if (doc.lastPage == doc.startPage || forceNewPage) {
                doc.addPage();
                let newLastPage = doc.bufferedPageRange().count - 1;
                doc.switchToPage(newLastPage);
                doc.lastPage = newLastPage;
            } else {
                doc.switchToPage(doc.bufferedPageRange().count - 1);
            }
        }
        doc.text('', finalX, finalY - (yCoordOffseti) * yCoordOffset);
    }
    if (_config.equalizePages) doc.startPage = doc.lastPage;
    return doc
}


/* @Function   : tableConf
* 
* @Description: Creates a customizable table using defined parameters that allows to set the size and configurations of specific cells and columns
* @Parameters : doc        type: PDFDocument()     - The pdfkit component that allows to create and modify the pdf
*               Y          type: int               - The Y position in which the table is going to be printed
*               _DATA      type: []                - An array of arrays of String values that contains the values to be printed
*               _cols      type: []                - An array of int values that indicated how the columns should be distributed along side a _config.width value, the length of _DATA and _col MUST be the same
*               _colsStyle type: [ style: {         - An array of {} values that indicates the configuration of each cell separatedly
*                            align: string | 'left'         - The aligment of the text in the cell, default left
*                            columns: int | 1               - Value used by the software to calculate the position of the text, leve it as it is
*                            width: int | int               - The value of the width of the cell, is replaced automatically on creation
*                            bold : boolean | false         - Show the text in bold font
*                            valign : boolean | false       - Align the text vertically
*                            fillColum : booealn | false    - It will drag the height of the cell to match the height of the table
*                            extendRow : int                - Is the index of the cell to extend, use in combination with extend
*                            extend: int                    - How much the cell is going to be extended, in total number of cols used
*                            ignoreRow: int                 - It will not print the cell at the index given, use in combination with extendRow and extend
*                            }]            
*               _config    type: {
*                            width : int | 500           - It will denote the total width of the table, if not given has a default of 500 units 
*                            x : int | 56                - It will denote the X position of the table, default 56
*                           }
* @return   :  PDFDocument()
* @examples of usage :
*         doc = PDFDocument()
*         table(doc, doc.y, [
*                                ['GATHER OF VALUES'],
*                                ['Value 1', 'Value 2', 'Value 3', 'Value 4', 'THIS ARE SPECIAL VALUE', 'Value 5', 'Value 5', 'Value 6'],
*                                [`${value_1}`, `${value_2}`,`${value_3}`,`${value_4}`, '\n', `${value_5}`, `${value_6}`, `${value_7}`]
*                            ],
*                            [5, 4, 5],
*                            [
*                                { align: 'left', columns: 1, width: 0, bold: true, valign: true, fillColum: true },
*                                { align: 'left', columns: 1, width: 0, bold: false, extendRow: 4, extend: 5 },
*                                { align: 'center', columns: 1, width: 0, bold: true, ignoreRow: 4 }
*                            ],
*                            );
*
* @note : This functions is under development and is prone to bugs that require some finese to navigate around.
*/
function tableConf(doc, Y, _DATA, _cols, _colsStyle = [], _config = {}) {
    var config = {
        width: (_config.width ? _config.width : 500),
        X: (_config.X ? _config.X : 56)
    }
    var cells_width = [];
    const cols = _cols.length
    var total = 0;
    var colsStyle = _colsStyle;
    for (var i = 0; i < cols; i++) {
        total += _cols[i];
    }
    for (var i = 0; i < cols; i++) {
        cells_width.push((((_cols[i]) / (total)) * config.width))
    }
    for (var i = 0; i < cells_width.length; i++) {
        if (!_colsStyle) colsStyle.push({ align: 'left', columns: 1, width: cells_width[i] - 5, bold: false })
        else colsStyle[i].width = cells_width[i] - 5
    }

    var max_height = 0;
    var _Y = Y
    var cells_height = []
    var cells_y = []
    for (var i = 0; i < _DATA.length; i++) {
        let i_height = 0;
        var _columns_data = _DATA[i];
        cells_height.push([0]);
        cells_y.push([])
        for (var j = 0; j < _columns_data.length; j++) {
            let configs = colsStyle[i]
            if (configs.extendRow == j) configs.width = configs.width * configs.extend - 5
            let j_height = doc.heightOfString(_columns_data[j], configs) + 5;
            i_height += j_height
            cells_height[i].push(i_height)
            cells_y[i].push(j_height)
            if (i_height > max_height) max_height = i_height;
        }
    }

    _Y = checkForPageJump(doc, max_height, _Y);

    for (var i = 0; i < _DATA.length; i++) {
        var _columns_data = _DATA[i];
        for (var j = 0; j < _columns_data.length; j++) {

            let cell_h = 0;
            let align_center = cells_height[i][j] + 5;
            let cell_width = cells_width[i]
            let configs = colsStyle[i]

            if (configs.fillColum) {
                cell_h = max_height
            } else {
                cell_h = cells_y[i][j];
            }
            if (configs.extendRow == j) cell_width = cell_width + ((configs.extend) / (total) * config.width)

            if (configs.ignoreRow != j) {
                doc.lineJoin('miter')
                    .lineWidth(0.5)
                    .rect(config.X + getXforCol(config.width, _cols, i), _Y + cells_height[i][j], cell_width, cell_h)
                    .fillColor("black", 1)
                    .strokeColor("black", 1)
                    .stroke()
            }

            if (colsStyle[i].valign) { align_center = cell_h / 2 - cells_y[i][j] / 2 }
            if (colsStyle[i].bold) doc.font('Helvetica-Bold')
            doc.text(_columns_data[j], config.X + getXforCol(config.width, _cols, i) + 3, _Y + align_center, configs);
            doc.font('Helvetica')
        }

    }
    doc.text('', config.X, _Y + max_height);
    return doc
}

/*@Function   : listText
*
* @Description: Creates a box withh text that can be formated in list form
* @Parameters : doc        type: PDFDocument()          - The pdfkit component that allows to create and modify the pdf
*               Y          type: int                    - The Y position in which the box is going to be printed
*               text       type: string                 - The value to be printes in the box
*               _config    type: {
*                            counterh : bool | false     - Use true to hide the counters all toguether
*                            counters : bool | false     - True to use lower case letter as list counters (a. b. c. ...) or simple scores ( - )
*                            width : int | 500           - It will denote the total width of the box, if not given has a default of 500 units 
*                            align : string | 'justify'  - It will denote the aligment of the text to be printed, default 'justify'
*                            x : int | 56                - It will denote the X position of the box, default 56
*                            draw : bool | true          - True to not draw the box line
*                            number : bool | false       - IF use counters, change then to numbers instead
*                            numberi : int | null        - WHEN using number, change the initial number to numberi
*                            numbers : bool | false      - WHEN using number, will separate 2 or more digits numbers with dots 21 -> 2.1
*                        }
* @return   :  PDFDocument()
* @examples of usage :
*         doc = PDFDocument()
*         lorem = `Lorem ipsum dolor sit amet, consectetur adipiscing elit.\nDuis ac faucibus nunc. Quisque ac eros sed nunc aliquam dignissim sed nec metus. Curabitur fringilla dui eget enim pellentesque, eu consequat nulla cursus.\nVivamus sapien ex, ultricies eu mauris vitae, tristique ornare augue. Suspendisse dui dolor, vehicula vitae nisi ut, facilisis ornare arcu. Donec justo ligula, accumsan ut auctor ac, malesuada in ex. Etiam cursus consectetur purus.\nSuspendisse sed massa a ipsum pellentesque fermentum quis sed ex. Vivamus mattis leo sit amet nisl pellentesque, in sagittis nisi vestibulum. In fringilla nisi vitae mauris auctor, nec imperdiet lectus tempus. Curabitur condimentum ipsum nisi, et laoreet ante rhoncus sed.\nMaecenas luctus in ipsum sed consequat.` 
*         pdfSupport.setHeader(doc, doc.y, lorem)
*        
*
*/
function listText(doc, Y, text, _config = {}) {
    var cell_heigh = 0;
    var _Y = Y
    var config = {
        counterh: (_config.counterh ? true : false),
        counters: (_config.counters ? true : false),
        width: (_config.width ? _config.width : doc.page.width - doc.page.margins.left - doc.page.margins.right),
        align: (_config.align ? _config.align : 'justify'),
        X: (_config.X ? _config.X : doc.page.margins.left),
        draw: (_config.draw != null ? _config.draw : true),
        number: (_config.number ? true : false),
        numberi: (_config.numberi ? _config.numberi : null),
        numbers: (_config.numbers ? true : false),
    }
    /*
       var i_heigh = doc.heightOfString(text, {
           align: config.align,
           columns: 1,
           width: config.width - 40,
       });
      
       if (i_heigh > cell_heigh) cell_heigh = i_heigh;
       _Y = checkForPageJump(doc, cell_heigh, _Y);
     */

    let _data = text ? text.split('\n') : [];
    let initial = 'a'
    if (config.number) {
        initial = 1;
        if (!isNaN(config.numberi)) initial = config.numberi;
    }



    // doc.text('\n');
    let squareStart = doc.y
    _data.map((_text, i) => {
        var i_heigh = doc.heightOfString(_text, {
            align: config.align,
            columns: 1,
            width: config.width - 40,
        });

        printText(_text)
    })

    function printText(_text) {
        let preText = "";
        if (config.counters) {
            let useDots = false;
            let initialDot;
            let littleOffset = 0;
            if (config.numbers) {
                initialDot = String(initial).split('');
                initialDot = initialDot.join('.')
                useDots = true;
                littleOffset = 5;
            }
            preText = config.counterh ? '' : ((useDots ? initialDot : initial) + ".")
            if (config.number) initial++;
            else initial = nextLetter(initial);
        }

        doc.text(`\n${preText} ${_text.replace('\r', '')}`, config.X + 20, doc.y, {
            align: config.align,
            columns: 1,
            width: config.width - 40,
        });
       
    }

    function drawBox(start_y, end_y) {
        doc.lineJoin('miter')
            .rect(config.X, start_y - 10, config.width, start_y - end_y + 10)
            .lineWidth(0.5)
            .stroke()
    }

    /*
        let _delta_y = [0];
        let _delta = 0;
        let regex = /[a-zA-Z]+\s##\s[a-zA-Z]+/i;
        for (var i = 0; i < _data.length; i++) {
            //let datai = _data[i].replace(regex, '\n');
            let datai = _data[i]
            var i_heigh = doc.heightOfString(datai + "", {
                align: config.align,
                columns: 1,
                width: config.width - 40,
            });
            _delta += i_heigh
            _delta_y.push(_delta)
        }
        _Y = checkForPageJump(doc, _delta, _Y);
    
    
       
        for (var i = 0; i < _data.length; i++) {
            if (_data[i]) {
                //let datai = _data[i].replace(regex, '\n');
                let datai = _data[i]
                if (config.counters) {
                    let useDots = false;
                    let initialDot;
                    let littleOffset = 0;
                    if (config.numbers) {
                        initialDot = String(initial).split('');
                        initialDot = initialDot.join('.')
                        useDots = true;
                        littleOffset = 5;
                    }
    
                    doc.text(config.counterh ? '' : ((useDots ? initialDot : initial) + "."), config.X + 6, _Y + _delta_y[i] + 10);
                    if (config.number) initial++;
                    else initial = nextLetter(initial);
    
                    doc.text(datai + "", config.X + 20 + littleOffset, _Y + _delta_y[i] + 10, {
                        align: config.align,
                        columns: 1,
                        width: config.width - 40,
                    });
                }
                else {
                    doc.text(config.counterh ? '' : '', config.X + 6, _Y + _delta_y[i] + 10);
                    doc.text(datai, config.X + 20, _Y + _delta_y[i] + 10, {
                        align: config.align,
                        columns: 1,
                        width: config.width - 40,
                    });
                }
            }
        }
    
        if (config.draw) {
            doc.lineJoin('miter')
                .rect(config.X, _Y, config.width, _delta + 10)
                .lineWidth(0.5)
                .stroke()
        }
    */
    doc.text('\n ');
    doc.x = doc.page.margins.left
}

/* @Function   : setHeader
* 
* @Description: Sets a header content on each page
* @Parameters : doc        type: PDFDocument()          - The pdfkit component that allows to create and modify the pdf
*               _config    type: {
*                            title : string | ''        - Prints a designate title bellow the main text
*                            id_public : string | ''    - Prints a designate id next to the title
*                            size : int | 12            - Size of the text font
*                            icon : true | false        - Wheter or not to show the icon
*                        }
* @return   :  PDFDocument()
* @examples of usage :
*         doc = PDFDocument()
*         pdfSupport.setHeader(doc, {icon: true})
*         pdfSupport.setHeader(doc, {title: `General Report of ${month}`, icon: true})
*
*/
function setHeader(doc, _config = {}) {
    var config = {
        title: (_config.title ? _config.title : ""),
        id_public: (_config.id_public ? _config.id_public : ""),
        size: (_config.size ? _config.size : 12),
        icon: (_config.icon ? true : false),
        header: (_config.header === true || _config.header === false ? _config.header : true),
    }
    const range = doc.bufferedPageRange();
    const curaduriaInfo = require('../config/curaduria.json')
    doc.switchToPage(0);
    for (var i = range.start; i < range.count; i++) {
        doc.switchToPage(i);
        let originalMargins = doc.page.margins;
        doc.page.margins = {
            top: 0,
            bottom: doc.page.margins.bottom,
            left: doc.page.margins.left,
            right: doc.page.margins.right
        };

        let x = doc.page.margins.left
        doc.fontSize(config.size);
        doc.font('Helvetica-BoldOblique');
        if (config.icon && config.header) doc.image('docs/public/logo192.png', x, 42, { width: 45, height: 45 })
        doc.text(`${config.header ? curaduriaInfo.job : ''}`, x, 42, { align: 'center' });
        if (config.header) doc.text(`${curaduriaInfo.title} ${curaduriaInfo.master}`, { align: 'center' });
        if (config.title) doc.text(config.title, { align: 'center', continue: true });
        doc.fontSize(8);
        if (config.bold_id) doc.font('Helvetica-Bold')
        if (config.id_public) doc.text(config.id_public, doc.x, doc.y + 10, { align: 'right' });
        if (config.bold_id) doc.font('Helvetica')
        doc.page.margins = originalMargins;
    }
    return doc;
}


/* @Function   : setBottom
* 
* @Description: Sets a botton content on each page
* @Parameters : doc         type: PDFDocument()          - The pdfkit component that allows to create and modify the pdf
*               pagination  type: boolean | false        - Where or not to show the page number at the bottom of the page
*               footer      type: boolean | false        - Where or not to the info text at the bottom of the page
* @return   :  PDFDocument()
* @examples of usage :
*         doc = PDFDocument()
*         pdfSupport.setBottom(doc, false, true)
*
*/
function setBottom(doc, pagination, footer, _height, _pgx = 0,) {
    const range = doc.bufferedPageRange();
    const curaduriaInfo = require('../config/curaduria.json')
    const height = _height ? _height : 56;
    doc.switchToPage(0);
    for (var i = range.start; i < range.count; i++) {
        doc.switchToPage(i);
        let originalMargins = doc.page.margins;
        doc.page.margins = {
            top: doc.page.margins.top,
            bottom: 0,
            left: doc.page.margins.left,
            right: doc.page.margins.right
        };
        doc.fontSize(8);
        doc.font('Helvetica');
        doc.text("", doc.page.margins.left, doc.page.height - height);
        if (footer) {
            doc.text(`${(curaduriaInfo.title).toUpperCase()} ${(curaduriaInfo.master).toUpperCase()}     NIT: ${curaduriaInfo.nit}`, { align: 'center' });
            doc.text(`${curaduriaInfo.dir}    Tel: ${curaduriaInfo.tel} Cel: ${curaduriaInfo.cel}    `, { align: 'center' });
            doc.text(`Email: ${curaduriaInfo.email}   Página Web: ${curaduriaInfo.page}`, { align: 'center' });
        }
        doc.fontSize(10);
        if (pagination) doc.text(i + 1 + ' de ' + range.count, doc.x + _pgx, doc.y, { align: 'center' });
        doc.page.margins = originalMargins;
    }
    return doc;
}

function setSign(doc, useDigitalFirm) {
    const curaduriaInfo = require('../config/curaduria.json')
    let path = curaduriaInfo.digital_sign || false;
    if (useDigitalFirm && path) {
        doc.fontSize(11).text('\n\n');
        doc.image(`${path}`, { width: 220, height: 60 })
    }
    else doc.fontSize(11).text('\n\n\n\n\n');

    doc.font('Helvetica-Bold')
    doc.fontSize(13).text(`${(curaduriaInfo.title).toUpperCase()} ${(curaduriaInfo.master).toUpperCase()}`);
    doc.fontSize(11).text(curaduriaInfo.job);
    doc.font('Helvetica')

    return doc;
}

/* @Function   : setWaterMark
* 
* @Description: Sets a watermark across the current pages
* @Parameters : doc             type: PDFDocument()          - The pdfkit component that allows to create and modify the pdf
*               text            type: string | ''            - Text to be printed on all pages
*               _config         type: {
*                                   stepX :     int | 200               - Space in X coordinates in between each line of text
*                                   stepY :     int | 200               - Space in Y coordinates in between each line of text
*                                   color :     string | 'gainsboro'    - color or the text
*                                   angle :     int | 0                 - angle in wich the text is going to be tilted 
*                                   fontSize :  int | 16                - font size of the text
*                               }
* @return   :  PDFDocument()
* @examples of usage :
*         doc = PDFDocument()
*         pdfSupport.setWaterMark(doc, 'DO NOT PAY HERE', [1,2,3])
*
*/
function setWaterMark(doc, text, config = {}) {
    const range = doc.bufferedPageRange();

    //doc.switchToPage(0);
    doc.fontSize(config.fontSize ? config.fontSize : 16);
    doc.font('Helvetica');
    let stepX = config.stepX ? config.stepX : 200;
    let stepY = config.stepY ? config.stepY : 200;
    doc.fillColor(config.color ? config.color : 'lightgray');
    let angle = config.angle ? config.angle : 0;

    //doc.switchToPage(i);
    let originalMargins = doc.page.margins;
    doc.page.margins = {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    };
    for (let j = 0; j < doc.page.width + stepX; j = j + stepX) {
        for (let k = 0; k < doc.page.height + stepY; k = k + stepY) {
            doc.rotate(angle, { origin: [j, k] });
            doc.x = j;
            doc.y = k;
            doc.text(text, { lineBreak: false });
            doc.rotate(-angle, { origin: [j, k] });
        }
    }

    doc.page.margins = originalMargins;
    doc.fillColor('black');
    //doc.switchToPage(0);
    doc.x = originalMargins.left;
    doc.y = originalMargins.top;

    return doc;
}


function text(doc, text, _config, x, y) {
    var config = _config ? _config : {}
    var text_heigh = doc.heightOfString(text, config);
    let startMarker = doc.y;
    let final_y = text_heigh + startMarker;
    if (final_y > doc.page.height - doc.page.margins.bottom) {
        if (doc.startPage != undefined) {
            var pageIndex = Number(doc.startPage);
            const range = doc.bufferedPageRange().count;
            if (pageIndex + 1 == range) {
                doc.addPage();
                doc.startPage = pageIndex + 1
            } else {
                doc.switchToPage(pageIndex + 1);
                doc.startPage = pageIndex + 1
            }
        } else {
            doc.addPage();
        }
        doc.y = doc.page.margins.top;
    }
    if (x && y) doc.text(text, x, doc.y, config);
    else doc.text(text, config);

}

// Supporting function for infotext
function nextLetter(s) {
    return s.replace(/([a-zA-Z])[^a-zA-Z]*$/, function (a) {
        var c = a.charCodeAt(0);
        switch (c) {
            case 90: return 'A';
            case 122: return 'a';
            default: return String.fromCharCode(++c);
        }
    });
}

// Function to check for a current existing bug in (this version of) PDFKIT and fix it
function checkForPageJump(doc, _height, _Y) {
    if (_Y + _height + 5 > doc.page.height - doc.page.margins.bottom) {
        if (doc.startPage != undefined) {
            var pageIndex = Number(doc.startPage);
            const range = doc.bufferedPageRange().count;
            if (isNaN(pageIndex)) {
                //doc.addPage();
                doc.switchToPage(range - 1);
                doc.startPage = range - 1;
            }
            else if (range == pageIndex + 1) {
                doc.addPage();
                doc.startPage = pageIndex + 1
            } else {
                doc.switchToPage(range - 1);
                doc.startPage = range - 1
            }
        } else {
            doc.addPage();
        }

        return doc.page.margins.top;
    }
    return doc.y
}

function coordinatePages(doc, _markerDiff) {
    if (_markerDiff > 0) {
        if (doc.startPage != undefined) {
            var pageIndex = Number(doc.startPage);
            const range = doc.bufferedPageRange().count;
            if (isNaN(pageIndex)) {
                //doc.addPage();
                doc.switchToPage(range - 1);
                doc.startPage = range - 1;
            }
            else if (range == pageIndex + 1) {
                doc.addPage();
                doc.startPage = pageIndex + 1
            } else {
                doc.switchToPage(range - 1);
                doc.startPage = range - 1
            }
            doc.y = doc.page.margins.top;
        }
    }

}

// Supporting function for rowConfCols & table
function getXforCol(_width, _cols, index) {
    var X = 0;
    const cols = _cols.length
    var total = 0;
    for (var i = 0; i < cols; i++) {
        total += _cols[i];
    }
    for (var i = 0; i < cols; i++) {
        if (i == index) return X
        X += (((_cols[i]) / (total)) * _width)
    }
    return X
}

module.exports = {
    rowConfCols,
    rowConfCols2,
    table,
    table2,
    tableConf,
    listText,
    setBottom,
    setSign,
    setHeader,
    setWaterMark,
    text
};