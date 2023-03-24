import moment from 'moment';
import React, { Component, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { dateParser } from '../../../../components/customClasses/typeParse';
import { infoCud } from '../../../../components/jsons/vars';
import { pdfExporter } from 'quill-to-pdf';
import { jsPDF } from "jspdf";



export default function RTE_PQRS(props) {
    const { currentItem } = props

    async function exportPDF(HTML) {
        const doc = new jsPDF();
        var tag = document.createElement("div");
        var text = document.createTextNode("Tutorix is the best e-learning platform");
        tag.appendChild(HTML);
        var element = document.getElementById("hideen_pdf");
         element.appendChild(tag);
        var specialElementHandlers = {
            '#hideen_pdf': function (element, renderer) {
                return true;
            }
        };
        
        doc.fromHTML(element, 15, 15, {
            'width': 170,
            'elementHandlers': specialElementHandlers
        });
        
        // Save the PDF
        doc.save('sample-document.pdf');

        //var fileDownload = require('js-file-download');
        
        //fileDownload(pdfAsBlob, 'RESPUESTA FORMAL.pdf');
    }


    // DATA CONVERTERS
    let _getEmailList = () => {
        var array_contact_list = [];
        for (var i = 0; i < currentItem.pqrs_contacts.length; i++) {
            if (currentItem.pqrs_contacts[i].notify) array_contact_list.push(currentItem.pqrs_contacts[i].email)
        }
        return array_contact_list.join(', ');
    }
    let _getSolicitorlList = () => {
        var array_list = [];
        for (var i = 0; i < currentItem.pqrs_solocitors.length; i++) {
            array_list.push(currentItem.pqrs_solocitors[i].name)
        }
        return array_list.join(', ');
    }
    let _getAdresslList = () => {
        var array_list = [];
        for (var i = 0; i < currentItem.pqrs_contacts.length; i++) {
            if (currentItem.pqrs_contacts[i].notify) array_list.push(currentItem.pqrs_contacts[i].address)
        }
        return array_list.join(', ');
    }

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'align': ['', 'center', 'right', 'justify'] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'color': [] }, { 'background': [] }],
            ['link', 'image', 'table'],
            ['clean'],

        ],
    };

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link', 'image', 'color', 'background', 'align', 'table',
    ];
    const textHTML = `
    <p>${infoCud.city}, ${dateParser(moment().format('YYYY-MM-DD'))}</p>
    <p>${currentItem.id_publico} ${currentItem.id_reply} </p>
    <br/>
    <p>Senor(a).</p>
    <br/>
    <p>${_getSolicitorlList()}</p>
    <p>${_getEmailList()}</p>
    <p>${_getAdresslList()}</p>
    <br/>
    <p>[RESPUESTA AQUI]</p>
    `
    var [text, setText] = useState(textHTML);
    const editorRef = useRef(null)

    let onBlurEditor = () => {
        //console.log(editorRef.current.editor.editor.delta)
        let delta = editorRef.current.editor.editor.delta
        exportPDF(text)
    }
    return (
        <>
            <div>
                <ReactQuill
                    value={text}
                    onChange={setText}
                    modules={modules}
                    formats={formats}
                    ref={editorRef}


                    onBlur={() => console.log(text)}
                />
                <div id="hideen_pdf" style={{display: false}}></div>
            </div>
            <button onClick={() => onBlurEditor()}>VIEW DATA</button>
        </>
    );
}