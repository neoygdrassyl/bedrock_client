import { useState, useRef } from "react";
import moment from "moment";
import { dateParser } from "../../../../../components/customClasses/typeParse";
import { infoCud } from "../../../../../components/jsons/vars";

const usePqrsFinalReply = (currentItem) => {
  const editor = useRef(null);

  const get_petitioners = () => {
    return currentItem.new_pqrs_petitioners
      .filter((value) => value && value.name) 
      .map((value) => value.name.toUpperCase())
      .join(", ")
      .toUpperCase()
      ;
  };

  const get_email = () => {
    return currentItem.new_pqrs_petitioners
      .map((value) => value.email || "")
      .join(", ");
  };

  const get_phone = () => {
    return currentItem.new_pqrs_petitioners
      .filter((value) => value && value.phone) 
      .map((value) => value.phone || "")
      .join(", ");
  };

  const fontSize = "font-size: 12px !important;";

  const textdefauld = (conten) => `
    <p style="margin-left: 150px; line-height: 1.5;"><span style="font-family: arial, helvetica, sans-serif; ${fontSize}"><br></span></p> 
    <p style="margin-left: 80px; line-height: 1.5;"><span style="font-family: arial, helvetica, sans-serif; ${fontSize}"><br></span></p> 
    <p style="margin-left: 80px; line-height: 0.5;"><span style="font-family: arial, helvetica, sans-serif; ${fontSize}">${infoCud.city}, ${dateParser(moment().format("YYYY-MM-DD"))}</span></p>
    
    <p style="text-align: center; margin-left: 470px; line-height: 0.5;"><span style="font-family: arial, helvetica, sans-serif; ${fontSize}"><strong>${currentItem.id ?? ""}</strong></span></p>
    
    <p style="margin-left: 80px; line-height: 0.5;"><span style="font-family: arial, helvetica, sans-serif; ${fontSize}">Señor/a (modificar),</span></p>
  
    ${get_petitioners() ? `
      <p style="margin-left: 80px; line-height: 0.5;">
        <span style="font-family: arial, helvetica, sans-serif; ${fontSize}"><strong>${get_petitioners()}</strong></span>
      </p>` : ""}
  
    ${get_email() ? `
      <p style="margin-left: 80px; line-height: 1.5;">
        <span style="font-family: arial, helvetica, sans-serif; ${fontSize}; color: #0077cc;">
          <strong style="text-decoration: underline;">${get_email()}</strong>
        </span>
      </p>` : ""}
  
    ${get_phone() ? `
      <p style="margin-left: 80px; line-height: 0.5;">
        <span style="font-family: arial, helvetica, sans-serif; ${fontSize}">Telefono: ${get_phone()}</span>
      </p>` : ""}
  
    <p style="margin-left: 80px; line-height: 0.5;"><strong><br></strong></p>
  
    <table style="margin-left: 80px; margin-right: 80px; border: 0.5px solid black; padding:2px; border-collapse: collapse; font-family: arial, helvetica, sans-serif; ${fontSize}">
      <tr>
        <td style="width: 25%; border: 0.5px solid black; padding:2px;"><strong> Radicado interno: </strong></td>
        <td style="border: 0.5px solid black; padding:2px;"> <span>${currentItem.id_public || ""}</span> </td>
      </tr>
      <tr>
        <td style="border: 0.5px solid black; padding:2px;"><strong> Fecha de radicado: </strong></td>
        <td style="border: 0.5px solid black; padding:2px;"> <span>${dateParser(currentItem.creation_date) || ""}</span> </td>
      </tr>
      <tr>
        <td style="border: 0.5px solid black; padding:2px;"><strong> Referencia: </strong></td>
        <td style="border: 0.5px solid black; padding:2px;"> Respuesta a PQRS generada por <span style="text-decoration: underline;">${currentItem.canalIngreso || ""}</span> </td>
      </tr>
      <tr>
        <td style="border: 0.5px solid black; padding:2px;"><strong> Asociado a la Actuación: </strong></td>
        <td style="border: 0.5px solid black; padding:2px;"> ${get_petitioners()} </td>
      </tr>
      <tr>
        <td style="border: 0.5px solid black; padding:2px;"><strong> Asunto: </strong></td>
        <td style="border: 0.5px solid black; padding:2px;"> ${currentItem.desc} </td>
      </tr>
      ${currentItem.new_pqrs_clasification.id_related ? `
        <tr>
          <td style="border: 0.5px solid black; padding:2px;"><strong> Asociado a la Actuación: </strong></td>
          <td style="border: 0.5px solid black; padding:2px;"> ${currentItem.new_pqrs_clasification.id_related} </td>
        </tr>` : ""}
      <tr>
        <td style="border: 0.5px solid black; padding:2px;"><strong> Término: </strong></td>
        <td style="border: 0.5px solid black; padding:2px;"> ${currentItem.id} días hábiles</td>
      </tr>
    </table>
  
    <br/>
    <br/>
    <p style="margin-left: 80px; line-height: 0.5; ${fontSize}"">Cordial saludo,</p>
    <p style="margin-left: 80px; line-height: 0.5;"><strong><br></strong></p>
    <p style="margin-left: 80px; line-height: 0.5; font-family: arial, helvetica, sans-serif; ${fontSize}">${conten}</p>
    <p><br></p>
    <p style="margin-left: 80px; line-height: 0.5;"><br></p>
    <p style="margin-left: 80px; line-height: 0.5;">
      <strong><span style="font-family: arial, helvetica, sans-serif; ${fontSize}">Cordialmente, </span></strong>
    </p>
    <p style="margin-left: 80px; line-height: 0.5;"><strong><br></strong></p>
    <p style="margin-left: 80px; line-height: 0.5;"><strong><br></strong></p>
    <p style="margin-left: 80px; line-height: 0.5;"><strong><br></strong></p>
    <p style="margin-left: 80px; line-height: 0.5;">
      <strong><span style="font-family: arial, helvetica, sans-serif; ${fontSize}">ARQ. ${infoCud.dir}</span></strong>
    </p>
    <p style="margin-left: 80px; line-height: 0.5;">
      <strong><span style="font-family: arial, helvetica, sans-serif; ${fontSize}">${infoCud.job}</span></strong>
    </p>
    <p style="margin-left: 80px; line-height: 0.5;">
      <strong><span style="font-family: arial, helvetica, sans-serif; ${fontSize}">Revisado por:</span></strong>
    </p>
  `;
  
  const generateResponseHtml = (currentItem) => {
    if (!currentItem || !currentItem.new_pqrs_response) return "";

    const { new_pqrs_response } = currentItem;
    const responseTitles = {
      response_legal: "Respuesta Legal",
      response_arquitecture: "Respuesta Arquitectonica",
      response_structure: "Respuesta Estructural",
      response_archive: "Respuesta Archivo",
    };

    let htmlContent = "";

    Object.entries(responseTitles).forEach(([key, title]) => {
      if (new_pqrs_response[key]) {
        htmlContent += `
          <div style="margin-left: 80px; font-family: arial,helvetica, sans-serif; line-height: 1.5;">
            <h4 style="margin-bottom: 5px; font-weight: bold; color: #333;${fontSize};">${title}</h4>
            <div style="padding: 10px;">
              ${new_pqrs_response[key]}
            </div>
          </div>
        `;
      }
    });
    

    return htmlContent;
  };

  const [replyData, setReplyData] = useState(
    textdefauld(generateResponseHtml(currentItem))
  );

  // const funcion5 = () => {
  //   const y = currentItem.pqrs_workers.map(value => ` ${value.reply ?? " "} `).join(".<br> ");
  //   setReplyData(textdefauld(y));
  // };

  return { editor, replyData, setReplyData };
};

export default usePqrsFinalReply;
