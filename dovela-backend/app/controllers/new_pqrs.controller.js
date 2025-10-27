const { where } = require("sequelize");
const db = require("../models");
const { Op } = require("sequelize");
const PQRS_New_Clasification = db.new_pqrs_clasification;
const PQRS_New_Control = db.new_pqrs_control;
const PQRS_New_Master = db.new_pqrs_master;
const PQRS_New_Translation = db.new_pqrs_translation;
const PQRS_New_Petitioners = db.new_pqrs_petitioners;
const PQRS_New_Evaluation = db.new_pqrs_evaluation;
const PQRS_New_Responses = db.new_pqrs_responses;
const PQRS_New_Times = db.new_pqrs_times;


const getData = (req) => {
  const {
    //master data
    id_public,
    status,
    desc,
    petition,
    creation_date,
    canalIngreso,
    worker_creator,
    // ---
    // petitioners data
    petitioners,
    //clasifications data
    petition_type,
    modality,
    aforegoing,
    id_related,
    //control data
    controlData,
    //evaluation data
    formal0,
    formal1,
    formal2,
    formal3,
    formal4,
    formal5,
    competence0,
    competence1,
    competence2,
    otherEntities,
    //translations data
    transfers,
    //times
    times
  } = req.body;

  // Master data
  const master_data = {
    id_public: id_public || null,
    status: status || "pending",
    creation_date: creation_date || null,
    desc: desc || "",
    canalIngreso: canalIngreso || "Desconocido",
    petition: petition || "",
    worker_creator: worker_creator || null,
  };

  // Classification data
  const clasification_data = {
    petition_type: petition_type || null,
    modality: modality || null,
    aforegoing: aforegoing || null,
    id_related: id_related || null,
  };

  // Control data
  // const control_data = {
  //   activity: activity || null,
  //   responsable: responsable || null,
  //   init_time: init_time || null,
  //   time_1: time_1 || null,
  //   final_time: final_time || null,
  // };

  // Translation data
  // const translation_data = {
  //   entity: entity || null,
  //   officer: officer || null,
  //   charge: charge || null,
  //   email: email_translate || null,
  //   reason: reason || null,
  // };

  // Petitioners data

  // const petitioners_data = {
  //   name: name || "Anonymous",
  //   document_type: document_type || null,
  //   document_number: document_number || null,
  //   phone: phone || null,
  //   email: email || null,
  //   address: address || null,
  //   legally_identified: legally_identified || false,
  //   anonymous: anonymous || false,
  // };

  // Evaluation data
  const evaluation_data = {
    formal0: formal0 || false,
    formal1: formal1 || false,
    formal2: formal2 || false,
    formal3: formal3 || false,
    formal4: formal4 || false,
    formal5: formal5 || false,
    competence0: competence0 || false,
    competence1: competence1 || false,
    competence2: competence2 || false,
    otherEntities: otherEntities || false,
  };
  const responses_json = JSON.parse(req.body.responses || '{}');
  const responses_data = {
    response_curator: responses_json.response_curator || "",
    response_legal: responses_json.response_legal || "",
    response_arquitecture: responses_json.response_arquitecture || "",
    response_structure: responses_json.response_structure || "",
    response_archive: responses_json.response_archive || ""
  }

  return {
    master_data,
    clasification_data,
    controlData,
    petitioners,
    evaluation_data,
    responses_data,
    transfers,
    times
  };
};

exports.createPQRS = async (req, res) => {
  try {
    //extract the data 
    const {
      master_data,
      clasification_data,
      controlData,
      transfers,
      petitioners,
      evaluation_data,
      responses_data,
      times
    } = getData(req);
    // Create Master Record
    const master = await PQRS_New_Master.create(master_data);
    const id_master = master.id;

    // Create Petitioners
    const parsedPetitionersData = JSON.parse(petitioners);
    let petitioners_data = parsedPetitionersData.map((petitioner) => ({
      ...petitioner,
      newPqrsMasterId: id_master,
    }));
    await PQRS_New_Petitioners.bulkCreate(petitioners_data);

    // Create Control
    const parsedControlData = JSON.parse(controlData);
    let control_data = parsedControlData.map((control) => ({
      ...control,
      newPqrsMasterId: id_master,
    }));
    await PQRS_New_Control.bulkCreate(control_data);

    // Create Evaluation
    evaluation_data.newPqrsMasterId = id_master;
    await PQRS_New_Evaluation.create(evaluation_data);

    // Create Classification
    clasification_data.newPqrsMasterId = id_master;
    await PQRS_New_Clasification.create(clasification_data);
    //Create times
    const parsedTimesData = JSON.parse(times);
    let times_data = parsedTimesData.map((time) => ({
      ...time,
      newPqrsMasterId: id_master,
    }));
    await PQRS_New_Times.bulkCreate(times_data);
    // Create Translation
    const parsedTransfers = JSON.parse(transfers);
    let transfers_data = parsedTransfers.map((transfer) => ({
      ...transfer,
      newPqrsMasterId: id_master,
    }));
    await PQRS_New_Translation.bulkCreate(transfers_data);

    //Create response
    responses_data.newPqrsMasterId = id_master;
    await PQRS_New_Responses.create(responses_data)
      .then(() => {
        res.send('OK');
      })
  }
  catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
}

exports.getAllPQRS = async (req, res) => {
  try {
    const pqrs = await PQRS_New_Master.findAll({
      include: [
        PQRS_New_Clasification,
        PQRS_New_Control,
        PQRS_New_Evaluation,
        PQRS_New_Petitioners,
        PQRS_New_Translation,
        PQRS_New_Responses,
        PQRS_New_Times
      ]
    });
    if (!pqrs) return res.status(404).send('PQRS not found');
    res.send(pqrs)
  }
  catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
}
exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    const pqr = await PQRS_New_Master.findByPk(id, {
      include: [
        PQRS_New_Clasification,
        PQRS_New_Control,
        PQRS_New_Evaluation,
        PQRS_New_Petitioners,
        PQRS_New_Translation,
        PQRS_New_Responses,
        PQRS_New_Times
      ],
    })
    if (!pqr) return res.status(404).send('PQRS not found');
    res.send(pqr);

  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
}
exports.updatePQRS = async (req, res) => {
  try {
    const id = req.params.id;
    const {
      master_data,
      clasification_data,
      controlData,
      petitioners,
      transfers,
      times,
      evaluation_data,
      responses_data
    } = getData(req);

    // check if the id exists
    const pqrs = await PQRS_New_Master.findByPk(id);
    if (!pqrs) return res.status(404).send('PQRS not found');

    const parsedPetitionersData = petitioners ? JSON.parse(petitioners) : [];
    const parsedControlData = controlData ? JSON.parse(controlData) : [];
    const parsedTimesData = times ? JSON.parse(times) : [];
    const parsedTransfers = transfers ? JSON.parse(transfers) : [];
    //first delete the possible records deleted from petitioners || transfers
    await deletePQRSRecords(PQRS_New_Petitioners,parsedPetitionersData,id)
    await deletePQRSRecords(PQRS_New_Translation,parsedTransfers,id)
    
    await Promise.all([
      // Update Master Record
      PQRS_New_Master.update(master_data, { where: { id } }),

      PQRS_New_Petitioners.bulkCreate(parsedPetitionersData.map(({ createdAt, updatedAt, ...petitioner }) => ({
        ...petitioner,
        newPqrsMasterId: id
      })), { updateOnDuplicate: Object.keys(PQRS_New_Petitioners.rawAttributes).filter(attr => attr !== 'createdAt') }),

      PQRS_New_Control.bulkCreate(parsedControlData.map(({ createdAt, updatedAt, ...control }) => ({
        ...control,
        newPqrsMasterId: id
      })), { updateOnDuplicate: Object.keys(PQRS_New_Control.rawAttributes).filter(attr => attr !== 'createdAt') }),

      PQRS_New_Times.bulkCreate(parsedTimesData.map(({ createdAt, updatedAt, ...time }) => ({
        ...time,
        newPqrsMasterId: id
      })), { updateOnDuplicate: Object.keys(PQRS_New_Times.rawAttributes).filter((attr => attr !== 'createdAt')) }),

      PQRS_New_Translation.bulkCreate(parsedTransfers.map(({ createdAt, updatedAt, ...transfer }) => ({
        ...transfer,
        newPqrsMasterId: id
      })), { updateOnDuplicate: Object.keys(PQRS_New_Translation.rawAttributes).filter(attr => attr !== 'createdAt') }),

      PQRS_New_Evaluation.update(evaluation_data, { where: { newPqrsMasterId: id } }),
      PQRS_New_Clasification.update(clasification_data, { where: { newPqrsMasterId: id } }),
      // PQRS_New_Responses.update({ ...responses_data, newPqrsMasterId: id })
    ]);


    res.send('PQRS updated successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

const deletePQRSRecords = async(table,data ,id) => {
  await table.destroy({
    where: {
      newPqrsMasterId: id,  // Only for this specific master ID
      id: { [Op.notIn]: data.map(p => p.id).filter(Boolean) } // Deletes only missing ones
    }
  });
  
}
exports.createResponse = async (req, res) => {
  try {
    const id = req.params.id;
    const { response_name, data } = req.body
    const response_to_update = {
      [response_name]: data
    }
    await PQRS_New_Responses.update(response_to_update, { where: { newPqrsMasterId: id } })
    res.send('Response created successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};
// exports.closePQRS = async (req, res) => {
//   try {
//    TODO
//   }
//   catch (error) {
//     console.error(error);
//     res.status(500).send('Server Error');
//   }
// };

