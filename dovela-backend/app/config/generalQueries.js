const curaduriaInfo = require('../config/curaduria.json')

module.exports.validateLastCUBQuery = (new_CUB, prev_CUB) => {
    var query = `
  SELECT (max_cub) AS cub FROM (
    
    SELECT (fun_laws.report_cub) AS max_cub
    FROM fun_laws
    WHERE fun_laws.report_cub LIKE  '${new_CUB}'
    AND fun_laws.report_cub NOT LIKE  '${prev_CUB}'
    AND fun_laws.report_cub IS NOT NULL
        
    UNION
  
    SELECT (pqrs_masters.id_reply) 
    FROM pqrs_masters 
    WHERE pqrs_masters.id_reply LIKE  '${new_CUB}'
    AND pqrs_masters.id_reply NOT LIKE  '${prev_CUB}'
    AND pqrs_masters.id_reply IS NOT NULL

    UNION
  
    SELECT (pqrs_masters.id_confirm) 
    FROM pqrs_masters 
    WHERE pqrs_masters.id_confirm LIKE  '${new_CUB}'
    AND pqrs_masters.id_confirm NOT LIKE  '${prev_CUB}'
    AND pqrs_masters.id_confirm IS NOT NULL
  
    UNION
  
    SELECT (fun_3s.id_cub)
    FROM fun_3s
    WHERE fun_3s.id_cub LIKE  '${new_CUB}'
    AND fun_3s.id_cub NOT LIKE  '${prev_CUB}'
    AND fun_3s.id_cub IS NOT NULL
  
    UNION
  
    SELECT (expeditions.cub1) 
    FROM expeditions 
    WHERE expeditions.cub1 LIKE  '${new_CUB}'
    AND expeditions.cub1 NOT LIKE  '${prev_CUB}'
    AND expeditions.cub1 IS NOT NULL

    UNION
  
    SELECT (expeditions.cub2) 
    FROM expeditions 
    WHERE expeditions.cub2 LIKE  '${new_CUB}'
    AND expeditions.cub2 NOT LIKE  '${prev_CUB}'
    AND expeditions.cub2 IS NOT NULL

    UNION
  
    SELECT (expeditions.cub3) 
    FROM expeditions 
    WHERE expeditions.cub3 LIKE  '${new_CUB}'
    AND expeditions.cub3 NOT LIKE  '${prev_CUB}'
    AND expeditions.cub3 IS NOT NULL

    UNION

    SELECT (fun_laws.cub_inc) AS max_cub
    FROM fun_laws
    WHERE fun_laws.cub_inc LIKE  '${new_CUB}'
    AND fun_laws.cub_inc NOT LIKE  '${prev_CUB}'
    AND fun_laws.cub_inc IS NOT NULL

    UNION

    SELECT (fun_laws.cub_ldf) AS max_cub
    FROM fun_laws
    WHERE fun_laws.cub_ldf LIKE  '${new_CUB}'
    AND fun_laws.cub_ldf NOT LIKE  '${prev_CUB}'
    AND fun_laws.cub_ldf IS NOT NULL

    UNION

    SELECT (fun_laws.cub_act) AS max_cub
    FROM fun_laws
    WHERE fun_laws.cub_act LIKE  '${new_CUB}'
    AND fun_laws.cub_act NOT LIKE  '${prev_CUB}'
    AND fun_laws.cub_act IS NOT NULL

    UNION

    SELECT (fun_laws.cub_act2) AS max_cub
    FROM fun_laws
    WHERE fun_laws.cub_act2 LIKE  '${new_CUB}'
    AND fun_laws.cub_act2 NOT LIKE  '${prev_CUB}'
    AND fun_laws.cub_act2 IS NOT NULL

    UNION

    SELECT (record_phs.cub) AS max_cub
    FROM record_phs
    WHERE record_phs.cub LIKE  '${new_CUB}'
    AND record_phs.cub NOT LIKE  '${prev_CUB}'
    AND record_phs.cub IS NOT NULL

    UNION

    SELECT (record_reviews.id_public) AS max_cub
    FROM record_reviews
    WHERE record_reviews.id_public LIKE  '${new_CUB}'
    AND record_reviews.id_public NOT LIKE  '${prev_CUB}'
    AND record_reviews.id_public IS NOT NULL
    
    ) AS max_cub
  `;

    return query;
}
//validate between this querys and update getLastCUBQuery in order to just search if a CUB exists
module.exports.getLastCubXvrQuery = `
SELECT MAX(cub) AS last_cub
FROM CubXVrs
WHERE cub LIKE '${curaduriaInfo.serials.end}%'
`;


module.exports.getLastCUBQuery =
    `    SELECT MAX(max_cub) AS cub FROM (
    SELECT (CubXVrs.cub) as max_cub
        FROM CubXVrs
        WHERE CubXVrs.cub LIKE '${curaduriaInfo.serials.end}%'
        AND CubXVrs.cub IS NOT NULL
        UNION
    
        SELECT (fun_laws.report_cub) AS max_cub
        FROM fun_laws
        WHERE fun_laws.report_cub LIKE  '${curaduriaInfo.serials.end}%'
        AND fun_laws.report_cub IS NOT NULL
            
        UNION
    
        SELECT (pqrs_masters.id_reply) 
        FROM pqrs_masters 
        WHERE pqrs_masters.id_reply LIKE  '${curaduriaInfo.serials.end}%'
        AND pqrs_masters.id_reply IS NOT NULL
    
        UNION
    
        SELECT (fun_3s.id_cub)
        FROM fun_3s
        WHERE fun_3s.id_cub LIKE  '${curaduriaInfo.serials.end}%'
        AND fun_3s.id_cub IS NOT NULL

        UNION
    
        SELECT (expeditions.cub1)
        FROM expeditions
        WHERE expeditions.cub1 LIKE  '${curaduriaInfo.serials.end}%'
        AND expeditions.cub1 IS NOT NULL

        UNION
    
        SELECT (expeditions.cub2)
        FROM expeditions
        WHERE expeditions.cub2 LIKE  '${curaduriaInfo.serials.end}%'
        AND expeditions.cub2 IS NOT NULL

        UNION
    
        SELECT (expeditions.cub3)
        FROM expeditions
        WHERE expeditions.cub3 LIKE  '${curaduriaInfo.serials.end}%'
        AND expeditions.cub3 IS NOT NULL

        UNION

        SELECT (fun_laws.cub_inc)
        FROM fun_laws
        WHERE fun_laws.cub_inc LIKE  '${curaduriaInfo.serials.end}%'
        AND fun_laws.cub_inc IS NOT NULL

        UNION

        SELECT (fun_laws.cub_ldf)
        FROM fun_laws
        WHERE fun_laws.cub_ldf LIKE  '${curaduriaInfo.serials.end}%'
        AND fun_laws.cub_ldf IS NOT NULL

        UNION

        SELECT (fun_laws.cub_act)
        FROM fun_laws
        WHERE fun_laws.cub_act LIKE  '${curaduriaInfo.serials.end}%'
        AND fun_laws.cub_act IS NOT NULL

        UNION

        SELECT (fun_laws.cub_act2)
        FROM fun_laws
        WHERE fun_laws.cub_act2 LIKE  '${curaduriaInfo.serials.end}%'
        AND fun_laws.cub_act2 IS NOT NULL

        UNION

        SELECT (record_reviews.id_public)
        FROM record_reviews
        WHERE record_reviews.id_public LIKE  '${curaduriaInfo.serials.end}%'
        AND record_reviews.id_public IS NOT NULL
        
        ) AS max_cub;
         `;

module.exports.validateLastPublicRes = (new_Id, prev_Id) => {
    var query = `
  SELECT (expeditions.id_public) AS max_id
  FROM expeditions
  WHERE expeditions.id_public LIKE  '${new_Id}'
  AND expeditions.id_public NOT LIKE  '${prev_Id}'
  AND expeditions.id_public IS NOT NULL
    `;

    return query;
}


module.exports.PQRSxFUN = (fun0PublicId) => {
    var query = `
    SELECT pqrs_funs.person, pqrs_funs.catastral, pqrs_masters.id_publico, 

    (
      SELECT GROUP_CONCAT(s.name SEPARATOR';') 
      FROM pqrs_solocitors s 
      WHERE s.pqrsMasterId = pqrs_masters.id
      
  ) AS "solicitors_names",
  
  
   (
      SELECT GROUP_CONCAT(s.type SEPARATOR';') 
      FROM pqrs_solocitors s 
      WHERE s.pqrsMasterId = pqrs_masters.id
      
  ) AS "solicitors_types",
  
   (
      SELECT GROUP_CONCAT(s.type_id SEPARATOR';') 
      FROM pqrs_solocitors s 
      WHERE s.pqrsMasterId = pqrs_masters.id
      
  ) AS "solicitors_types_id",
  
   (
      SELECT GROUP_CONCAT(s.id_number SEPARATOR';') 
      FROM pqrs_solocitors s 
      WHERE s.pqrsMasterId = pqrs_masters.id
      
  ) AS "solicitors_id_numers",
  
  
  (
      SELECT GROUP_CONCAT(d.notify SEPARATOR';') 
      FROM pqrs_contacts d 
      WHERE d.pqrsMasterId = pqrs_masters.id
      
  ) AS "contacts_notifies",
  
   (
      SELECT GROUP_CONCAT(d.email SEPARATOR';') 
      FROM pqrs_contacts d 
      WHERE d.pqrsMasterId = pqrs_masters.id
      
  ) AS "contacts_emails",
  
   (
      SELECT GROUP_CONCAT(d.address SEPARATOR';') 
      FROM pqrs_contacts d 
      WHERE d.pqrsMasterId = pqrs_masters.id
      
  ) AS "contacts_addresses",
  
   (
      SELECT GROUP_CONCAT(d.phone SEPARATOR';') 
      FROM pqrs_contacts d 
      WHERE d.pqrsMasterId = pqrs_masters.id
      
  ) AS "contacts_phones"
 

    FROM pqrs_funs
    
    INNER JOIN pqrs_masters ON pqrs_masters.id = pqrs_funs.pqrsMasterId
    LEFT JOIN pqrs_solocitors ON pqrs_solocitors.pqrsMasterId = pqrs_masters.id
    LEFT JOIN pqrs_contacts ON pqrs_contacts.pqrsMasterId = pqrs_masters.id

    WHERE pqrs_funs.id_public LIKE '${fun0PublicId}'
    
    GROUP BY pqrs_funs.id  
  `;

    return query;
}

module.exports.LOADFUN1 = (fun0PublicId) => {
    var query = `
   SELECT
    fun_0s.*,
    fun_2s.direccion, fun_2s.catastral, expeditions.id_public AS exp_id,

    (
        SELECT
            c_id.date_start
        FROM
            fun_clocks AS c_id
        LEFT JOIN fun_clocks AS c_id_map
        ON
            c_id_map.id = c_id.id
        WHERE
            c_id_map.fun0Id = fun_0s.id
            AND
            c_id_map.state = 5
           LIMIT 1
    ) AS 'clocks_start',
    
        (
        SELECT
            c_id.date_start
        FROM
            fun_clocks AS c_id
        LEFT JOIN fun_clocks AS c_id_map
        ON
            c_id_map.id = c_id.id
        WHERE
            c_id_map.fun0Id = fun_0s.id
            AND
            c_id_map.state = 99
           LIMIT 1
    ) AS 'clocks_end',

    (
    SELECT
        GROUP_CONCAT(fun_53s.id SEPARATOR ';')
    FROM
        fun_53s
    WHERE
        fun_53s.fun0Id = fun_0s.id
) AS 'fun_53s.id',
(
    SELECT
        GROUP_CONCAT(fun_53s.name SEPARATOR ';')
    FROM
        fun_53s
    WHERE
        fun_53s.fun0Id = fun_0s.id
) AS 'fun_53s.name',
(
    SELECT
        GROUP_CONCAT(fun_53s.surname SEPARATOR ';')
    FROM
        fun_53s
    WHERE
        fun_53s.fun0Id = fun_0s.id
) AS 'fun_53s.surname',
 (
    SELECT
        GROUP_CONCAT(fun_1s.id SEPARATOR ';')
    FROM
        fun_1s
    WHERE
        fun_1s.fun0Id = fun_0s.id
) AS 'fun_1s.id',
(
    SELECT
        GROUP_CONCAT(fun_1s.version SEPARATOR ';')
    FROM
        fun_1s
    WHERE
        fun_1s.fun0Id = fun_0s.id
) AS 'fun_1s.version',
(
    SELECT
        GROUP_CONCAT(fun_1s.tipo SEPARATOR ';')
    FROM
        fun_1s
    WHERE
        fun_1s.fun0Id = fun_0s.id
        AND
        fun_1s.version = fun_0s.version
) AS 'fun_1s.tipo',
(
    SELECT
        GROUP_CONCAT(fun_1s.tramite SEPARATOR ';')
    FROM
        fun_1s
    WHERE
        fun_1s.fun0Id = fun_0s.id
        AND
        fun_1s.version = fun_0s.version
) AS 'fun_1s.tramite',
(  SELECT
    GROUP_CONCAT(fun_1s.m_urb SEPARATOR ';')
FROM
    fun_1s
WHERE
    fun_1s.fun0Id = fun_0s.id
    AND
    fun_1s.version = fun_0s.version
) AS 'fun_1s.m_urb',

(  SELECT
    GROUP_CONCAT(fun_1s.m_sub SEPARATOR ';')
FROM
    fun_1s
WHERE
    fun_1s.fun0Id = fun_0s.id
    AND
    fun_1s.version = fun_0s.version
) AS 'fun_1s.m_sub',

(  SELECT
    GROUP_CONCAT(fun_1s.m_lic SEPARATOR ';')
FROM
    fun_1s
WHERE
    fun_1s.fun0Id = fun_0s.id
    AND
    fun_1s.version = fun_0s.version
) AS 'fun_1s.m_lic'

FROM
fun_0s
LEFT JOIN fun_2s ON fun_2s.fun0Id = fun_0s.id
LEFT JOIN expeditions ON expeditions.fun0Id = fun_0s.id
WHERE
    fun_0s.id_public LIKE '%${fun0PublicId}%' 

    ORDER BY fun_0s.id_public  DESC

    LIMIT 20
  `;

    return query;
}

module.exports.getLastVRQuery =
    `
    SELECT MAX(vr) AS vr FROM (
    
        SELECT (submits.id_public) AS vr
        FROM submits
        WHERE submits.id_public LIKE  'VR%'
        AND submits.id_public IS NOT NULL
            
        UNION
    
        SELECT (fun_0s.id_public) 
        FROM fun_0s 
        WHERE fun_0s.id_public LIKE  'VR%'
        AND fun_0s.id_public IS NOT NULL
    
       
        ) AS vr
  `;
module.exports.validateLastVR = (new_Id, prev_Id) => {
    var query = `
    SELECT (vr) AS vr FROM (
    
        SELECT (submits.id_public) AS vr
        FROM submits
        WHERE submits.id_public LIKE  '${new_Id}'
        AND submits.id_public NOT LIKE  '${prev_Id}'
        AND submits.id_public IS NOT NULL
            
        
        ) AS vr
    `;

    return query;
}

module.exports.validateNewVR = (new_Id) => {
    var query = `
    SELECT (vr) AS vr FROM (
    
        SELECT (submits.id_public) AS vr
        FROM submits
        WHERE submits.id_public LIKE  '${new_Id}'
        AND submits.id_public IS NOT NULL
            
       
        ) AS vr
    `;

    return query;
}
module.exports.validateCopyVR = (new_Id) => {
    var query = `
   
    SELECT (vr) AS vr FROM (
    
        SELECT (fun_0s.id_public) AS vr
        FROM fun_0s
        WHERE fun_0s.id_public LIKE   '${new_Id}'
        AND fun_0s.id_public IS NOT NULL
    
    UNION

        SELECT(pqrs_masters.id_publico)
        FROM pqrs_masters 
        WHERE pqrs_masters.id_publico LIKE  '${new_Id}'
         AND pqrs_masters.id_publico IS NOT NULL

         UNION

         SELECT(pqrs_masters.id_global)
         FROM pqrs_masters 
         WHERE pqrs_masters.id_global LIKE  '${new_Id}'
          AND pqrs_masters.id_global IS NOT NULL
    
       
        ) AS vr
    `;

    return query;
}
// module.exports.getSolicitorsID = (new_Id) => {
//     var query = `

//     SELECT (vr) AS vr FROM (

//         SELECT (fun_0s.id_public) AS vr
//         FROM fun_0s
//         WHERE fun_0s.id_public LIKE   '${new_Id}'
//         AND fun_0s.id_public IS NOT NULL

//     UNION

//         SELECT(pqrs_masters.id_publico)
//         FROM pqrs_masters 
//         WHERE pqrs_masters.id_publico LIKE  '${new_Id}'
//          AND pqrs_masters.id_publico IS NOT NULL

//          UNION

//          SELECT(pqrs_masters.id_global)
//          FROM pqrs_masters 
//          WHERE pqrs_masters.id_global LIKE  '${new_Id}'
//           AND pqrs_masters.id_global IS NOT NULL


//         ) AS vr
//     `;

//     return query;
// }


module.exports.getLastOAQuery =
    `
    SELECT MAX(id) AS id FROM (
    
        SELECT MAX(fun_0s.id_public) AS id
        FROM fun_0s 
        WHERE fun_0s.id_public LIKE 'OA%'
            
        UNION
    
        SELECT MAX(record_phs.id_public)
        FROM record_phs 
        WHERE record_phs.id_public LIKE 'OA%'
    
       
        ) AS vr
  `;
module.exports.validateLastOA = (new_Id, prev_Id) => {
    var query = `
    SELECT (vr) AS vr FROM (
    
        SELECT (record_phs.id_public) AS vr
        FROM record_phs
        WHERE record_phs.id_public LIKE  '${new_Id}'
        AND record_phs.id_public NOT LIKE  '${prev_Id}'
        AND record_phs.id_public IS NOT NULL
            
        UNION
      
        SELECT (fun_0s.id_public) 
        FROM fun_0s 
        WHERE fun_0s.id_public LIKE  '${new_Id}'
        AND fun_0s.id_public NOT LIKE  '${prev_Id}'
        AND fun_0s.id_public IS NOT NULL
        ) AS vr
    `;

    return query;
}


module.exports.reportsQuery = (date_start, date_end, min_state = 50, max_state = 200) => {
    var query = `
    SELECT
    fun_0s.id,
    fun_0s.state,
    fun_0s.date AS pay_date,
    fun_0s.id_payment AS pay_id,
    fun_0s.id,
    record_phs.id_public AS id_public_ph,
    record_phs.date_arc_review AS clock_license_ph,
    fun_0s.id_public,
    fun_1s.tramite,
    fun_1s.tipo,
    fun_1s.m_urb,
    fun_1s.m_sub,
    fun_1s.m_lic,
    fun_1s.usos,
    fun_1s.vivienda,
    fun_1s.regla_1,
    fun_1s.regla_2,
    fun_1s.anex2,
    fun_1s.description,
    fun_1s.cultural,
    fun_2s.suelo,
    fun_2s.matricula,
    fun_2s.catastral,
    fun_2s.catastral_2,
    fun_2s.direccion,
    fun_2s.barrio,
    fun_2s.comuna,
    fun_2s.vereda,
    fun_2s.comuna,
    fun_2s.sector,
    fun_2s.estrato,
    fun_2s.corregimiento,
    fun_2s.manzana,
    fun_2s.lote,
    expeditions.taxes,
    expeditions.duty,
    expeditions.tmp,
    expeditions.reso,
    expeditions.control,
    expeditions.id_public AS exp_id,
    doc_lic.pages AS doc_lic_pages,
    doc_res.pages AS doc_res_pages,
    doc_norm.id AS doc_norm_id,
    doc_norm.date AS doc_norm_date,
    step_eng_430.value AS eng_doc_cant,
    step_eng_430p.value AS eng_doc_pag,
    step_eng_ncert.value AS eng_ncert,
    step_arc_control.json AS arc_control,
    step_arc_bp.value AS arc_bp,
    step_arc_desc.value AS arc_desc,
    COUNT(bp_topo.id) AS bp_topo,
    COUNT(bp_arc.id) AS bp_arc,
    step_arc_arule.check AS arule_check,
    step_arc_arule.json AS arule_json,

    (
    SELECT
        GROUP_CONCAT(f51.name  SEPARATOR ';') 
    FROM 
        fun_51s AS f51
    INNER JOIN fun_51s AS f51map
    ON
        f51map.id = f51.id
    WHERE
        f51map.fun0Id = fun_0s.id
        AND
        f51map.role = 'PROPIETARIO'
) AS names51,

(
    SELECT
        GROUP_CONCAT(f51.surname  SEPARATOR ';') 
    FROM
        fun_51s AS f51
    INNER JOIN fun_51s AS f51map
    ON
        f51map.id = f51.id
    WHERE
        f51map.fun0Id = fun_0s.id
        AND
        f51map.role = 'PROPIETARIO'
) AS surnames51,


(
    SELECT
       GROUP_CONCAT(CONCAT('{"name":"',f52.name,'","surname":"',f52.surname,'","number":"',f52.number,'","email":"', f52.email,'","role":"', f52.role,    '"}') SEPARATOR '&&')
    FROM
        fun_52s AS f52
    INNER JOIN fun_52s AS f52map
    ON
        f52map.id = f52.id
    WHERE
        f52map.fun0Id = fun_0s.id
) AS objs_52,

(
    SELECT
        GROUP_CONCAT(expa.area SEPARATOR ';')
    FROM
        exp_areas AS expa
    INNER JOIN exp_areas AS expamap
    ON
    expamap.id = expa.id
    WHERE
    expamap.expeditionId = expeditions.id
        AND
        (expamap.payment = '0')
) AS exp_area,
(
    SELECT
        GROUP_CONCAT(expa.charge SEPARATOR ';')
    FROM
        exp_areas AS expa
    INNER JOIN exp_areas AS expamap
    ON
    expamap.id = expa.id
    WHERE
    expamap.expeditionId = expeditions.id
        AND
        (expamap.payment = '0')
) AS exp_charge,

(
    SELECT
        GROUP_CONCAT(expa.area SEPARATOR ';')
    FROM
        exp_areas AS expa
    INNER JOIN exp_areas AS expamap
    ON
    expamap.id = expa.id
    WHERE
    expamap.expeditionId = expeditions.id
        AND
        (expamap.payment = '1' OR expamap.payment = '2'  OR expamap.payment = '3')
) AS expa_1,
(
    SELECT
        GROUP_CONCAT(expa.charge SEPARATOR ';')
    FROM
        exp_areas AS expa
    INNER JOIN exp_areas AS expamap
    ON
    expamap.id = expa.id
    WHERE
    expamap.expeditionId = expeditions.id
        AND
        (expamap.payment = '1' OR expamap.payment = '2' OR expamap.payment = '3')
) AS expc_1,
(
    SELECT
        GROUP_CONCAT(expa.area SEPARATOR ';')
    FROM
        exp_areas AS expa
    INNER JOIN exp_areas AS expamap
    ON
    expamap.id = expa.id
    WHERE
    expamap.expeditionId = expeditions.id
        AND
        (expamap.payment = '0' OR expamap.payment = '2' OR expamap.payment = '3')
) AS expa_0,
(
    SELECT
        GROUP_CONCAT(expa.charge SEPARATOR ';')
    FROM
        exp_areas AS expa
    INNER JOIN exp_areas AS expamap
    ON
    expamap.id = expa.id
    WHERE
    expamap.expeditionId = expeditions.id
        AND
        (expamap.payment = '0' OR expamap.payment = '2' OR expamap.payment = '3')
) AS expc_0,
(
    SELECT
         GROUP_CONCAT(CONCAT('{"use":"',expa.use,'","area":"',expa.area,'","units":"',expa.units,'","desc":"', expa.desc, '"}') SEPARATOR '&&')
    FROM
        exp_areas AS expa
    LEFT JOIN exp_areas AS expamap
    ON
    expamap.id = expa.id
    WHERE
    expamap.expeditionId = expeditions.id
    AND
    (expamap.payment = '0' OR expamap.payment = '2' OR expamap.payment = '3')
) AS exp_a_obj,



(
    SELECT
        GROUP_CONCAT(r33a.build SEPARATOR '&&')
    FROM
        record_arc_33_areas AS r33a
    INNER JOIN record_arc_33_areas AS r33amap
    ON
        r33amap.id = r33a.id
    WHERE
        r33amap.recordArcId = record_arcs.id
        AND
        r33amap.type = 'area'
) AS r33a_build,
(
    SELECT
        GROUP_CONCAT(r33a.destroy SEPARATOR '&&')
    FROM
        record_arc_33_areas AS r33a
    INNER JOIN record_arc_33_areas AS r33amap
    ON
        r33amap.id = r33a.id
    WHERE
        r33amap.recordArcId = record_arcs.id
        AND
        r33amap.type = 'area'
) AS r33a_destroy,

(
    SELECT
        GROUP_CONCAT(r33a.units SEPARATOR '&&')
    FROM
        record_arc_33_areas AS r33a
    INNER JOIN record_arc_33_areas AS r33amap
    ON
        r33amap.id = r33a.id
    WHERE
        r33amap.recordArcId = record_arcs.id
        AND
        r33amap.type = 'area'
) AS r33a_units,

(
    SELECT
        GROUP_CONCAT(r33a.units_a SEPARATOR '&&')
    FROM
        record_arc_33_areas AS r33a
    INNER JOIN record_arc_33_areas AS r33amap
    ON
        r33amap.id = r33a.id
    WHERE
        r33amap.recordArcId = record_arcs.id
        AND
        r33amap.type = 'area'
) AS r33a_units_a,

(
    SELECT
        GROUP_CONCAT(r33a.floor SEPARATOR '&&')
    FROM
        record_arc_33_areas AS r33a
    INNER JOIN record_arc_33_areas AS r33amap
    ON
        r33amap.id = r33a.id
    WHERE
        r33amap.recordArcId = record_arcs.id
        AND
        r33amap.type = 'area'
) AS r33a_floor,

(
    SELECT
        GROUP_CONCAT(r33a.level SEPARATOR '%%')
    FROM
        record_arc_33_areas AS r33a
    INNER JOIN record_arc_33_areas AS r33amap
    ON
        r33amap.id = r33a.id
    WHERE
        r33amap.recordArcId = record_arcs.id
        AND
        r33amap.type = 'area'
) AS r33a_level,

(
    SELECT
        GROUP_CONCAT(r33a.historic_areas SEPARATOR '&&')
    FROM
        record_arc_33_areas AS r33a
    INNER JOIN record_arc_33_areas AS r33amap
    ON
        r33amap.id = r33a.id
    WHERE
        r33amap.recordArcId = record_arcs.id
        AND
        r33amap.type = 'area'
) AS r33a_history,


step_asat.json AS step_asat,
step_s34.value AS step_s34,
step_s34.json AS step_s34_json,
step_ageo.value AS step_ageo,
SUM(parking.project) AS parking,

clock_res.date_start AS clock_res_date,
clock_res.resolver_context AS clock_res_c,
clock_eje.date_start AS clock_eje,
clock_payment.date_start AS clock_payment,
clock_payment_uis.date_start AS clock_payment_uis,
clock_payment_2.date_start AS clock_payment_2,
clock_license.date_start AS clock_license,
clock_license_2.date_start AS clock_license_2,
clock_ldf.date_start AS clock_ldf,
clocl_acta_1.date_start AS  clocl_acta_1,
clocl_acta_2.date_start AS  clocl_acta_2,
clock_res_not_1.date_start AS clock_res_not_1,
clock_res_not_2.date_start AS clock_res_not_2,
expeditions.date AS clock_viabilidad,
clock_via_2.date_start AS clock_viabilidad_2

FROM
    fun_0s
LEFT JOIN expeditions ON fun_0s.id = expeditions.fun0Id
LEFT JOIN fun_clocks AS clock_payment
ON
    clock_payment.fun0Id = fun_0s.id AND clock_payment.state = 3

LEFT JOIN fun_clocks AS clock_payment_uis
    ON
    clock_payment_uis.fun0Id = fun_0s.id AND clock_payment_uis.state = 64

LEFT JOIN fun_clocks AS clock_license
ON
    clock_license.fun0Id = fun_0s.id AND (clock_license.state = 99 OR clock_license.state = 100 OR clock_license.state = 101)
LEFT JOIN fun_clocks AS clock_license_2
    ON
    clock_license_2.fun0Id = fun_0s.id AND clock_license_2.state = 99
LEFT JOIN fun_clocks AS clock_res
ON
    clock_res.fun0Id = fun_0s.id AND clock_res.state = 70
LEFT JOIN fun_clocks AS clock_via_2 ON clock_via_2.fun0Id = fun_0s.id AND clock_via_2.state = 61
LEFT JOIN fun_clocks AS clock_payment_2 ON clock_payment_2.fun0Id = fun_0s.id AND clock_payment_2.state = 69
LEFT JOIN fun_clocks AS clock_eje ON clock_eje.fun0Id = fun_0s.id AND clock_eje.state = 98
LEFT JOIN fun_clocks AS clock_ldf ON clock_ldf.fun0Id = fun_0s.id AND clock_ldf.state = 5
LEFT JOIN fun_clocks AS clocl_acta_1 ON clocl_acta_1.fun0Id = fun_0s.id AND clocl_acta_1.state = 30
LEFT JOIN fun_clocks AS clocl_acta_2 ON clocl_acta_2.fun0Id = fun_0s.id AND clocl_acta_2.state = 49 
LEFT JOIN fun_clocks AS clock_res_not_1 ON clock_res_not_1.fun0Id = fun_0s.id AND clock_res_not_1.state = 72
LEFT JOIN fun_clocks AS clock_res_not_2 ON clock_res_not_2.fun0Id = fun_0s.id AND clock_res_not_2.state = 73 
LEFT JOIN fun_1s ON fun_1s.fun0Id = fun_0s.id AND fun_1s.version = fun_0s.version
LEFT JOIN fun_2s ON fun_2s.fun0Id = fun_0s.id
LEFT JOIN fun_51s ON fun_51s.fun0Id = fun_0s.id
LEFT JOIN fun_52s ON fun_52s.fun0Id = fun_0s.id
LEFT JOIN record_arcs ON record_arcs.fun0Id = fun_0s.id
# ---------------- ARC ------------------- 
    LEFT JOIN record_arc_steps AS step_arc_control
    ON step_arc_control.recordArcId = record_arcs.id AND step_arc_control.id_public = 'arc_control'

    LEFT JOIN record_arc_steps AS step_arc_bp
    ON step_arc_bp.recordArcId = record_arcs.id AND step_arc_bp.id_public = 'blue_prints'

    LEFT JOIN record_arc_steps AS step_arc_desc
    ON step_arc_desc.recordArcId = record_arcs.id AND step_arc_desc.id_public = 's33'

# ---------------- ARC BLUEPRINTS ------------------- 

    LEFT JOIN record_arc_33_areas AS bp_topo ON bp_topo.recordArcId = record_arcs.id 
    AND bp_topo.type = 'blueprint' AND bp_topo.category = 'Topograficos'
    LEFT JOIN record_arc_33_areas  AS bp_arc ON bp_arc.recordArcId = record_arcs.id
    AND bp_arc.type = 'blueprint' AND bp_arc.category = 'Arquitectonico'

# ---------------- PARKINGS ------------------- 

    LEFT JOIN record_arc_35_parkings AS parking ON parking.recordArcId = record_arcs.id 

# ---------------- ENG ------------------- 
    LEFT JOIN record_engs ON record_engs.fun0Id = fun_0s.id
    LEFT JOIN record_eng_steps AS step_eng_430
    ON
    step_eng_430.recordEngId = record_engs.id AND step_eng_430.id_public = 's430'
    LEFT JOIN record_eng_steps AS step_eng_430p
    ON
    step_eng_430p.recordEngId = record_engs.id AND step_eng_430p.id_public = 's430p'
    LEFT JOIN record_eng_steps AS step_eng_ncert
    ON
    step_eng_ncert.recordEngId = record_engs.id AND step_eng_ncert.id_public = 's33_exp'
    
# ---------------- PH ------------------- 
LEFT JOIN record_phs ON record_phs.fun0Id = fun_0s.id
# ---------------- - ------------------- 

LEFT JOIN record_arc_steps AS step_asat
ON
    step_asat.recordArcId = record_arcs.id AND step_asat.id_public = 'sat'
LEFT JOIN record_arc_steps AS step_s34
ON
    step_s34.recordArcId = record_arcs.id AND step_s34.id_public = 's34'
LEFT JOIN record_arc_steps AS step_ageo
ON
    step_ageo.recordArcId = record_arcs.id AND step_ageo.id_public = 'geo'
LEFT JOIN record_arc_steps AS step_arc_arule
ON
step_arc_arule.recordArcId = record_arcs.id AND step_arc_arule.id_public = 'a_config'

# ---------------- DOCS ------------------- 

LEFT JOIN fun_6s AS doc_lic
ON
    doc_lic.fun0Id = fun_0s.id AND doc_lic.id_public = 845
LEFT JOIN fun_6s AS doc_res
ON
    doc_res.fun0Id = fun_0s.id AND doc_res.id_public = 835
LEFT JOIN fun_6s AS doc_norm
ON
    doc_norm.fun0Id = fun_0s.id AND doc_norm.id_public = 912


    WHERE (
        
        (clock_license.date_start BETWEEN '${date_start}' AND '${date_end}')
        OR
        (record_phs.date_arc_review BETWEEN '${date_start}' AND '${date_end}')
    )
    AND fun_0s.state >= ${min_state}
    AND fun_0s.state < ${max_state}

GROUP BY
    fun_0s.id_public
ORDER BY
    fun_0s.id_public
    `;

    return query;
}

module.exports.reportsFinance = (date_start, date_end) => {
    var query = `
    SELECT
    fun_0s.id,
    fun_0s.date AS pay_date,
    fun_0s.id_payment AS pay_id,
    fun_0s.id,
    record_phs.id_public AS id_public_ph,
    record_phs.date_arc_review AS clock_license_ph,
    fun_0s.id_public,
    fun_0s.state,
    fun_1s.tramite,
    fun_1s.tipo,
    fun_1s.m_urb,
    fun_1s.m_sub,
    fun_1s.m_lic,
    fun_1s.usos,
    fun_1s.vivienda,
    fun_1s.regla_1,
    fun_1s.regla_2,
    fun_1s.anex2,
    fun_1s.description,
    fun_2s.suelo,
    fun_2s.matricula,
    fun_2s.catastral,
    fun_2s.catastral_2,
    fun_2s.direccion,
    fun_2s.barrio,
    fun_2s.comuna,
    fun_2s.vereda,
    fun_2s.comuna,
    fun_2s.sector,
    fun_2s.estrato,
    fun_2s.corregimiento,
    fun_2s.manzana,
    fun_2s.lote,
    expeditions.taxes,
    expeditions.duty,
    expeditions.tmp,
    expeditions.reso,
    expeditions.control,
    expeditions.id_public AS exp_id,
    doc_lic.pages AS doc_lic_pages,
    doc_res.pages AS doc_res_pages,
    doc_norm.id AS doc_norm_id,
    doc_norm.date AS doc_norm_date,
    step_eng_430.value AS eng_doc_cant,
    step_eng_430p.value AS eng_doc_pag,
    step_eng_ncert.value AS eng_ncert,
    step_arc_control.json AS arc_control,
    step_arc_bp.value AS arc_bp,
    step_arc_desc.value AS arc_desc,
    COUNT(bp_topo.id) AS bp_topo,
    COUNT(bp_arc.id) AS bp_arc,
    step_arc_arule.check AS arule_check,
    step_arc_arule.json AS arule_json,
(
    SELECT
        GROUP_CONCAT(expa.area SEPARATOR ';')
    FROM
        exp_areas AS expa
    INNER JOIN exp_areas AS expamap
    ON
    expamap.id = expa.id
    WHERE
    expamap.expeditionId = expeditions.id
        AND
        (expamap.payment = '0')
) AS exp_area,
(
    SELECT
        GROUP_CONCAT(expa.charge SEPARATOR ';')
    FROM
        exp_areas AS expa
    INNER JOIN exp_areas AS expamap
    ON
    expamap.id = expa.id
    WHERE
    expamap.expeditionId = expeditions.id
        AND
        (expamap.payment = '0')
) AS exp_charge,

step_asat.json AS step_asat,
step_s34.value AS step_s34,
step_s34.json AS step_s34_json,
step_ageo.value AS step_ageo,
SUM(parking.project) AS parking,

clock_res.date_start AS clock_res_date,
clock_res.resolver_context AS clock_res_c,
clock_eje.date_start AS clock_eje,
clock_payment.date_start AS clock_payment,
clock_license.date_start AS clock_license,
clock_license_2.date_start AS clock_license_2,
clock_payment_uis.date_start AS clock_payment_uis,
clock_ldf.date_start AS clock_ldf,
clocl_acta_1.date_start AS  clocl_acta_1,
clocl_acta_2.date_start AS  clocl_acta_2,
clock_res_not_1.date_start AS clock_res_not_1,
clock_res_not_2.date_start AS clock_res_not_2,
expeditions.date AS clock_viabilidad,
clock_via_2.date_start AS clock_viabilidad_2

FROM
    fun_0s
LEFT JOIN expeditions ON fun_0s.id = expeditions.fun0Id
LEFT JOIN fun_clocks AS clock_payment
ON
    clock_payment.fun0Id = fun_0s.id AND clock_payment.state = 3
LEFT JOIN fun_clocks AS clock_license
ON
    clock_license.fun0Id = fun_0s.id AND (clock_license.state = 99 OR clock_license.state = 100 OR clock_license.state = 101)
LEFT JOIN fun_clocks AS clock_license_2
    ON
    clock_license_2.fun0Id = fun_0s.id AND clock_license_2.state = 99
LEFT JOIN fun_clocks AS clock_res
ON
    clock_res.fun0Id = fun_0s.id AND clock_res.state = 70

    LEFT JOIN fun_clocks AS clock_payment_uis
    ON
    clock_payment_uis.fun0Id = fun_0s.id AND clock_payment_uis.state = 64

LEFT JOIN fun_clocks AS clock_via_2 ON clock_via_2.fun0Id = fun_0s.id AND clock_via_2.state = 61
LEFT JOIN fun_clocks AS clock_ldf ON clock_ldf.fun0Id = fun_0s.id AND clock_ldf.state = 5
LEFT JOIN fun_clocks AS clocl_acta_1 ON clocl_acta_1.fun0Id = fun_0s.id AND clocl_acta_1.state = 30
LEFT JOIN fun_clocks AS clocl_acta_2 ON clocl_acta_2.fun0Id = fun_0s.id AND clocl_acta_2.state = 49 
LEFT JOIN fun_clocks AS clock_res_not_1 ON clock_res_not_1.fun0Id = fun_0s.id AND clock_res_not_1.state = 72
LEFT JOIN fun_clocks AS clock_res_not_2 ON clock_res_not_2.fun0Id = fun_0s.id AND clock_res_not_2.state = 73 
LEFT JOIN fun_clocks AS clock_eje ON clock_eje.fun0Id = fun_0s.id AND clock_eje.state = 98
LEFT JOIN fun_1s ON fun_1s.fun0Id = fun_0s.id AND fun_1s.version = fun_0s.version
LEFT JOIN fun_2s ON fun_2s.fun0Id = fun_0s.id
LEFT JOIN fun_51s ON fun_51s.fun0Id = fun_0s.id
LEFT JOIN fun_52s ON fun_52s.fun0Id = fun_0s.id
LEFT JOIN record_arcs ON record_arcs.fun0Id = fun_0s.id
# ---------------- ARC ------------------- 
    LEFT JOIN record_arc_steps AS step_arc_control
    ON step_arc_control.recordArcId = record_arcs.id AND step_arc_control.id_public = 'arc_control'

    LEFT JOIN record_arc_steps AS step_arc_bp
    ON step_arc_bp.recordArcId = record_arcs.id AND step_arc_bp.id_public = 'blue_prints'

    LEFT JOIN record_arc_steps AS step_arc_desc
    ON step_arc_desc.recordArcId = record_arcs.id AND step_arc_desc.id_public = 's33'

# ---------------- ARC BLUEPRINTS ------------------- 

    LEFT JOIN record_arc_33_areas AS bp_topo ON bp_topo.recordArcId = record_arcs.id 
    AND bp_topo.type = 'blueprint' AND bp_topo.category = 'Topograficos'
    LEFT JOIN record_arc_33_areas  AS bp_arc ON bp_arc.recordArcId = record_arcs.id
    AND bp_arc.type = 'blueprint' AND bp_arc.category = 'Arquitectonico'

# ---------------- PARKINGS ------------------- 

    LEFT JOIN record_arc_35_parkings AS parking ON parking.recordArcId = record_arcs.id 

# ---------------- ENG ------------------- 
    LEFT JOIN record_engs ON record_engs.fun0Id = fun_0s.id
    LEFT JOIN record_eng_steps AS step_eng_430
    ON
    step_eng_430.recordEngId = record_engs.id AND step_eng_430.id_public = 's430'
    LEFT JOIN record_eng_steps AS step_eng_430p
    ON
    step_eng_430p.recordEngId = record_engs.id AND step_eng_430p.id_public = 's430p'
    LEFT JOIN record_eng_steps AS step_eng_ncert
    ON
    step_eng_ncert.recordEngId = record_engs.id AND step_eng_ncert.id_public = 's33_exp'
    
# ---------------- PH ------------------- 
LEFT JOIN record_phs ON record_phs.fun0Id = fun_0s.id
# ---------------- - ------------------- 

LEFT JOIN record_arc_steps AS step_asat
ON
    step_asat.recordArcId = record_arcs.id AND step_asat.id_public = 'sat'
LEFT JOIN record_arc_steps AS step_s34
ON
    step_s34.recordArcId = record_arcs.id AND step_s34.id_public = 's34'
LEFT JOIN record_arc_steps AS step_ageo
ON
    step_ageo.recordArcId = record_arcs.id AND step_ageo.id_public = 'geo'
LEFT JOIN record_arc_steps AS step_arc_arule
ON
step_arc_arule.recordArcId = record_arcs.id AND step_arc_arule.id_public = 'a_config'

# ---------------- DOCS ------------------- 

LEFT JOIN fun_6s AS doc_lic
ON
    doc_lic.fun0Id = fun_0s.id AND doc_lic.id_public = 845
LEFT JOIN fun_6s AS doc_res
ON
    doc_res.fun0Id = fun_0s.id AND doc_res.id_public = 835
LEFT JOIN fun_6s AS doc_norm
ON
    doc_norm.fun0Id = fun_0s.id AND doc_norm.id_public = 912


    WHERE  (fun_0s.date BETWEEN '${date_start}' AND '${date_end}')

GROUP BY
    fun_0s.id_public
ORDER BY
    fun_0s.id_public
    `;

    return query;
}

module.exports.reportsResume = (date_start, date_end) => {
    var query = `
    SELECT
    fun_0s.id,
    fun_0s.date AS pay_date,
    fun_0s.id_payment AS pay_id,
    fun_0s.id,
    record_phs.id_public AS id_public_ph,
    record_phs.date_arc_review AS clock_license_ph,
    fun_0s.id_public,
    fun_0s.state,
    fun_1s.tramite,
    fun_1s.tipo,
    fun_1s.m_urb,
    fun_1s.m_sub,
    fun_1s.m_lic,
    fun_1s.usos,
    fun_1s.vivienda,
    fun_1s.regla_1,
    fun_1s.regla_2,
    fun_1s.anex2,
    fun_1s.cultural,
    fun_1s.description,
    fun_2s.suelo,
    fun_2s.matricula,
    fun_2s.catastral,
    fun_2s.catastral_2,
    fun_2s.direccion,
    fun_2s.barrio,
    fun_2s.comuna,
    fun_2s.vereda,
    fun_2s.comuna,
    fun_2s.sector,
    fun_2s.estrato,
    fun_2s.corregimiento,
    fun_2s.manzana,
    fun_2s.lote,
    fun_53s.name AS name53,
    fun_53s.surname AS surname53,
    expeditions.taxes,
    expeditions.duty,
    expeditions.tmp,
    expeditions.reso,
    expeditions.control,
    expeditions.id_public AS exp_id,
    clock_res.date_start AS clock_res_date,
    clock_res.resolver_context AS clock_res_c,
    clock_eje.date_start AS clock_eje,
    clock_payment.date_start AS clock_payment,
    clock_payment_2.date_start AS clock_payment_2,
    clock_lic.date_start AS clock_license,
    clock_lic.date_start AS clock_license_2,
    clock_ldf.date_start AS clock_ldf,
    clocl_acta_1.date_start AS  clocl_acta_1,
    clocl_acta_2.date_start AS  clocl_acta_2,
    clock_res_not_1.date_start AS clock_res_not_1,
    clock_res_not_2.date_start AS clock_res_not_2,
    expeditions.date AS clock_viabilidad,
    clock_via_2.date_start AS clock_viabilidad_2,
    
    clock_neg_1.date_start AS clock_neg_1,
    clock_neg_2.date_start AS clock_neg_2,
    clock_neg_3.date_start AS clock_neg_3,
    clock_neg_4.date_start AS clock_neg_4,
    clock_neg_5.date_start AS clock_neg_5,

    (
        SELECT
            GROUP_CONCAT(f51.name  SEPARATOR ';') 
        FROM 
            fun_51s AS f51
        INNER JOIN fun_51s AS f51map
        ON
            f51map.id = f51.id
        WHERE
            f51map.fun0Id = fun_0s.id
            AND
            f51map.role = 'PROPIETARIO'
    ) AS names51,
    
    (
        SELECT
            GROUP_CONCAT(f51.surname  SEPARATOR ';') 
        FROM
            fun_51s AS f51
        INNER JOIN fun_51s AS f51map
        ON
            f51map.id = f51.id
        WHERE
            f51map.fun0Id = fun_0s.id
            AND
            f51map.role = 'PROPIETARIO'
    ) AS surnames51,

(
    SELECT
        GROUP_CONCAT(expa.area SEPARATOR ';')
    FROM
        exp_areas AS expa
    INNER JOIN exp_areas AS expamap
    ON
    expamap.id = expa.id
    WHERE
    expamap.expeditionId = expeditions.id
        AND
        (expamap.payment = '0')
) AS exp_area,
(
    SELECT
        GROUP_CONCAT(expa.charge SEPARATOR ';')
    FROM
        exp_areas AS expa
    INNER JOIN exp_areas AS expamap
    ON
    expamap.id = expa.id
    WHERE
    expamap.expeditionId = expeditions.id
        AND
        (expamap.payment = '0')
) AS exp_charge

FROM fun_0s
LEFT JOIN expeditions ON fun_0s.id = expeditions.fun0Id
# ---------------- CLOCKS ------------------- 
LEFT JOIN fun_clocks AS clock_payment ON clock_payment.fun0Id = fun_0s.id AND clock_payment.state = 3
LEFT JOIN fun_clocks AS clock_ldf ON clock_ldf.fun0Id = fun_0s.id AND clock_ldf.state = 5
LEFT JOIN fun_clocks AS clocl_acta_1 ON clocl_acta_1.fun0Id = fun_0s.id AND clocl_acta_1.state = 30
LEFT JOIN fun_clocks AS clocl_acta_2 ON clocl_acta_2.fun0Id = fun_0s.id AND clocl_acta_2.state = 49 
LEFT JOIN fun_clocks AS clock_via_2 ON clock_via_2.fun0Id = fun_0s.id AND clock_via_2.state = 61
LEFT JOIN fun_clocks AS clock_payment_2 ON clock_payment_2.fun0Id = fun_0s.id AND clock_payment_2.state = 69
LEFT JOIN fun_clocks AS clock_res ON clock_res.fun0Id = fun_0s.id AND clock_res.state = 70
LEFT JOIN fun_clocks AS clock_res_not_1 ON clock_res_not_1.fun0Id = fun_0s.id AND clock_res_not_1.state = 72
LEFT JOIN fun_clocks AS clock_res_not_2 ON clock_res_not_2.fun0Id = fun_0s.id AND clock_res_not_2.state = 73 
LEFT JOIN fun_clocks AS clock_eje ON clock_eje.fun0Id = fun_0s.id AND clock_eje.state = 98
LEFT JOIN fun_clocks AS clock_lic ON clock_lic.fun0Id = fun_0s.id AND clock_lic.state = 99 
LEFT JOIN fun_clocks AS clock_neg_1 ON clock_neg_1.fun0Id = fun_0s.id AND clock_neg_1.state = -30 and clock_neg_1.version = -1
LEFT JOIN fun_clocks AS clock_neg_2 ON clock_neg_2.fun0Id = fun_0s.id AND clock_neg_2.state = -30 and clock_neg_2.version = -2
LEFT JOIN fun_clocks AS clock_neg_3 ON clock_neg_3.fun0Id = fun_0s.id AND clock_neg_3.state = -30 and clock_neg_3.version = -3
LEFT JOIN fun_clocks AS clock_neg_4 ON clock_neg_4.fun0Id = fun_0s.id AND clock_neg_4.state = -30 and clock_neg_4.version = -4
LEFT JOIN fun_clocks AS clock_neg_5 ON clock_neg_5.fun0Id = fun_0s.id AND clock_neg_5.state = -30 and clock_neg_5.version = -5
# ---------------- FUN ------------------- 
LEFT JOIN fun_1s ON fun_1s.fun0Id = fun_0s.id AND fun_1s.version = fun_0s.version
LEFT JOIN fun_2s ON fun_2s.fun0Id = fun_0s.id
LEFT JOIN fun_51s ON fun_51s.fun0Id = fun_0s.id
LEFT JOIN fun_52s ON fun_52s.fun0Id = fun_0s.id
LEFT JOIN fun_53s ON fun_53s.fun0Id = fun_0s.id
# ---------------- ARC ------------------- 
LEFT JOIN record_arcs ON record_arcs.fun0Id = fun_0s.id
# ---------------- PH ------------------- 
LEFT JOIN record_phs ON record_phs.fun0Id = fun_0s.id

WHERE  (


                (clock_lic.date_start BETWEEN '${date_start}' AND '${date_end}' )
                OR
                (record_phs.date_arc_review BETWEEN '${date_start}' AND '${date_end}' )
    			OR
                (fun_0s.state >= 100 OR clock_lic.date_start IS NOT NULL)
                OR
                (record_phs.date_arc_review IS NULL AND clock_lic.date_start IS NULL)
       )

GROUP BY
    fun_0s.id_public;
    `;

    return query;
}

module.exports.reportsPublicQuery = (id_start, id_end) => {
    var query = `
    SELECT
    fun_0s.id_public,
    fun_0s.type,
    fun_1s.tramite,
    fun_1s.tipo,
    fun_1s.m_urb,
    fun_1s.m_sub,
    fun_1s.m_lic,
    clock_payment.date_start AS clock_payment,
    clock_payment_2.date_start AS clock_payment_2,
    clock_date.date_start AS clock_date,
    clock_rew.date_start AS clock_rew,
    clock_rew_2.date_start AS clock_rew_2,
    clock_acto.date_start AS clock_acto,
    clock_license.date_start AS clock_license,

(
    SELECT
        GROUP_CONCAT(r33a.build SEPARATOR '&&')
    FROM
        record_arc_33_areas AS r33a
    INNER JOIN record_arc_33_areas AS r33amap
    ON
        r33amap.id = r33a.id
    WHERE
        r33amap.recordArcId = record_arcs.id
        AND
        r33amap.type = 'area'
) AS r33a_build,
(
    SELECT
        GROUP_CONCAT(r33a.destroy SEPARATOR '&&')
    FROM
        record_arc_33_areas AS r33a
    INNER JOIN record_arc_33_areas AS r33amap
    ON
        r33amap.id = r33a.id
    WHERE
        r33amap.recordArcId = record_arcs.id
        AND
        r33amap.type = 'area'
) AS r33a_destroy,

(
    SELECT
        GROUP_CONCAT(r33a.units SEPARATOR '&&')
    FROM
        record_arc_33_areas AS r33a
    INNER JOIN record_arc_33_areas AS r33amap
    ON
        r33amap.id = r33a.id
    WHERE
        r33amap.recordArcId = record_arcs.id
        AND
        r33amap.type = 'area'
) AS r33a_units,

(
    SELECT
        GROUP_CONCAT(r33a.units_a SEPARATOR '&&')
    FROM
        record_arc_33_areas AS r33a
    INNER JOIN record_arc_33_areas AS r33amap
    ON
        r33amap.id = r33a.id
    WHERE
        r33amap.recordArcId = record_arcs.id
        AND
        r33amap.type = 'area'
) AS r33a_units_a


FROM
    fun_0s
    
LEFT JOIN expeditions ON fun_0s.id = expeditions.fun0Id

LEFT JOIN fun_clocks AS clock_payment ON clock_payment.fun0Id = fun_0s.id AND clock_payment.state = 3

LEFT JOIN fun_clocks AS clock_date ON clock_date.fun0Id = fun_0s.id AND clock_date.state = 5

LEFT JOIN fun_clocks AS clock_rew ON clock_rew.fun0Id = fun_0s.id AND clock_rew.state = 30

LEFT JOIN fun_clocks AS clock_rew_2 ON clock_rew_2.fun0Id = fun_0s.id AND clock_rew_2.state = 49

LEFT JOIN fun_clocks AS clock_acto ON clock_acto.fun0Id = fun_0s.id AND clock_acto.state = 61

LEFT JOIN fun_clocks AS clock_payment_2 ON clock_payment_2.fun0Id = fun_0s.id AND clock_payment_2.state = 69

LEFT JOIN fun_clocks AS clock_license ON clock_license.fun0Id = fun_0s.id AND clock_license.state = 99

LEFT JOIN fun_1s ON fun_1s.fun0Id = fun_0s.id AND fun_1s.version = fun_0s.version
LEFT JOIN record_arcs ON record_arcs.fun0Id = fun_0s.id
# ---------------- ARC ------------------- 
    LEFT JOIN record_arc_steps AS step_arc_control
    ON step_arc_control.recordArcId = record_arcs.id AND step_arc_control.id_public = 'arc_control'

    LEFT JOIN record_arc_steps AS step_arc_bp
    ON step_arc_bp.recordArcId = record_arcs.id AND step_arc_bp.id_public = 'blue_prints'

    LEFT JOIN record_arc_steps AS step_arc_desc
    ON step_arc_desc.recordArcId = record_arcs.id AND step_arc_desc.id_public = 's33'



    WHERE fun_0s.state = 100
GROUP BY
    fun_0s.id_public
ORDER BY
    fun_0s.id_public
    `;

    return query;
}

module.exports.loadMacro = (_date_sart, _date_end, _id, _id2, omitFinished = false, isLite = false) => {
    let date_stat = _date_sart;
    let date_end = _date_end;
    let field = 'FATTHER.date';
    let id = _id;
    if (_id2) {
        date_stat = _id;
        date_end = _id2;
        id = null;
        field = 'FATTHER.id_public';
    }
    if (!_id2 && _date_sart == null && _date_end == null) {
        date_stat = _id;
        date_end = _id;
        id = null;
        field = 'FATTHER.id';
    }
    let qp1 = isLite ? '' : `  fun_2s.estrato,
    fun_2s.direccion,
    fun_2s.matricula,
    fun_2s.catastral,
    fun_2s.catastral_2,

    f53.fun_53s_name,
    f53.fun_53s_surname,
    f53.fun_53s_role,
    f53.fun_53s_id_number,

    fun_laws.report_data,
    fun_laws.report_cub,
    fun_laws.sign,
    seals.id as seal,
    SUM(IF(fun_3s.state > 0, 1, 0)) as alerted,
    COUNT(fun_3s.id) as neighbours,
    (
        SELECT COUNT(f.id_public) 
        FROM pqrs_funs f
        WHERE f.id_public = FATTHER.id_public
        
    ) AS "pqrs",`;

    let qp2 = isLite ? '' : ` LEFT JOIN fun_2s ON fun_2s.fun0Id = FATTHER.id
  
    LEFT JOIN fun_laws ON fun_laws.fun0Id = FATTHER.id
    LEFT JOIN seals ON seals.fun0Id = FATTHER.id
  
    LEFT JOIN fun_3s ON fun_3s.fun0Id = FATTHER.id`;

    let finished = omitFinished ? 'AND FATTHER.state < 100' : ``;

    var query = `
    SELECT 
    FATTHER.id, FATTHER.version, FATTHER.id_public, FATTHER.state, FATTHER.type,  FATTHER.tags, FATTHER.rules, 
    fun_1s.tramite, fun_1s.tipo, fun_1s.m_urb, fun_1s.m_sub, fun_1s.m_lic, fun_1s.usos,
    ${qp1}
    
    expeditions.id_public AS exp_id,
    expeditions.cub2 AS exp_cub2s,
    expeditions.date AS exp_date,
  
    record_laws.id AS jur_id,
    record_laws.version AS jur_version,
    DATE_FORMAT(record_laws.createdAt,'%Y-%m-%d') AS jur_date_s, 
    record_law_reviews.check AS jur_review, 
    record_law_reviews.date AS jur_date, 
    record_law_reviews.worker_name AS jur_worker,
    record_laws.worker_name as asign_law_worker_name,
    record_laws.worker_id as asign_law_worker_id,
    record_laws.date_asign as asign_law_date,
    
    record_engs.id AS end_id,
    record_engs.version AS eng_version, 
    DATE_FORMAT(record_engs.createdAt,'%Y-%m-%d') AS eng_date_s, 
    record_eng_reviews.check AS eng_review, 
    record_eng_reviews.check_2 AS eng_review_2, 
    record_eng_reviews.date AS eng_date, 
    record_eng_reviews.worker_name AS eng_worker,
    record_engs.worker_name as asign_eng_worker_name,
    record_engs.worker_id as asign_eng_worker_id,
    record_engs.date_asign as asign_eng_date,
    
    record_arcs.id AS arc_id,
    record_arcs.version AS arc_version,
    DATE_FORMAT(record_arcs.createdAt,'%Y-%m-%d') AS arc_date_s, 
    record_arc_38s.check AS arc_review, 
    record_arc_38s.date AS arc_date, 
    record_arc_38s.worker_name AS arc_worker,
    record_arcs.worker_id as asign_arc_worker_id,
    record_arcs.date_asign as asign_arc_date,
    record_arcs.worker_name as asign_arc_worker_name,
    record_arcs.category AS arc_cat,
    
    record_phs.id AS ph_id, 
    record_phs.version AS ph_version, 
    DATE_FORMAT(record_phs.createdAt,'%Y-%m-%d') AS ph_date_s, 
  
    record_phs.check AS ph_review, 
    record_phs.check_law AS ph_review_law, 
    record_phs.date_law_review AS ph_date_law, 
    record_phs.worker_law_name AS ph_worker_law,
  
    record_phs.date_arc_review AS ph_date_arc, 
    record_phs.worker_arc_name AS ph_worker_arc,
  
    record_phs.worker_asign_law_name AS asign_ph_law_worker_name,
    record_phs.worker_asign_law_id AS sign_ph_law_worker_id,
    record_phs.date_asign_law AS asign_ph_law_date,
  
    record_phs.worker_asign_arc_name AS asign_ph_arc_worker_name,
    record_phs.worker_asign_arc_id AS sign_ph_arc_worker_id,
    record_phs.date_asign_arc AS asign_ph_arc_date,
  
    record_reviews.check AS rec_review,
    record_reviews.check_2 AS rec_review_2,

    sub_query.submit_dates,
    sub_query.submit_types,
    sub_query.scodes,
    sub_query.sreview,
 	
    clocks.clocks_id,
    clocks.clocks_state,
    clocks.clocks_version,
    clocks.clocks_date_start,
    clocks.clocks_dresolver_context
  
    FROM 
    
    (
        SELECT
            submits.id_related,
            GROUP_CONCAT(submits.date SEPARATOR ';') AS submit_dates,
            GROUP_CONCAT(submits.list_type SEPARATOR ';') AS submit_types,
            
            GROUP_CONCAT(CONCAT('-#', submits.date, '#-', sub_lists.list_code) ) AS scodes,
            GROUP_CONCAT(CONCAT('-#', submits.date, '#-', sub_lists.list_review) ) AS sreview
                         
        FROM submits
        LEFT JOIN sub_lists ON sub_lists.submitId = submits.id
        GROUP BY submits.id_related
            
        ) AS sub_query,
        
        (
            SELECT
                fun_53s.fun0Id,
                GROUP_CONCAT(fun_53s.name SEPARATOR ';') AS 'fun_53s_name',
                 GROUP_CONCAT(fun_53s.surname SEPARATOR ';') AS 'fun_53s_surname',
                 GROUP_CONCAT(fun_53s.role SEPARATOR ';') AS 'fun_53s_role',
                GROUP_CONCAT(fun_53s.id_number SEPARATOR ';') AS 'fun_53s_id_number'
            FROM fun_53s
            GROUP BY fun_53s.fun0Id
        ) AS f53,
        
        (
            SELECT
                fun_clocks.fun0Id,
                GROUP_CONCAT(fun_clocks.id SEPARATOR ';') AS clocks_id,
                GROUP_CONCAT(COALESCE(fun_clocks.state, 'null') SEPARATOR ';')  AS clocks_state,
                GROUP_CONCAT(COALESCE(fun_clocks.version, 'null') SEPARATOR ';')  AS clocks_version,
                GROUP_CONCAT(COALESCE(fun_clocks.date_start, 'null') SEPARATOR '&&') AS clocks_date_start,
                GROUP_CONCAT(COALESCE(fun_clocks.resolver_context, 'null') SEPARATOR '&&') AS clocks_dresolver_context
            FROM fun_clocks
            GROUP BY fun_clocks.fun0Id
        ) AS clocks,
    
    fun_0s AS FATTHER
  
 
    LEFT JOIN fun_1s ON fun_1s.fun0Id = FATTHER.id
    AND fun_1s.version = FATTHER.version
  
    ${qp2}

    LEFT JOIN record_laws ON record_laws.fun0Id = FATTHER.id
    LEFT JOIN record_law_reviews ON record_law_reviews.recordLawId = record_laws.id
    AND record_law_reviews.version = record_laws.version
  
    LEFT JOIN record_engs ON record_engs.fun0Id = FATTHER.id
    LEFT JOIN record_eng_reviews ON record_eng_reviews.recordEngId = record_engs.id
    AND record_engs.version = record_eng_reviews.version
  
    LEFT JOIN record_arcs ON record_arcs.fun0Id = FATTHER.id
    LEFT JOIN record_arc_38s ON record_arc_38s.recordArcId = record_arcs.id
    AND record_arc_38s.version = record_arcs.version
  
    LEFT JOIN record_phs ON record_phs.fun0Id = FATTHER.id
  
    LEFT JOIN record_reviews ON  record_reviews.fun0Id = FATTHER.id 
  
    LEFT JOIN expeditions ON expeditions.fun0Id = FATTHER.id
          
    WHERE ${field} BETWEEN '${date_stat}' AND '${date_end}'

    AND sub_query.id_related = FATTHER.id_public
    AND f53.fun0Id = FATTHER.id
    AND clocks.fun0Id = FATTHER.id

    ${_id && !_id2 ? "" : "AND FATTHER.state <= 50"}
    ${id ? "AND FATTHER.id = '" + id + "'" : ''}
    ${finished}

    GROUP BY FATTHER.id DESC
    `;

    return query;
}

module.exports.loadIncDocs = () => {
    let query = `
    SELECT
	fun_0s.id,
    #fun_0s.state,
    fun_0s.id_public,
    fun_1s.tipo,
    fun_1s.tramite,
    fun_1s.m_urb,
    fun_1s.m_sub,
    fun_1s.m_lic,
    fun_rs.checked,
    fun_rs.code,
    GROUP_CONCAT(sub_lists.list_code SEPARATOR ',') AS vr_codes,
    GROUP_CONCAT(sub_lists.list_review SEPARATOR ',') AS vr_checked,
    (
        SELECT
            c_id.date_start
        FROM
            fun_clocks AS c_id
        LEFT JOIN fun_clocks AS c_id_map
        ON
            c_id_map.id = c_id.id
        WHERE
            c_id_map.fun0Id = fun_0s.id
            AND
            c_id_map.state = 3
           LIMIT 1
    ) AS 'clocks_date'
    
    FROM fun_0s
    
    LEFT JOIN fun_1s ON fun_1s.fun0Id = fun_0s.id
    LEFT JOIN fun_rs ON fun_rs.fun0Id = fun_0s.id
    LEFT JOIN submits ON submits.id_related = fun_0s.id_public
    LEFT JOIN sub_lists ON sub_lists.submitId = submits.id
    
    WHERE fun_0s.state = 1 OR fun_0s.state = -1 
    
    

    GROUP BY fun_0s.id

    ORDER BY fun_0s.id_public ASC
    `;

    return query;
}

module.exports.getCubDictionary1 = (id_public) => {
    const query_id_fun = id_public ? `AND fun_0s.id_public LIKE '${id_public}'` : '';
    const query_id_pqr = id_public ? `AND pqrs_masters.id_global LIKE '${id_public}'` : '';

    // Si no hay resultados en cub_x_vr, continuar con las demás consultas
    return  `
    SELECT
        *
    FROM
        ( 
    SELECT 
        CubXVrs.cub AS cub,
        IFNULL(CubXVrs.fun,CubXVrs.pqrs) AS id,
        CubXVrs.vr AS vr, 
        CubXVrs.desc AS res,
        CubXVrs.date AS date
    FROM CubXVrs
    LEFT JOIN fun_0s ON fun_0s.id_public = CubXVrs.fun
    LEFT JOIN pqrs_masters ON pqrs_masters.id_global = CubXVrs.pqrs
    WHERE CubXVrs.cub LIKE '${curaduriaInfo.serials.end}%'
    ${query_id_fun}
    ${query_id_pqr}       

    UNION

    SELECT (fun_laws.report_cub) AS cub, 
    fun_0s.id_public AS id, 
    '' AS vr, 
    'Reporte de reconocimiento' AS res,
    (fun_laws.createdAt) AS date
    FROM fun_laws
    INNER JOIN fun_0s ON fun_laws.fun0Id = fun_0s.id
    WHERE fun_laws.report_cub LIKE  '${curaduriaInfo.serials.end}%'
    AND fun_laws.report_cub IS NOT NULL
    ${query_id_fun}

    UNION

    SELECT (fun_laws.cub_inc) AS cub, 
    fun_0s.id_public AS id, 
    '' AS vr, 
    'Carta Incompleto' AS res,
    (fun_laws.createdAt) AS date
    FROM fun_laws
    INNER JOIN fun_0s ON fun_laws.fun0Id = fun_0s.id
    WHERE fun_laws.cub_inc LIKE  '${curaduriaInfo.serials.end}%'
    AND fun_laws.cub_inc IS NOT NULL
    ${query_id_fun}

    UNION

    SELECT (fun_laws.cub_ldf) AS cub, 
    fun_0s.id_public AS id, 
    '' AS vr, 
    'Carta LyDF' AS res,
    (fun_laws.createdAt) AS date
    FROM fun_laws
    INNER JOIN fun_0s ON fun_laws.fun0Id = fun_0s.id
    WHERE fun_laws.cub_ldf LIKE  '${curaduriaInfo.serials.end}%'
    AND fun_laws.cub_ldf IS NOT NULL
    ${query_id_fun}

    UNION

    SELECT (fun_laws.cub_act) AS cub, 
    fun_0s.id_public AS id, 
    '' AS vr, 
    'Carta Acta Observaciones' AS res,
    (fun_laws.createdAt) AS date
    FROM fun_laws
    INNER JOIN fun_0s ON fun_laws.fun0Id = fun_0s.id
    WHERE fun_laws.cub_act LIKE  '${curaduriaInfo.serials.end}%'
    AND fun_laws.cub_act IS NOT NULL
    ${query_id_fun}

    UNION

    SELECT (fun_laws.cub_act2) AS cub, 
    fun_0s.id_public AS id, 
    '' AS vr, 
    'Carta ampliación de terminos' AS res,
    (fun_laws.createdAt) AS date
    FROM fun_laws
    INNER JOIN fun_0s ON fun_laws.fun0Id = fun_0s.id
    WHERE fun_laws.cub_act2 LIKE  '${curaduriaInfo.serials.end}%'
    AND fun_laws.cub_act2 IS NOT NULL
    ${query_id_fun}
        
    UNION

    SELECT (pqrs_masters.id_reply)AS cub, 
    pqrs_masters.id_publico AS id, 
    pqrs_masters.id_global AS vr,
    'Peticion PQRS' AS res,
    (pqrs_masters.createdAt) AS date
    FROM pqrs_masters 
    WHERE pqrs_masters.id_reply LIKE  '${curaduriaInfo.serials.end}%'
    AND pqrs_masters.id_reply IS NOT NULL
    ${query_id_pqr}

    UNION

    SELECT (pqrs_masters.id_confirm)AS cub, 
    pqrs_masters.id_publico AS id, 
    pqrs_masters.id_global AS vr,
    'Carta de confirmación PQRS' AS res,
    (pqrs_masters.createdAt) AS date
    FROM pqrs_masters 
    WHERE pqrs_masters.id_confirm LIKE  '${curaduriaInfo.serials.end}%'
    AND pqrs_masters.id_confirm IS NOT NULL
    ${query_id_pqr}

    UNION

    SELECT (fun_3s.id_cub)AS cub, 
    fun_0s.id_public AS id, 
    '' AS vr,
        'Citacion Vecino Colindante' AS res,
        (fun_3s.alerted) AS date
    FROM fun_3s
        INNER JOIN fun_0s ON fun_3s.fun0Id = fun_0s.id
    WHERE fun_3s.id_cub LIKE  '${curaduriaInfo.serials.end}%'
    AND fun_3s.id_cub IS NOT NULL
    ${query_id_fun}

    UNION

    SELECT (expeditions.cub1)AS cub,
    fun_0s.id_public AS id, 
    '' AS vr,
        'Acta de Viabilidad' AS res,
        (expeditions.date) AS date
    FROM expeditions
        INNER JOIN fun_0s ON expeditions.fun0Id = fun_0s.id
    WHERE expeditions.cub1 LIKE  '${curaduriaInfo.serials.end}%'
    AND expeditions.cub1 IS NOT NULL
    ${query_id_fun}

    UNION

    SELECT (expeditions.cub2)AS cub, 
    fun_0s.id_public AS id,
    '' AS vr,
        'Deberes Urbanisticos' AS res,
        (expeditions.date2) AS date
    FROM expeditions
        INNER JOIN fun_0s ON expeditions.fun0Id = fun_0s.id
    WHERE expeditions.cub2 LIKE  '${curaduriaInfo.serials.end}%'
    AND expeditions.cub2 IS NOT NULL
    ${query_id_fun}

    UNION

    SELECT (expeditions.cub3)AS cub, 
    fun_0s.id_public AS id,
    '' AS vr,
        'Citacion Notificación Resolución' AS res,
        (expeditions.cub3_json) AS date
    FROM expeditions
        INNER JOIN fun_0s ON expeditions.fun0Id = fun_0s.id
    WHERE expeditions.cub3 LIKE  '${curaduriaInfo.serials.end}%'
    AND expeditions.cub3 IS NOT NULL
    ${query_id_fun}

    UNION

    SELECT (record_phs.cub)AS cub, 
    fun_0s.id_public AS id,
    '' AS vr,
    'Citacion Notificación Resolución de Aprovación de Plano de Propiedad Horizontal' AS res,
    (record_phs.date_arc_review) AS date
    FROM record_phs
        INNER JOIN fun_0s ON record_phs.fun0Id = fun_0s.id
    WHERE record_phs.cub LIKE  '${curaduriaInfo.serials.end}%'
    AND record_phs.cub IS NOT NULL
    ${query_id_fun}

    UNION

    SELECT (record_reviews.id_public)AS cub, 
    fun_0s.id_public AS id,
    '' AS vr,
    'Acta de Observaciones y correciones' AS res,
    (record_reviews.date) AS date
    FROM record_reviews
        INNER JOIN fun_0s ON record_reviews.fun0Id = fun_0s.id
    WHERE record_reviews.id_public LIKE  '${curaduriaInfo.serials.end}%'
    AND record_reviews.id_public IS NOT NULL
    ${query_id_fun}

    )  CUBS
   
    GROUP BY cub
    ORDER BY cub DESC;
    
    `;
};

module.exports.getCubDictionaryFiltrate = (serch , num, id_public) => {
    const query_id_fun = id_public ? `AND fun_0s.id_public LIKE '${id_public}'` : '';
    const query_id_pqr = id_public ? `AND pqrs_masters.id_global LIKE '${id_public}'` : '';

    // Si no hay resultados en cub_x_vr, continuar con las demás consultas
    return  `
    SELECT  *
    FROM 
        ( 
    SELECT 
        CubXVrs.cub AS cub,
        IFNULL(CubXVrs.fun,CubXVrs.pqrs) AS id,
        CubXVrs.vr AS vr, 
        CubXVrs.date AS date,
        CubXVrs.desc AS res
    FROM CubXVrs
    WHERE CubXVrs.cub LIKE '${curaduriaInfo.serials.end}%'
    ${query_id_fun ? `AND CubXVrs.fun = '${query_id_fun}'` : ''}
    ${query_id_pqr ? `AND CubXVrs.pqrs = '${query_id_pqr}'` : ''}       

    UNION

    SELECT (fun_laws.report_cub) AS cub, 
    fun_0s.id_public AS id, 
    '' AS vr, 
    'Reporte de reconocimiento' AS res,
    (fun_laws.createdAt) AS date
    FROM fun_laws
    INNER JOIN fun_0s ON fun_laws.fun0Id = fun_0s.id
    WHERE fun_laws.report_cub LIKE  '${curaduriaInfo.serials.end}%'
    AND fun_laws.report_cub IS NOT NULL
    ${query_id_fun}

    UNION

    SELECT (fun_laws.cub_inc) AS cub, 
    fun_0s.id_public AS id, 
    '' AS vr, 
    'Carta Incompleto' AS res,
    (fun_laws.createdAt) AS date
    FROM fun_laws
    INNER JOIN fun_0s ON fun_laws.fun0Id = fun_0s.id
    WHERE fun_laws.cub_inc LIKE  '${curaduriaInfo.serials.end}%'
    AND fun_laws.cub_inc IS NOT NULL
    ${query_id_fun}

    UNION

    SELECT (fun_laws.cub_ldf) AS cub, 
    fun_0s.id_public AS id, 
    '' AS vr, 
    'Carta LyDF' AS res,
    (fun_laws.createdAt) AS date
    FROM fun_laws
    INNER JOIN fun_0s ON fun_laws.fun0Id = fun_0s.id
    WHERE fun_laws.cub_ldf LIKE  '${curaduriaInfo.serials.end}%'
    AND fun_laws.cub_ldf IS NOT NULL
    ${query_id_fun}

    UNION

    SELECT (fun_laws.cub_act) AS cub, 
    fun_0s.id_public AS id, 
    '' AS vr, 
    'Carta Acta Observaciones' AS res,
    (fun_laws.createdAt) AS date
    FROM fun_laws
    INNER JOIN fun_0s ON fun_laws.fun0Id = fun_0s.id
    WHERE fun_laws.cub_act LIKE  '${curaduriaInfo.serials.end}%'
    AND fun_laws.cub_act IS NOT NULL
    ${query_id_fun}

    UNION

    SELECT (fun_laws.cub_act2) AS cub, 
    fun_0s.id_public AS id, 
    '' AS vr, 
    'Carta ampliación de terminos' AS res,
    (fun_laws.createdAt) AS date
    FROM fun_laws
    INNER JOIN fun_0s ON fun_laws.fun0Id = fun_0s.id
    WHERE fun_laws.cub_act2 LIKE  '${curaduriaInfo.serials.end}%'
    AND fun_laws.cub_act2 IS NOT NULL
    ${query_id_fun}
        
    UNION

    SELECT (pqrs_masters.id_reply)AS cub, 
    pqrs_masters.id_publico AS id, 
    pqrs_masters.id_global AS vr,
    'Peticion PQRS' AS res,
    (pqrs_masters.createdAt) AS date
    FROM pqrs_masters 
    WHERE pqrs_masters.id_reply LIKE  '${curaduriaInfo.serials.end}%'
    AND pqrs_masters.id_reply IS NOT NULL
    ${query_id_pqr}

    UNION

    SELECT (pqrs_masters.id_confirm)AS cub, 
    pqrs_masters.id_publico AS id, 
    pqrs_masters.id_global AS vr,
    'Carta de confirmación PQRS' AS res,
    (pqrs_masters.createdAt) AS date
    FROM pqrs_masters 
    WHERE pqrs_masters.id_confirm LIKE  '${curaduriaInfo.serials.end}%'
    AND pqrs_masters.id_confirm IS NOT NULL
    ${query_id_pqr}

    UNION

    SELECT (fun_3s.id_cub)AS cub, 
    fun_0s.id_public AS id, 
    '' AS vr,
        'Citacion Vecino Colindante' AS res,
        (fun_3s.alerted) AS date
    FROM fun_3s
        INNER JOIN fun_0s ON fun_3s.fun0Id = fun_0s.id
    WHERE fun_3s.id_cub LIKE  '${curaduriaInfo.serials.end}%'
    AND fun_3s.id_cub IS NOT NULL
    ${query_id_fun}

    UNION

    SELECT (expeditions.cub1)AS cub,
    fun_0s.id_public AS id, 
    '' AS vr,
        'Acta de Viabilidad' AS res,
        (expeditions.date) AS date
    FROM expeditions
        INNER JOIN fun_0s ON expeditions.fun0Id = fun_0s.id
    WHERE expeditions.cub1 LIKE  '${curaduriaInfo.serials.end}%'
    AND expeditions.cub1 IS NOT NULL
    ${query_id_fun}

    UNION

    SELECT (expeditions.cub2)AS cub, 
    fun_0s.id_public AS id,
    '' AS vr,
        'Deberes Urbanisticos' AS res,
        (expeditions.date2) AS date
    FROM expeditions
        INNER JOIN fun_0s ON expeditions.fun0Id = fun_0s.id
    WHERE expeditions.cub2 LIKE  '${curaduriaInfo.serials.end}%'
    AND expeditions.cub2 IS NOT NULL
    ${query_id_fun}

    UNION

    SELECT (expeditions.cub3)AS cub, 
    fun_0s.id_public AS id,
    '' AS vr,
        'Citacion Notificación Resolución' AS res,
        (expeditions.cub3_json) AS date
    FROM expeditions
        INNER JOIN fun_0s ON expeditions.fun0Id = fun_0s.id
    WHERE expeditions.cub3 LIKE  '${curaduriaInfo.serials.end}%'
    AND expeditions.cub3 IS NOT NULL
    ${query_id_fun}

    UNION

    SELECT (record_phs.cub)AS cub, 
    fun_0s.id_public AS id,
    '' AS vr,
    'Citacion Notificación Resolución de Aprovación de Plano de Propiedad Horizontal' AS res,
    (record_phs.date_arc_review) AS date
    FROM record_phs
        INNER JOIN fun_0s ON record_phs.fun0Id = fun_0s.id
    WHERE record_phs.cub LIKE  '${curaduriaInfo.serials.end}%'
    AND record_phs.cub IS NOT NULL
    ${query_id_fun}

    UNION

    SELECT (record_reviews.id_public)AS cub, 
    fun_0s.id_public AS id,
    '' AS vr,
    'Acta de Observaciones y correciones' AS res,
    (record_reviews.date) AS date
    FROM record_reviews
        INNER JOIN fun_0s ON record_reviews.fun0Id = fun_0s.id
    WHERE record_reviews.id_public LIKE  '${curaduriaInfo.serials.end}%'
    AND record_reviews.id_public IS NOT NULL
    ${query_id_fun}

    )  CUBS
    WHERE ${serch} = '${num}'
    GROUP BY cub
    ORDER BY cub DESC;
    `;
};

module.exports.getCubDictionary = (id_public) => {

    const query_id_fun = id_public ? `AND fun_0s.id_public LIKE '${id_public}'` : '';
    const query_id_pqr = id_public ? `AND pqrs_masters.id_global LIKE '${id_public}'` : '';


    return `
    SELECT
        *
    FROM
        (        

    SELECT (fun_laws.report_cub) AS cub, 
    fun_0s.id_public AS id, 
    '' AS vr, 
    'Reporte de reconocimiento' AS res,
    (fun_laws.createdAt) AS date
    FROM fun_laws
    INNER JOIN fun_0s ON fun_laws.fun0Id = fun_0s.id
    WHERE fun_laws.report_cub LIKE  '${curaduriaInfo.serials.end}%'
    AND fun_laws.report_cub IS NOT NULL
    ${query_id_fun}

    UNION

    SELECT (fun_laws.cub_inc) AS cub, 
    fun_0s.id_public AS id, 
    '' AS vr, 
    'Carta Incompleto' AS res,
    (fun_laws.createdAt) AS date
    FROM fun_laws
    INNER JOIN fun_0s ON fun_laws.fun0Id = fun_0s.id
    WHERE fun_laws.cub_inc LIKE  '${curaduriaInfo.serials.end}%'
    AND fun_laws.cub_inc IS NOT NULL
    ${query_id_fun}

    UNION 

    SELECT (fun_laws.cub_ldf) AS cub, 
    fun_0s.id_public AS id, 
    '' AS vr, 
    'Carta LyDF' AS res,
    (fun_laws.createdAt) AS date
    FROM fun_laws
    INNER JOIN fun_0s ON fun_laws.fun0Id = fun_0s.id
    WHERE fun_laws.cub_ldf LIKE  '${curaduriaInfo.serials.end}%'
    AND fun_laws.cub_ldf IS NOT NULL
    ${query_id_fun}

    UNION

    SELECT (fun_laws.cub_act) AS cub, 
    fun_0s.id_public AS id, 
    '' AS vr, 
    'Carta Acta Observaciones' AS res,
    (fun_laws.createdAt) AS date
    FROM fun_laws
    INNER JOIN fun_0s ON fun_laws.fun0Id = fun_0s.id
    WHERE fun_laws.cub_act LIKE  '${curaduriaInfo.serials.end}%'
    AND fun_laws.cub_act IS NOT NULL
    ${query_id_fun}

    UNION

    SELECT (fun_laws.cub_act2) AS cub, 
    fun_0s.id_public AS id, 
    '' AS vr, 
    'Carta ampliación de terminos' AS res,
    (fun_laws.createdAt) AS date
    FROM fun_laws
    INNER JOIN fun_0s ON fun_laws.fun0Id = fun_0s.id
    WHERE fun_laws.cub_act2 LIKE  '${curaduriaInfo.serials.end}%'
    AND fun_laws.cub_act2 IS NOT NULL
    ${query_id_fun}
        
    UNION

    SELECT (pqrs_masters.id_reply)AS cub, 
    pqrs_masters.id_publico AS id, 
    pqrs_masters.id_global AS vr,
    'Peticion PQRS' AS res,
    (pqrs_masters.createdAt) AS date
    FROM pqrs_masters 
    WHERE pqrs_masters.id_reply LIKE  '${curaduriaInfo.serials.end}%'
    AND pqrs_masters.id_reply IS NOT NULL
    ${query_id_pqr}

    UNION

    SELECT (pqrs_masters.id_confirm)AS cub, 
    pqrs_masters.id_publico AS id, 
    pqrs_masters.id_global AS vr,
    'Carta de confirmación PQRS' AS res,
    (pqrs_masters.createdAt) AS date
    FROM pqrs_masters 
    WHERE pqrs_masters.id_confirm LIKE  '${curaduriaInfo.serials.end}%'
    AND pqrs_masters.id_confirm IS NOT NULL
    ${query_id_pqr}

    UNION

    SELECT (fun_3s.id_cub)AS cub, 
    fun_0s.id_public AS id, 
    '' AS vr,
        'Citacion Vecino Colindante' AS res,
        (fun_3s.alerted) AS date
    FROM fun_3s
        INNER JOIN fun_0s ON fun_3s.fun0Id = fun_0s.id
    WHERE fun_3s.id_cub LIKE  '${curaduriaInfo.serials.end}%'
    AND fun_3s.id_cub IS NOT NULL
    ${query_id_fun}

    UNION

    SELECT (expeditions.cub1)AS cub,
    fun_0s.id_public AS id, 
    '' AS vr,
        'Acta de Viabilidad' AS res,
        (expeditions.date) AS date
    FROM expeditions
        INNER JOIN fun_0s ON expeditions.fun0Id = fun_0s.id
    WHERE expeditions.cub1 LIKE  '${curaduriaInfo.serials.end}%'
    AND expeditions.cub1 IS NOT NULL
    ${query_id_fun}

    UNION

    SELECT (expeditions.cub2)AS cub, 
    fun_0s.id_public AS id,
    '' AS vr,
        'Deberes Urbanisticos' AS res,
        (expeditions.date2) AS date
    FROM expeditions
        INNER JOIN fun_0s ON expeditions.fun0Id = fun_0s.id
    WHERE expeditions.cub2 LIKE  '${curaduriaInfo.serials.end}%'
    AND expeditions.cub2 IS NOT NULL
    ${query_id_fun}

    UNION

    SELECT (expeditions.cub3)AS cub, 
    fun_0s.id_public AS id,
    '' AS vr,
        'Citacion Notificación Resolución' AS res,
        (expeditions.cub3_json) AS date
    FROM expeditions
        INNER JOIN fun_0s ON expeditions.fun0Id = fun_0s.id
    WHERE expeditions.cub3 LIKE  '${curaduriaInfo.serials.end}%'
    AND expeditions.cub3 IS NOT NULL
    ${query_id_fun}

    UNION

    SELECT (record_phs.cub)AS cub, 
    fun_0s.id_public AS id,
    '' AS vr,
    'Citacion Notificación Resolución de Aprovación de Plano de Propiedad Horizontal' AS res,
    (record_phs.date_arc_review) AS date
    FROM record_phs
        INNER JOIN fun_0s ON record_phs.fun0Id = fun_0s.id
    WHERE record_phs.cub LIKE  '${curaduriaInfo.serials.end}%'
    AND record_phs.cub IS NOT NULL
    ${query_id_fun}

    UNION

    SELECT (record_reviews.id_public)AS cub, 
    fun_0s.id_public AS id,
    '' AS vr,
    'Acta de Observaciones y correciones' AS res,
    (record_reviews.date) AS date
    FROM record_reviews
        INNER JOIN fun_0s ON record_reviews.fun0Id = fun_0s.id
    WHERE record_reviews.id_public LIKE  '${curaduriaInfo.serials.end}%'
    AND record_reviews.id_public IS NOT NULL
    ${query_id_fun}

    ) CUBS
    ORDER BY cub  DESC
    `};

module.exports.getVRDictionary = `
SELECT
    *
FROM
    (    
SELECT (fun_0s.id_public) AS vr,
	'lic' AS 'desc'
    FROM fun_0s
    WHERE fun_0s.id_public LIKE  'VR%'
        
    UNION

  	SELECT (pqrs_masters.id_global) AS vr,
   'pqrs' AS 'desc'
    FROM pqrs_masters
    WHERE pqrs_masters.id_global LIKE  'VR%'
    
      UNION

  	SELECT (submits.id_public) AS vr,
   submits.id_related AS 'desc'
    FROM submits
    WHERE submits.id_public LIKE  'VR%'
    ) VRS
    ORDER BY vr  DESC
    `;

module.exports.getFunDictionary = `
    SELECT fun_0s.id_public, 
    fun_1s.tramite,
    fun_1s.tipo,
    fun_1s.m_urb,
    fun_1s.m_sub,
    fun_1s.m_lic,
    fun_0s.state

    FROM fun_0s
    LEFT JOIN fun_1s ON fun_1s.fun0Id = fun_0s.id AND fun_1s.version = fun_0s.version

    ORDER BY fun_0s.id_public  DESC
    `;

module.exports.getOutDictionary = `
SELECT 
    
    fun_0s.id_public, 
    fun_1s.tramite,
    fun_1s.tipo,
    fun_1s.m_urb,
    fun_1s.m_sub,
    fun_1s.m_lic,
    fun_0s.state,
    record_phs.id_public AS id_child,
    "ph" AS type

    FROM fun_0s
    INNER JOIN fun_1s ON fun_1s.fun0Id = fun_0s.id AND fun_1s.version = fun_0s.version
    INNER JOIN record_phs ON record_phs.fun0Id = fun_0s.id  AND record_phs.id_public IS NOT null AND record_phs.id_public NOT LIKE ""

    UNION

    SELECT 

    fun_0s.id_public, 
    fun_1s.tramite,
    fun_1s.tipo,
    fun_1s.m_urb,
    fun_1s.m_sub,
    fun_1s.m_lic,
    fun_0s.state,
    expeditions.id_public AS id_child,
    "exp" AS type

    FROM fun_0s
    INNER JOIN fun_1s ON fun_1s.fun0Id = fun_0s.id AND fun_1s.version = fun_0s.version
    INNER JOIN expeditions ON expeditions.fun0Id = fun_0s.id AND expeditions.id_public IS NOT null AND expeditions.id_public NOT LIKE ""

    ORDER BY id_public  DESC
    `;

module.exports.getProfDictionary = `
    SELECT 
    fun_52s.name, 
    fun_52s.surname, 
    fun_52s.id_number, 
    MAX(fun_52s.email) AS email,
    MAX(fun_52s.number) AS number, 
    MAX(fun_52s.registration) AS registration, 
    MAX(fun_52s.registration_date) AS registration_date, 
    MAX(fun_52s.docs) AS docs, 
    fun_52s.sanction
    
    FROM fun_52s
    
    GROUP BY fun_52s.id_number
    `;

module.exports.getOcDictionary = `
        SELECT id_public, description, content, id_related, related, createdAt FROM certifications ORDER BY id_public DESC
    `;

module.exports.loadProfesional = (_name) => {
    let sql = `SELECT 
    fun_52s.name, 
    fun_52s.surname, 
    fun_52s.id_number, 
    MAX(fun_52s.email) AS email,
    MAX(fun_52s.number) AS number, 
    MAX(fun_52s.registration) AS registration, 
    MAX(fun_52s.registration_date) AS registration_date, 
    fun_52s.sanction
    
    FROM fun_52s
    
    WHERE CONCAT(fun_52s.name, ' ', fun_52s.surname) LIKE '%${_name}%'
    GROUP BY fun_52s.id_number
    `;

    return sql;
}


module.exports.profHistory = (id_number) => `
    SELECT fun_0s.id_public, 
    
    GROUP_CONCAT(DISTINCT concat(fun_1s.tipo, ';', fun_1s.tramite, ';', fun_1s.m_urb, ';', fun_1s.m_sub, ';', fun_1s.m_lic) SEPARATOR '&') AS fun_1,
    GROUP_CONCAT(fun_clocks.state SEPARATOR ',') AS states, 
    GROUP_CONCAT(fun_clocks.date_start SEPARATOR ',') AS 'dates', 
    GROUP_CONCAT(DISTINCT fun_52s.role SEPARATOR ', ') AS roles,

    fun_52s.name, fun_52s.surname, fun_52s.id_number, fun_52s.registration

    FROM fun_52s

    LEFT JOIN fun_0s ON fun_0s.id = fun_52s.fun0Id
    LEFT JOIN fun_clocks ON fun_clocks.fun0Id = fun_0s.id
    LEFT JOIN fun_1s ON fun_1s.fun0Id = fun_0s.id
    AND fun_1s.version = fun_0s.version

    WHERE fun_52s.id_number LIKE '${id_number}'

    GROUP BY fun_0s.id

    ORDER BY fun_0s.id_public
`;
