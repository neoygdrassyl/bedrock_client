import dayjs from 'dayjs';

/**
 * Flattens the VR submits of an expediente (Submit rows with sub_lists) into one row per delivered
 * document: only the entries the reviewer marked 'SI' are kept.
 */
export function buildCuratedVrList(list) {
  const curated = [];
  (Array.isArray(list) ? list : []).forEach((submit) => {
    (Array.isArray(submit.sub_lists) ? submit.sub_lists : []).forEach((subList) => {
      const name = subList.list_name ? subList.list_name.split(';') : [];
      const category = subList.list_category ? subList.list_category.split(',') : [];
      const code = subList.list_code ? subList.list_code.split(',') : [];
      const page = subList.list_pages ? subList.list_pages.split(',') : [];
      const review = subList.list_review ? subList.list_review.split(',') : [];
      review.forEach((value, k) => {
        if (value === 'SI') {
          curated.push({ id_public: submit.id_public, date: submit.date, time: submit.time, name: name[k], category: category[k], page: page[k], code: code[k] });
        }
      });
    });
  });
  return curated;
}

/**
 * Legacy path of the "last VR": latest delivery (after `startDate`) of any document the FUN R
 * review marked as required (checked '1' delivered or '0' missing).
 */
export function legacyLastVr(curatedList, funR, startDate) {
  const checks = funR?.checked ? funR.checked.split(',') : [];
  const codes = funR?.code ? funR.code.split(',') : [];
  const required = codes.filter((code, i) => checks[i] === '1' || checks[i] === '0');
  let date = startDate;
  let vr = '';
  curatedList.forEach((row) => {
    if (required.includes(row.code) && dayjs(row.date).isAfter(date)) {
      date = row.date;
      vr = row.id_public;
    }
  });
  return { date, vr };
}
