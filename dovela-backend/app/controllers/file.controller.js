const fs = require("fs");
const baseUrl = "http://localhost:3001/api/files/";

const getListFiles = (req, res) => {
  const directoryPath = __basedir + "/docs/";

  fs.readdir(directoryPath, function (err, files) {
    if (err) {
      res.status(500).send({
        message: "Unable to scan files!",
      });
    }

    let fileInfos = [];

    files.forEach((file) => {
      fileInfos.push({
        name: file,
        url: baseUrl + file,
      });
    });

    res.status(200).send(fileInfos);
  });
};

const download = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir + "/docs/";

  res.download(directoryPath + fileName, fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    } else {
      console.log('DOWNLOAD REQUESTED, GIVEN: ', fileName)
    }
  });

};

const downloadPublish = (req, res) => {
  const fileName = req.params.name;
  const type = req.params.type;
  const directoryPath = __basedir + "/docs/publish/";

  res.download(directoryPath + type + '/' + fileName, fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    } else {
      console.log('DOWNLOAD FOR PUBLISH REQUESTED, GIVEN: ', fileName)
    }
  });

};

const downloadPqrs = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir + "/docs/pqrs/output/";

  res.download(directoryPath + fileName, fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    } else {
      console.log('DOWNLOAD FOR PQRS REQUESTED, GIVEN: ', fileName)
    }
  });

};

const downloadPqrsAttach = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir + "/docs/pqrs/input/";

  res.download(directoryPath + fileName, fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    } else {
      console.log('DOWNLOAD FOR PQRS ATTACH REQUESTED, GIVEN: ', fileName)
    }
  });

};

const downloadNomenAttach = (req, res) => {
  const year = req.params.year;
  const id = req.params.id;
  const fileName = req.params.name;
  const directoryPath = __basedir + "/docs/nomenclature/";

  res.download(directoryPath + year + '/' + id + '/' + fileName, fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err + "/" + year + "/" + id + "/" + fileName
      });
    } else {
      console.log('DOWNLOAD FOR NOMENCLATURE ATTACH REQUESTED, GIVEN: ', fileName)
    }
  });

};

const downloadSubmitAttach = (req, res) => {
  const year = req.params.year;
  const id = req.params.id;
  const fileName = req.params.name;
  const directoryPath = __basedir + "/docs/submit/";

  res.download(directoryPath + year + '/' + id + '/' + fileName, fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err + "/" + year + "/" + id + "/" + fileName
      });
    } else {
      console.log('DOWNLOAD FOR SUBMIT ATTACH REQUESTED, GIVEN: ', fileName)
    }
  });

};

const downloadPublic = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir + "/docs/public/";

  res.download(directoryPath + fileName, fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    } else {
      console.log('DOWNLOAD FOR PUBLIC DOC REQUESTED, GIVEN: ', fileName)
    }
  });

};

const downloadProcess = (req, res) => {
  const pathy = req.params.pathy + "/";
  const pathn = req.params.pathn + "/";
  const fileName = req.params.name;
  const directoryPath = __basedir + "/docs/process/";

  res.download(directoryPath + pathy + pathn + fileName, fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    } else {
      console.log('DOWNLOAD FOR PUBLIC DOC REQUESTED, GIVEN: ', fileName)
    }
  });

};

const donwloadFunConfirmationPDF = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir;
  res.download(directoryPath + "/docs/public/output_funconfirm.pdf", fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    } else {
      console.log('DOWNLOAD FOR FUN CONFIRMATION REQUESTED, GIVEN: ', fileName)
    }
  });

};

const donwloadFunIncompletePDF = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir;
  res.download(directoryPath + "/docs/public/output_funconfirminc.pdf", fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    } else {
      console.log('DOWNLOAD FOR FUN INCOMPLETE REQUESTED, GIVEN: ', fileName)
    }
  });

};

const donwloadFunActPDF = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir;
  res.download(directoryPath + "/docs/public/output_funconfirmact.pdf", fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    } else {
      console.log('DOWNLOAD FOR REVOEW LETTER REQUESTED, GIVEN: ', fileName)
    }
  });

};

const donwloadFunActPDF_2 = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir;
  res.download(directoryPath + "/docs/public/output_funconfirmact_2.pdf", fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    } else {
      console.log('DOWNLOAD EXTENSION OF TERMS, GIVEN: ', fileName)
    }
  });

};

const donwloadFunConfirmatioNeighbournPDF = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir;
  res.download(directoryPath + "/docs/public/output_nconfirm.pdf", fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    } else {
      console.log('DOWNLOAD FOR FUN CONFIRMATION REQUESTED, GIVEN: ', fileName)
    }
  });

};

const donwloadPlaningnPDF = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir;
  res.download(directoryPath + "/docs/public/output_planing.pdf", fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    } else {
      console.log('DOWNLOAD FOR PLANING PDF GEN, GIVEN: ', fileName)
    }
  });

};

const donwloadSignPDF = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir;
  res.download(directoryPath + "/docs/public/output_sign.pdf", fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    } else {
      console.log('DOWNLOAD FOR SIGN PDF GEN, GIVEN: ', fileName)
    }
  });

};

const donwloadControlCheckPDF = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir;
  res.download(directoryPath + "/docs/public/output_control_check.pdf", fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    } else {
      console.log('DOWNLOAD FOR CONTROL CHECK PDF GEN, GIVEN: ', fileName)
    }
  });

};

const donwloadControlCheckPDF2 = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir;
  res.download(directoryPath + "/docs/public/output_control_check_2.pdf", fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    } else {
      console.log('DOWNLOAD FOR CONTROL CHECK PDF GEN, GIVEN: ', fileName)
    }
  });

};

const donwloadStickerArchivePDF = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir;
  res.download(directoryPath + "/docs/public/output_sticker_archive.pdf", fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    } else {
      console.log('DOWNLOAD FOR STICKER ARCHIVE PDF GEN, GIVEN: ', fileName)
    }
  });

};

const donwloadNomenclaturePDF = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir;
  res.download(directoryPath + "/docs/public/output_nomenclature.pdf", fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    } else {
      console.log('DOWNLOAD FOR NOMENCLATURE PDF GEN, GIVEN: ', fileName)
    }
  });

};

const donwloadSubmitPDF = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir;
  res.download(directoryPath + "/docs/public/output_submit.pdf", fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    } else {
      console.log('DOWNLOAD FOR SUBMIT PDF GEN, GIVEN: ', fileName)
    }
  });

};

const donwloadExpDoc1 = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir;
  res.download(directoryPath + "/docs/public/expdoc1.pdf", fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    } else {
      console.log('DOWNLOAD FOR EXP DOC 1 PDF GEN, GIVEN: ', fileName)
    }
  });

};

const donwloadExpDoc2 = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir;
  res.download(directoryPath + "/docs/public/expdoc2.pdf", fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    } else {
      console.log('DOWNLOAD FOR EXP DOC 2 PDF GEN, GIVEN: ', fileName)
    }
  });

};

const donwloadExpDoc3 = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir;
  res.download(directoryPath + "/docs/public/expdoc3.pdf", fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    } else {
      console.log('DOWNLOAD FOR EXP DOC 3 PDF GEN, GIVEN: ', fileName)
    }
  });

};

const donwloadExpDoc4 = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir;
  res.download(directoryPath + "/docs/public/expdoc4.pdf", fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    } else {
      console.log('DOWNLOAD FOR EXP DOC 4 PDF GEN, GIVEN: ', fileName)
    }
  });

};

const donwloadExpDoc5 = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir;
  res.download(directoryPath + "/docs/public/expdoc5.pdf", fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    } else {
      console.log('DOWNLOAD FOR EXP DOC 5 PDF GEN, GIVEN: ', fileName)
    }
  });

};

const donwloadExpDoc6 = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir;
  res.download(directoryPath + "/docs/public/expdoc6.pdf", fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    } else {
      console.log('DOWNLOAD FOR EXP DOC 6 PDF GEN, GIVEN: ', fileName)
    }
  });

};

const donwloadExpDoc7 = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir;
  res.download(directoryPath + "/docs/public/expdoc7.pdf", fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    } else {
      console.log('DOWNLOAD FOR EXP DOC 7 PDF GEN, GIVEN: ', fileName)
    }
  });

};

const donwloadExpDocRes = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir;
  res.download(directoryPath + "/docs/public/expdocres.pdf", fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    } else {
      console.log('DOWNLOAD FOR EXP DOC RES PDF GEN, GIVEN: ', fileName)
    }
  });

};

const donwloadExpDocEje = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir;
  res.download(directoryPath + "/docs/public/expdoceje.pdf", fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    } else {
      console.log('DOWNLOAD FOR EXP DOC EJE PDF GEN, GIVEN: ', fileName)
    }
  });

};

const donwloadExpDocResAbd = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir;
  res.download(directoryPath + "/docs/public/res_addiate.pdf", fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    } else {
      console.log('DOWNLOAD FOR EXP DOC RES ABD PDF GEN, GIVEN: ', fileName)
    }
  });

};

const donwloadExpDocFinalNot = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir;
  res.download(directoryPath + "/docs/public/exp_final_not.pdf", fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    } else {
      console.log('DOWNLOAD FOR EXP FINAL NOT PDF GEN, GIVEN: ', fileName)
    }
  });

};

const donwloadCertificate = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir;
  res.download(directoryPath + "/docs/public/certificate.pdf", fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    } else {
      console.log('DOWNLOAD FOR EXP DOC 5 PDF GEN, GIVEN: ', fileName)
    }
  });

};

const donwloadCertificateData = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir;
  res.download(directoryPath + "/docs/public/prof_history.pdf", fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    } else {
      console.log('DOWNLOAD FOR EXP DOC 5 PDF GEN, GIVEN: ', fileName)
    }
  });

};

const donwloadCertFun = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir;
  res.download(directoryPath + "/docs/public/cert_fun.pdf", fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    } else {
      console.log('DOWNLOAD FOR FUN CERTIFICATION, GIVEN: ', fileName)
    }
  });

};

const pdfFunForm = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir;
  res.download(directoryPath + "/docs/public/formulario_unico_nacional_form.pdf", fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    } else {
      console.log('DOWNLOAD FOR FUN CONFIRMATION REQUESTED, GIVEN: ', fileName)
    }
  });

};

const funform2pg = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir;
  res.download(directoryPath + "/docs/public/formulario_unico_nacional_2pg_form.pdf", 'fun_2pg', (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    } else {
      console.log('DOWNLOAD FOR FUN CONFIRMATION REQUESTED, GIVEN: ', fileName)
    }
  });

};

const funflat = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir;
  res.download(directoryPath + "/docs/public/formulario_unico_nacional.pdf", 'fun_form_flat', (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    } else {
      console.log('DOWNLOAD FOR FUN CONFIRMATION REQUESTED, GIVEN: ', fileName)
    }
  });

};

const funflat2022 = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir;
  res.download(directoryPath + "/docs/public/Formulario único nacional_2022.pdf", 'fun_form_flat', (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    } else {
      console.log('DOWNLOAD FOR FUN CONFIRMATION REQUESTED, GIVEN: ', fileName)
    }
  });

};

const funform2pgflat = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir;
  res.download(directoryPath + "/docs/public/formulario_unico_nacional_pg2.pdf", 'fun_2pg', (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    } else {
      console.log('DOWNLOAD FOR FUN CONFIRMATION REQUESTED, GIVEN: ', fileName)
    }
  });

};

const funcheckflat = (req, res) => {
  const directoryPath = __basedir;
  res.download(directoryPath + "/docs/public/formulario_unico_nacional_check.pdf", 'fun_check', (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    } else {
      console.log('DOWNLOAD FOR FUN CONFIRMATION REQUESTED, GIVEN: ')
    }
  });

};

const funcheckflat2022 = (req, res) => {
  const directoryPath = __basedir;
  res.download(directoryPath + "/docs/public/formulario_unico_nacional_check_2022.pdf", 'fun_check', (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    } else {
      console.log('DOWNLOAD FOR FUN CONFIRMATION REQUESTED, GIVEN: ')
    }
  });

};


const recordlawextra = (req, res) => {
  const directoryPath = __basedir;
  res.download(directoryPath + "/docs/public/check_law.pdf", 'check_law', (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    } else {
      console.log('DOWNLOAD FOR RECORD LAW REPORT PDF CHECK, GIVEN: check_law')
    }
  });

};

const recordlawextra2022 = (req, res) => {
  const directoryPath = __basedir;
  res.download(directoryPath + "/docs/public/check_law_2022.pdf", 'check_law', (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    } else {
      console.log('DOWNLOAD FOR RECORD LAW REPORT PDF CHECK, GIVEN: check_law')
    }
  });

};

const recordengextra = (req, res) => {
  const directoryPath = __basedir;
  res.download(directoryPath + "/docs/public/check_eng.pdf", 'check_eng', (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    } else {
      console.log('DOWNLOAD FOR RECORD ENG REPORT PDF CHECK, GIVEN: check_eng')
    }
  });

};

const recordengextra2022 = (req, res) => {
  const directoryPath = __basedir;
  res.download(directoryPath + "/docs/public/check_eng_2022.pdf", 'check_eng', (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    } else {
      console.log('DOWNLOAD FOR RECORD ENG REPORT PDF CHECK, GIVEN: check_eng')
    }
  });

};

const recordarcextra = (req, res) => {
  const directoryPath = __basedir;
  res.download(directoryPath + "/docs/public/check_arc.pdf", 'check_arc', (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    } else {
      console.log('DOWNLOAD FOR RECORD ARC REPORT PDF CHECK, GIVEN: check_arc')
    }
  });
};

const recordarcextra2022 = (req, res) => {
  const directoryPath = __basedir;
  res.download(directoryPath + "/docs/public/check_arc_2022.pdf", 'check_arc', (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    } else {
      console.log('DOWNLOAD FOR RECORD ARC REPORT PDF CHECK, GIVEN: check_arc')
    }
  });

};


const recordlaw = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir;
  res.download(directoryPath + "/docs/public/output_recorwd_law_blank.pdf", fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    } else {
      console.log('DOWNLOAD FOR RECORD LAW REPORT, GIVEN: ', fileName)
    }
  });

};

const recordeng = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir;
  res.download(directoryPath + "/docs/public/output_recorwd_eng.pdf", fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    } else {
      console.log('DOWNLOAD FOR RECORD ENG REPORT, GIVEN: ', fileName)
    }
  });

};

const recordarc = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir;
  res.download(directoryPath + "/docs/public/output_recorwd_arc.pdf", fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    } else {
      console.log('DOWNLOAD FOR RECORD ARC REPORT, GIVEN: ', fileName)
    }
  });

};

const recordrew = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir;
  res.download(directoryPath + "/docs/public/output_recorwd_rew.pdf", fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    } else {
      console.log('DOWNLOAD FOR RECORD REW REPORT, GIVEN: ', fileName)
    }
  });

};

const recordph = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir;
  res.download(directoryPath + "/docs/public/output_record_ph.pdf", fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    } else {
      console.log('DOWNLOAD FOR RECORD PH RECORD, GIVEN: ', fileName)
    }
  });

};

const recordphnot = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir;
  res.download(directoryPath + "/docs/public/ph_not.pdf", fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    } else {
      console.log('DOWNLOAD FOR RECORD PH NOT, GIVEN: ', fileName)
    }
  });

};

const donwloadNorm = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir;
  res.download(directoryPath + "/docs/public/output_norm.pdf", fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    } else {
      console.log('DOWNLOAD FOR FUN NORM, GIVEN: ', fileName)
    }
  });

};


module.exports = {
  getListFiles,
  download,
  downloadPublish,
  downloadPqrs,
  downloadPqrsAttach,
  downloadNomenAttach,
  downloadSubmitAttach,
  downloadPublic,
  downloadProcess,
  donwloadFunConfirmationPDF,
  donwloadFunIncompletePDF,
  donwloadFunActPDF,
  donwloadFunActPDF_2,
  donwloadFunConfirmatioNeighbournPDF,
  donwloadPlaningnPDF,
  donwloadSignPDF,
  donwloadControlCheckPDF,
  donwloadControlCheckPDF2,
  donwloadStickerArchivePDF,
  donwloadNomenclaturePDF,
  donwloadSubmitPDF,
  donwloadExpDoc1,
  donwloadExpDoc2,
  donwloadExpDoc3,
  donwloadExpDoc4,
  donwloadExpDoc5,
  donwloadExpDoc6,
  donwloadExpDoc7,
  donwloadExpDocRes,
  donwloadExpDocEje,
  donwloadExpDocResAbd,
  donwloadExpDocFinalNot,
  donwloadCertificate,
  donwloadCertificateData,
  donwloadCertFun,
  pdfFunForm,
  funform2pg,
  funflat,
  funflat2022,
  funform2pgflat,
  funcheckflat,
  funcheckflat2022,
  recordlaw,
  recordeng,
  recordarc,
  recordrew,
  recordph,
  recordphnot,
  recordlawextra,
  recordengextra,
  recordarcextra,
  recordlawextra2022,
  recordengextra2022,
  recordarcextra2022,
  donwloadNorm,
};
