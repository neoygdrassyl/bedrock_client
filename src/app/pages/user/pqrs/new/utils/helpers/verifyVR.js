import moment from "moment";
import SubmitService from "../../../../../../services/submit.service";

export const _GET_LAST_ID = (setFormData) => {
    SubmitService.getlastid()
        .then(response => {
            let new_id = "";
            if (response.data.length) {
                new_id = response.data[0].vr;
                if (new_id) {
                    let consecutive = new_id.split('-')[1];
                    consecutive = Number(consecutive) + 1;
                    if (consecutive < 1000) consecutive = "0" + consecutive;
                    if (consecutive < 100) consecutive = "0" + consecutive;
                    if (consecutive < 10) consecutive = "0" + consecutive;
                    new_id = new_id.split('-')[0] + "-" + consecutive;
                } else {
                    new_id = "VR" + moment().format('YY') + "-0001";
                }
            } else {
                new_id = "VR" + moment().format('YY') + "-0001";
            }
            
            // update formData
            setFormData(prev => ({ ...prev, id_public: new_id }));
        })
        .catch(e => {
            console.log(e);
        });
};
