#!/usr/bin/env python3
"""Convert 11 class components to functional components with hooks."""
import re
import os

BASE = '/home/dg21/dovela/frontend/src/app/pages/user/fun_forms/components'

def read_file(path):
    with open(path, 'r') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w') as f:
        f.write(content)

def remove_render_wrapper(content):
    """Remove render() { and its matching closing brace before class closing."""
    # Remove 'render() {' line 
    content = re.sub(r'\n    render\(\) \{\n', '\n', content)
    # Remove the last '    }' before the final '}' (render's closing brace)
    # Find the last occurrence of '    }\n}' and replace with '}'
    last_render_close = content.rfind('    }\n}')
    if last_render_close != -1:
        content = content[:last_render_close] + '}' + content[last_render_close + len('    }\n}'):]
    return content

def cleanup_this_refs(content, methods=None, state_vars=None, setters=None):
    """Global cleanup of this. references."""
    # this.props.X -> X (when destructured in function params) or props.X
    # But we need to be careful: {...this.props} should become {...props}
    content = content.replace('{...this.props}', '{...props}')
    content = content.replace('= this.props;', '= props;')
    
    # this.props. -> props. for remaining references
    # But if in render they destructure from this.props, those become direct
    # We'll replace this.props. with empty string only where the var is locally destructured
    # For safety, replace with props. first
    content = content.replace('this.props.', 'props.')
    
    # this.state.X -> X for each state var
    if state_vars:
        for var in state_vars:
            content = content.replace(f'this.state.{var}', var)
    content = content.replace('this.state.', '')  # catch any remaining
    
    # this.setState patterns
    if setters:
        for old, new in setters:
            content = content.replace(old, new)
    
    # this.methodName -> methodName 
    if methods:
        for m in methods:
            content = content.replace(f'this.{m}', m)
    
    # Catch any remaining this. (for method calls not in the list)
    # Do this carefully - only for patterns like this.someMethod(
    content = re.sub(r'this\.(\w+)\(', r'\1(', content)
    content = re.sub(r'this\.(\w+)', r'\1', content)
    
    return content

# ===================== FILE 8: clocks_control.component.js =====================
def convert_clocks_control():
    path = os.path.join(BASE, 'clocks_control.component.js')
    c = read_file(path)
    
    # 1. Import
    c = c.replace("import { Component } from 'react';", "import { useState } from 'react';")
    
    # 2. Class header -> function
    old = """class CLOCKS_CONTROL extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: 'tiempos'
        };
    }

    requestUpdate = (id) => {
        if (this.props.requestUpdate) {
            this.props.requestUpdate(id);
        }
    }
    
    requestRefresh = () => {
        if (this.props.requestRefresh) {
            this.props.requestRefresh();
        }
    }

    handleTabChange = (tabName) => {
        this.setState({ activeTab: tabName });
    }
    
    getTabLinkStyle = (tabName) => {
        const baseStyle = styles.tabLink;
        if (this.state.activeTab === tabName) {
            return { ...baseStyle, ...styles.tabLinkActive };
        }
        return baseStyle;
    }

    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion, secondary } = this.props;
        const { activeTab } = this.state;"""
    
    new = """function CLOCKS_CONTROL(props) {
    const { translation, swaMsg, globals, currentItem, currentVersion, secondary } = props;
    const [activeTab, setActiveTab] = useState('tiempos');

    const requestUpdate = (id) => {
        if (props.requestUpdate) {
            props.requestUpdate(id);
        }
    }
    
    const requestRefresh = () => {
        if (props.requestRefresh) {
            props.requestRefresh();
        }
    }

    const handleTabChange = (tabName) => {
        setActiveTab(tabName);
    }
    
    const getTabLinkStyle = (tabName) => {
        const baseStyle = styles.tabLink;
        if (activeTab === tabName) {
            return { ...baseStyle, ...styles.tabLinkActive };
        }
        return baseStyle;
    }"""
    
    c = c.replace(old, new)
    
    # 3. Cleanup remaining this. refs
    c = c.replace('{...this.props}', '{...props}')
    c = c.replace('this.requestUpdate', 'requestUpdate')
    c = c.replace('this.requestRefresh', 'requestRefresh')
    c = c.replace('this.getTabLinkStyle', 'getTabLinkStyle')
    c = c.replace('this.handleTabChange', 'handleTabChange')
    c = c.replace('this.props.', 'props.')
    
    write_file(path, c)
    # Verify
    remaining = len(re.findall(r'this\.', c))
    print(f"clocks_control.component.js: {remaining} this. remaining")
    return remaining

# ===================== FILE 6: fun_0_recipe.js =====================
def convert_fun_0_recipe():
    path = os.path.join(BASE, 'fun_0_recipe.js')
    c = read_file(path)
    
    # 1. Import
    c = c.replace("import React, { Component } from 'react';", "import React, { useState, useRef } from 'react';")
    
    # 2. Class header -> function
    old = """class FUN_0_RECIPE extends Component {
    constructor(props) {
        super(props);
        this.tagInput = React.createRef();
        this.requestUpdate = this.requestUpdate.bind(this);
        this.state = {
            tags: null,
        };
    }
    requestUpdate(id) {
        this.props.requestUpdate(id);
    }
    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion } = this.props;
        const { } = this.state;
        const MySwal = withReactContent(Swal);"""
    
    new = """function FUN_0_RECIPE(props) {
    const { translation, swaMsg, globals, currentItem, currentVersion } = props;
    const tagInput = useRef(null);
    const [tags, setTags] = useState(null);
    const MySwal = withReactContent(Swal);

    const requestUpdate = (id) => {
        props.requestUpdate(id);
    }"""
    
    c = c.replace(old, new)
    
    # 3. Fix this. refs
    c = c.replace('this.state.tags', 'tags')
    c = c.replace("this.setState({ tags: newTags })", "setTags(newTags)")
    c = c.replace('this.tagInput', 'tagInput')
    c = c.replace('this.props.requestUpdate', 'props.requestUpdate')
    c = c.replace('this.props.', 'props.')
    
    # Remove render wrapper
    c = remove_render_wrapper(c)
    
    write_file(path, c)
    remaining = len(re.findall(r'this\.', c))
    print(f"fun_0_recipe.js: {remaining} this. remaining")
    return remaining

# ===================== FILE 1: fun_clocks_email.component.js =====================
def convert_fun_clocks_email():
    path = os.path.join(BASE, 'fun_clocks_email.component.js')
    c = read_file(path)
    
    # 1. Import
    c = c.replace("import { Component } from 'react';", "import { useState, useEffect, useCallback } from 'react';")
    
    # 2. Class header -> function
    old = """class FUN_CLOCKS_EMAILS extends Component {
    constructor(props) {
        super(props);

        this.state = {
            users_list: [],
            attachsForEmails: 0,
            load: false,
        };
    }
    componentDidMount() {
        this.retrieveuUsers();
    }
    retrieveuUsers() {
        USERS_Service.getAll()
            .then(response => {
                this.setState({
                    users_list: response.data,
                    load: true
                })
                this._GET_EMAIL_BODY(this.props.email_types[0]);
            })
            .catch(e => {
                console.log(e);
                MySwal.fire({
                    title: "ERROR AL CARGAR",
                    text: "No ha sido posible cargar este item, intentelo nuevamente.",
                    icon: 'error',
                    confirmButtonText: this.props.swaMsg.text_btn,
                });
                this.setState({
                    load: false
                })
            });
    }

    minusAttachEmail() {
        this.setState({ attachsForEmails: this.state.attachsForEmails - 1 })
    }
    addAttachEmail() {
        this.setState({ attachsForEmails: this.state.attachsForEmails + 1 })
    }"""
    
    new = """function FUN_CLOCKS_EMAILS(props) {
    const [usersList, setUsersList] = useState([]);
    const [attachsForEmails, setAttachsForEmails] = useState(0);
    const [load, setLoad] = useState(false);

    useEffect(() => {
        retrieveuUsers();
    }, []);

    const retrieveuUsers = () => {
        USERS_Service.getAll()
            .then(response => {
                setUsersList(response.data);
                setLoad(true);
                _GET_EMAIL_BODY(props.email_types[0]);
            })
            .catch(e => {
                console.log(e);
                MySwal.fire({
                    title: "ERROR AL CARGAR",
                    text: "No ha sido posible cargar este item, intentelo nuevamente.",
                    icon: 'error',
                    confirmButtonText: props.swaMsg.text_btn,
                });
                setLoad(false);
            });
    }

    const minusAttachEmail = () => {
        setAttachsForEmails(attachsForEmails - 1);
    }
    const addAttachEmail = () => {
        setAttachsForEmails(attachsForEmails + 1);
    }"""
    
    c = c.replace(old, new)
    
    # 3. Fix _GET_USER method
    c = c.replace("""    _GET_USER = (_id) => {
        let _users = this.state.users_list;""",
    """    const _GET_USER = (_id) => {
        let _users = usersList;""")
    
    # 4. Fix _GET_SOLICITOR
    c = c.replace("    _GET_SOLICITOR = () => {\n        var _CHILD = this.props.currentItem.fun_53s;\n        var _CURRENT_VERSION = this.props.currentItem.version - 1;",
                   "    const _GET_SOLICITOR = () => {\n        var _CHILD = props.currentItem.fun_53s;\n        var _CURRENT_VERSION = props.currentItem.version - 1;")
    
    # 5. Fix _GET_EMAIL_BODY
    c = c.replace("    _GET_EMAIL_BODY = (_body) => {\n        let _email_body = \"\";\n        let CURRENT_ITEM = this.props.currentItem;",
                   "    const _GET_EMAIL_BODY = (_body) => {\n        let _email_body = \"\";\n        let CURRENT_ITEM = props.currentItem;")
    
    # 6. Fix render
    c = c.replace("    render() {\n        const { translation, swaMsg, globals, currentItem, attachs } = this.props;\n        const { load, attachsForEmails } = this.state;",
                   "        const { translation, swaMsg, globals, currentItem, attachs } = props;")
    
    # 7. Fix remaining this. references
    c = c.replace("this.props.email_types", "props.email_types")
    c = c.replace("this._GET_EMAIL_BODY", "_GET_EMAIL_BODY")
    c = c.replace("this.minusAttachEmail()", "minusAttachEmail()")
    c = c.replace("this.addAttachEmail()", "addAttachEmail()")
    c = c.replace("this.props.processCheck", "props.processCheck")
    c = c.replace("this.props.refreshCurrentItem", "props.refreshCurrentItem")
    c = c.replace("this.setState({ attachsForEmails: 0 })", "setAttachsForEmails(0)")
    c = c.replace("this.props.", "props.")
    c = c.replace("this.state.", "")
    
    # Remove render wrapper
    c = remove_render_wrapper(c)
    
    write_file(path, c)
    remaining = len(re.findall(r'this\.', c))
    print(f"fun_clocks_email.component.js: {remaining} this. remaining")
    return remaining

# ===================== FILE 3: fun_docs.js =====================
def convert_fun_docs():
    path = os.path.join(BASE, 'fun_docs.js')
    c = read_file(path)
    
    # 1. Import
    c = c.replace("import { Component } from 'react';", "import { useState, useEffect, useRef } from 'react';")
    
    # 2. Class header -> function  
    old = """class FUN_DOCS extends Component {
    constructor(props) {
        super(props);
        this.requestUpdate = this.requestUpdate.bind(this);
        this.state = {
            attachs: 0,
            edit: false,
            item: null,
            show_doc_1: false,
            modal_searchList: false,
            pqrsxfun: false,
            funVRList: []
        };
    }
    requestUpdate(id) {
        this.retrieveItem(id);
    }
    componentDidMount() {
        this.retrieveItem(this.props.currentId);
    }
    retrieveItem(id) {
        FUN_SERVICE.get(id)
            .then(response => {
                this.setState({
                    currentItem: response.data,
                    load: true
                })
                this.retrievePQRSxFUN(response.data.id_public);
            })
            .catch(e => {
                console.log(e);
                MySwal.fire({
                    title: "ERROR AL CARGAR",
                    text: "No ha sido posible cargar este item, intentelo nuevamente.",
                    icon: 'error',
                    confirmButtonText: this.props.swaMsg.text_btn,
                });
            });
    }
    retrievePQRSxFUN(id_public) {
        FUN_SERVICE.loadPQRSxFUN(id_public)
            .then(response => {
                this.setState({
                    pqrsxfun: response.data,
                })
            })
            .catch(e => {
                console.log(e);
            });
    }
    componentDidUpdate(prevState) {
        // Uso tipico (no olvides de comparar las props):
        if (this.state.item !== prevState.item && this.state.item != null) {
            document.getElementById('fun6_descriptions_edit').value = this.state.item.description;
            document.getElementById('fun6_codes_edit').value = this.state.item.id_public;
            document.getElementById('fun6_pages_edit').value = this.state.item.pages;
            document.getElementById('fun6_dates_edit').value = this.state.item.date;
        }
    }
    addAttach() {
        this.setState({ attachs: this.state.attachs + 1 })
    }
    minusAttach() {
        this.setState({ attachs: this.state.attachs - 1 })
    }

    async readPDF(file, i) {
        if (file.type == "application/pdf") {
            var path = (window.URL || window.webkitURL).createObjectURL(file);
            const url = path
            const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer())
            const pdfDoc = await PDFDocument.load(existingPdfBytes)
            const pages = pdfDoc.getPages().length
            document.getElementById('fun6_page_' + i).value = pages
        }
    };

    render() {
        const { translation, swaMsg, globals, currentVersion } = this.props;
        const { attachs, currentItem, funVRList } = this.state;"""
    
    new = """function FUN_DOCS(props) {
    const { translation, swaMsg, globals, currentVersion } = props;
    const [attachs, setAttachs] = useState(0);
    const [edit, setEdit] = useState(false);
    const [item, setItem] = useState(null);
    const [showDoc1, setShowDoc1] = useState(false);
    const [modalSearchList, setModalSearchList] = useState(false);
    const [pqrsxfun, setPqrsxfun] = useState(false);
    const [funVRList, setFunVRList] = useState([]);
    const [currentItem, setCurrentItem] = useState(null);
    const [load, setLoad] = useState(false);

    const retrieveItem = (id) => {
        FUN_SERVICE.get(id)
            .then(response => {
                setCurrentItem(response.data);
                setLoad(true);
                retrievePQRSxFUN(response.data.id_public);
            })
            .catch(e => {
                console.log(e);
                MySwal.fire({
                    title: "ERROR AL CARGAR",
                    text: "No ha sido posible cargar este item, intentelo nuevamente.",
                    icon: 'error',
                    confirmButtonText: props.swaMsg.text_btn,
                });
            });
    }

    const retrievePQRSxFUN = (id_public) => {
        FUN_SERVICE.loadPQRSxFUN(id_public)
            .then(response => {
                setPqrsxfun(response.data);
            })
            .catch(e => {
                console.log(e);
            });
    }

    const requestUpdate = (id) => {
        retrieveItem(id);
    }

    useEffect(() => {
        retrieveItem(props.currentId);
    }, []);

    useEffect(() => {
        if (item != null) {
            document.getElementById('fun6_descriptions_edit').value = item.description;
            document.getElementById('fun6_codes_edit').value = item.id_public;
            document.getElementById('fun6_pages_edit').value = item.pages;
            document.getElementById('fun6_dates_edit').value = item.date;
        }
    }, [item]);

    const addAttach = () => {
        setAttachs(attachs + 1);
    }
    const minusAttach = () => {
        setAttachs(attachs - 1);
    }

    const readPDF = async (file, i) => {
        if (file.type == "application/pdf") {
            var filePath = (window.URL || window.webkitURL).createObjectURL(file);
            const url = filePath;
            const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer())
            const pdfDoc = await PDFDocument.load(existingPdfBytes)
            const pages = pdfDoc.getPages().length
            document.getElementById('fun6_page_' + i).value = pages
        }
    };"""
    
    c = c.replace(old, new)
    
    # Fix this. references in the body
    c = c.replace("this.requestUpdate", "requestUpdate")
    c = c.replace("this.minusAttach()", "minusAttach()")
    c = c.replace("this.addAttach()", "addAttach()")
    c = c.replace("this.readPDF(", "readPDF(")
    c = c.replace("this.setState({ attachs: 0 });", "setAttachs(0);")
    c = c.replace("this.setState({funVRList: data})", "setFunVRList(data)")
    c = c.replace("this.props.", "props.")
    c = c.replace("this.state.", "")
    
    # Remove render wrapper
    c = remove_render_wrapper(c)
    
    write_file(path, c)
    remaining = len(re.findall(r'this\.', c))
    print(f"fun_docs.js: {remaining} this. remaining")
    return remaining

# ===================== FILE 4: fun_doc_confirmlegal.js =====================
def convert_fun_doc_confirmlegal():
    path = os.path.join(BASE, 'fun_doc_confirmlegal.js')
    c = read_file(path)
    
    # 1. Import
    c = c.replace("import { Component } from 'react';", "import { useState, useEffect } from 'react';")
    
    # 2. Class header -> function
    old = """class FUN_DOC_CONFIRMLEGAL extends Component {
    constructor(props) {
        super(props);
        this.retrieveItem = this.retrieveItem.bind(this);
        this.state = {
            load: false,
            curatedList: [],
            vrsRelated: [],
            vrSelected: null,
            cubSelected: null,
            idCUBxVr: null,
        };
    }
    componentDidMount() {
        this.retrieveItem();
    }
    componentDidUpdate(prevProps) {
        // Uso tipico (no olvides de comparar las props):
        if (this.props.currentVersion !== prevProps.currentVersion && this.props.currentVersion != null) {
            var _CHILD_1 = this._SET_CHILD_1_FOREIGNER();
            document.getElementById('geng_type').value = formsParser1(_CHILD_1)
        }
    }
    _SET_CHILD_1_FOREIGNER = () => {
        var _CHILD = this.props.currentItem.fun_1s;
        var _CURRENT_VERSION = this.props.currentVersion - 1;"""
    
    new = """function FUN_DOC_CONFIRMLEGAL(props) {
    const [load, setLoad] = useState(false);
    const [curatedList, setCuratedList] = useState([]);
    const [vrsRelated, setVrsRelated] = useState([]);
    const [vrSelected, setVrSelected] = useState(null);
    const [cubSelected, setCubSelected] = useState(null);
    const [idCUBxVr, setIdCUBxVr] = useState(null);
    const [tn, setTn] = useState(null);

    useEffect(() => {
        retrieveItem();
    }, []);

    useEffect(() => {
        if (props.currentVersion != null) {
            var _CHILD_1 = _SET_CHILD_1_FOREIGNER();
            document.getElementById('geng_type').value = formsParser1(_CHILD_1)
        }
    }, [props.currentVersion]);

    const _SET_CHILD_1_FOREIGNER = () => {
        var _CHILD = props.currentItem.fun_1s;
        var _CURRENT_VERSION = props.currentVersion - 1;"""
    
    c = c.replace(old, new)
    
    # Fix rest of _SET_CHILD_1_FOREIGNER
    c = c.replace("""                _CHILD_VARS.m_lic = _CHILD[_CURRENT_VERSION].m_lic ? _CHILD[_CURRENT_VERSION].m_lic : "";
            }
        }
        return _CHILD_VARS;

    }
    async retrieveItem() {""",
    """                _CHILD_VARS.m_lic = _CHILD[_CURRENT_VERSION].m_lic ? _CHILD[_CURRENT_VERSION].m_lic : "";
            }
        }
        return _CHILD_VARS;

    }
    const retrieveItem = async () => {""")
    
    # Fix retrieveItem body - setState calls
    c = c.replace("this.setState({ vrsRelated: response.data })", "setVrsRelated(response.data)")
    c = c.replace("this.setState({ vrSelected: data.vr, cubSelected: data.cub, idCUBxVr: data.id })",
                   "setVrSelected(data.vr); setCubSelected(data.cub); setIdCUBxVr(data.id)")
    
    # Fix setCuratedList method
    c = c.replace("""    setCuratedList(List) {""", """    const setCuratedListData = (List) => {""")
    c = c.replace("this.setState({ curatedList: newList, load: true })", "setCuratedList(newList); setLoad(true)")
    
    # Fix render
    c = c.replace("    render() {\n        const { translation, swaMsg, globals, currentItem, currentVersion, alert, VIEW_G } = this.props;",
                   "        const { translation, swaMsg, globals, currentItem, currentVersion, alert, VIEW_G } = props;")
    
    # Fix remaining this. 
    c = c.replace("this.props.swaMsg.text_btn", "props.swaMsg.text_btn")
    c = c.replace("this.props.currentItem", "props.currentItem")
    c = c.replace("this.props.currentVersion", "props.currentVersion")
    c = c.replace("this.props.requestUpdate", "props.requestUpdate")
    c = c.replace("this.props.edit", "props.edit")
    c = c.replace("this.state.vrSelected", "vrSelected")
    c = c.replace("this.state.cubSelected", "cubSelected")
    c = c.replace("this.state.idCUBxVr", "idCUBxVr")
    c = c.replace("this.state.curatedList", "curatedList")
    c = c.replace("this.state.vrsRelated", "vrsRelated")
    c = c.replace("this.state.tn", "tn")
    c = c.replace("this.setState({ 'tn': e.target.value })", "setTn(e.target.value)")
    c = c.replace("this.retrieveItem()", "retrieveItem()")
    c = c.replace("this._SET_CHILD_1_FOREIGNER", "_SET_CHILD_1_FOREIGNER")
    c = c.replace("this.props.", "props.")
    c = c.replace("this.state.", "")
    
    # Remove render wrapper
    c = remove_render_wrapper(c)
    
    write_file(path, c)
    remaining = len(re.findall(r'this\.', c))
    print(f"fun_doc_confirmlegal.js: {remaining} this. remaining")
    return remaining

# ===================== FILE 5: fun_pdf.js =====================
def convert_fun_pdf():
    path = os.path.join(BASE, 'fun_pdf.js')
    c = read_file(path)
    
    # 1. Import - remove Component
    c = c.replace("import { Component } from 'react';", "")
    
    # 2. Class header -> function (empty state)
    old = """class FUN_PDF extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }"""
    new = """function FUN_PDF(props) {"""
    c = c.replace(old, new)
    
    # 3. Convert all class methods to const functions
    # Pattern: '    _GET_CHILD_X = () => {' -> '    const _GET_CHILD_X = () => {'
    c = re.sub(r'^    (\w+) = \(', r'    const \1 = (', c, flags=re.MULTILINE)
    # Pattern for methods with different signatures
    c = re.sub(r'^    (GET_CHILD_\w+) = \(', r'    const \1 = (', c, flags=re.MULTILINE)
    
    # 4. Fix async method
    c = c.replace("    async getPdfForm() {", "    const getPdfForm = async () => {")
    
    # 5. Fix this.props references
    c = c.replace("this.props.", "props.")
    
    # 6. Fix this._GET_ method calls to just _GET_
    c = re.sub(r'this\.(_?\w+)', r'\1', c)
    
    # 7. Fix render
    c = c.replace("    render() {\n        const { translation, swaMsg, globals, currentItem, currentVersion } = this.props;",
                   "        const { translation, swaMsg, globals, currentItem, currentVersion } = props;")
    # If render destructuring is slightly different, try alternate
    c = re.sub(r'    render\(\) \{\n        const \{[^}]+\} = this\.props;', 
               lambda m: m.group(0).replace('render() {\n        ', '').replace('this.props', 'props'),
               c)
    
    # Remove render wrapper
    c = remove_render_wrapper(c)
    
    write_file(path, c)
    remaining = len(re.findall(r'this\.', c))
    print(f"fun_pdf.js: {remaining} this. remaining")
    return remaining

# ===================== FILE 10: fun_pdf_check.js =====================
def convert_fun_pdf_check():
    path = os.path.join(BASE, 'fun_pdf_check.js')
    c = read_file(path)
    
    # 1. Import
    c = c.replace("import { Component } from 'react';", "")
    
    # 2. Class header -> function (empty state)
    old = """class FUN_PDF_CHECK extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }"""
    new = """function FUN_PDF_CHECK(props) {"""
    c = c.replace(old, new)
    
    # 3. Convert class methods to const
    c = re.sub(r'^    (\w+) = \(', r'    const \1 = (', c, flags=re.MULTILINE)
    
    # 4. Fix regular method (non-arrow)
    c = c.replace("    _GET_CHILD_REVIEW() {", "    const _GET_CHILD_REVIEW = () => {")
    c = c.replace("    WordWrap(text, maxLength) {", "    const WordWrap = (text, maxLength) => {")
    c = c.replace("    async getPdfForm() {", "    const getPdfForm = async () => {")
    
    # 5. Fix this references
    c = re.sub(r'this\.props\.', 'props.', c)
    c = re.sub(r'this\.(\w+)', r'\1', c)
    
    # 6. Fix render
    c = re.sub(r'    render\(\) \{[^\n]*\n', '', c, count=1)
    
    # Remove render wrapper
    c = remove_render_wrapper(c)
    
    write_file(path, c)
    remaining = len(re.findall(r'this\.', c))
    print(f"fun_pdf_check.js: {remaining} this. remaining")
    return remaining

# ===================== FILE 9: fun_doc_confirminc.js =====================
def convert_fun_doc_confirminc():
    path = os.path.join(BASE, 'fun_doc_confirminc.js')
    c = read_file(path)
    
    # 1. Import
    c = c.replace("import { Component } from 'react';", "import { useState, useEffect } from 'react';")
    
    # 2. Class header -> function
    old = """class FUN_DOC_CONFIRM_INCOMPLETE extends Component {
    constructor(props) {
        super(props);
        this.state = {
            vrsRelated: [],
            vrSelected: null,
            cubSelected: null,
            idCUBxVr: null,
        }
    }
    componentDidUpdate(prevProps) {
        // Uso tipico (no olvides de comparar las props):
        if (this.props.currentVersion !== prevProps.currentVersion && this.props.currentVersion != null) {
            var _CHILD_1 = this._SET_CHILD_1_FOREIGNER();
            document.getElementById('geni_type').value = formsParser1(_CHILD_1)
        }
    }
    componentDidMount() {
        this.retrieveItem();
    }
    _SET_CHILD_1_FOREIGNER = () => {
        var _CHILD = this.props.currentItem.fun_1s;
        var _CURRENT_VERSION = this.props.currentVersion - 1;"""
    
    new = """function FUN_DOC_CONFIRM_INCOMPLETE(props) {
    const [vrsRelated, setVrsRelated] = useState([]);
    const [vrSelected, setVrSelected] = useState(null);
    const [cubSelected, setCubSelected] = useState(null);
    const [idCUBxVr, setIdCUBxVr] = useState(null);

    useEffect(() => {
        retrieveItem();
    }, []);

    useEffect(() => {
        if (props.currentVersion != null) {
            var _CHILD_1 = _SET_CHILD_1_FOREIGNER();
            document.getElementById('geni_type').value = formsParser1(_CHILD_1)
        }
    }, [props.currentVersion]);

    const _SET_CHILD_1_FOREIGNER = () => {
        var _CHILD = props.currentItem.fun_1s;
        var _CURRENT_VERSION = props.currentVersion - 1;"""
    
    c = c.replace(old, new)
    
    # Fix retrieveItem
    c = c.replace("    async retrieveItem() {", "    const retrieveItem = async () => {")
    c = c.replace("this.setState({ vrsRelated: response.data })", "setVrsRelated(response.data)")
    c = c.replace("""                this.setState({ vrSelected: data.vr, cubSelected: data.cub, idCUBxVr: data.id })""",
                   """                setVrSelected(data.vr); setCubSelected(data.cub); setIdCUBxVr(data.id)""")
    
    # Fix render
    c = c.replace("    render() {\n        const { translation, swaMsg, globals, currentItem, currentVersion } = this.props;",
                   "        const { translation, swaMsg, globals, currentItem, currentVersion } = props;")
    
    # Fix remaining this.
    c = c.replace("this.props.swaMsg.text_btn", "props.swaMsg.text_btn")
    c = c.replace("this.props.currentItem", "props.currentItem")
    c = c.replace("this.props.currentVersion", "props.currentVersion")
    c = c.replace("this.props.requestUpdate", "props.requestUpdate")
    c = c.replace("this.props.edit", "props.edit")
    c = c.replace("this.state.vrSelected", "vrSelected")
    c = c.replace("this.state.cubSelected", "cubSelected")
    c = c.replace("this.state.idCUBxVr", "idCUBxVr")
    c = c.replace("this.state.vrsRelated", "vrsRelated")
    c = c.replace("this.retrieveItem()", "retrieveItem()")
    c = c.replace("this._SET_CHILD_1_FOREIGNER()", "_SET_CHILD_1_FOREIGNER()")
    c = c.replace("this.props.", "props.")
    c = c.replace("this.state.", "")
    
    # Remove render wrapper
    c = remove_render_wrapper(c)
    
    write_file(path, c)
    remaining = len(re.findall(r'this\.', c))
    print(f"fun_doc_confirminc.js: {remaining} this. remaining")
    return remaining

# ===================== FILE 11: fun_checklist_n.js =====================
def convert_fun_checklist_n():
    path = os.path.join(BASE, 'fun_checklist_n.js')
    c = read_file(path)
    
    # 1. Import
    c = c.replace("import { Component } from 'react';", "import { useEffect } from 'react';")
    
    # 2. Class header -> function
    old = """class FUN_CHECKLIST_N extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    componentDidUpdate(prevProps) {
        // Uso tipico (no olvides de comparar las props):
        if (this.props.currentVersion !== prevProps.currentVersion && this.props.currentVersion != null) {
            for (var i = 0; i < fatherValues.length; i++) {
                let radios = document.getElementsByName(fatherValues[i]);
                if (radios.length) {
                    (this._CHECK_INDEXVALUE(fatherValues[i], 1)) ? radios[0].checked = true : radios[0].checked = false;
                    (this._CHECK_INDEXVALUE(fatherValues[i], 0)) ? radios[1].checked = true : radios[1].checked = false;
                    (this._CHECK_INDEXVALUE(fatherValues[i], 2)) ? radios[2].checked = true : radios[2].checked = false;
                }
            }
        }
    }
    _SET_CHILD_REVIEW() {
        var _CHILD = this.props.currentItem.fun_rs;
        var _CURRENT_VERSION = this.props.currentVersion - 1;
        if (_CHILD) {
            if (_CHILD[_CURRENT_VERSION] != null) {
                _CHILD = _CHILD[_CURRENT_VERSION]
            } else {
                _CHILD = false
            }
        }
        return _CHILD;
    }
    _CHECK_INDEXVALUE(_CODE, _VALUE) {
        const _CHILD_REVIEW = this._SET_CHILD_REVIEW();
        if (_CHILD_REVIEW) {
            let _ARRAY_OF_CODES = _CHILD_REVIEW.code.split(",");
            let _ARRAY_OF_CHECKEDS = _CHILD_REVIEW.checked.split(",");
            if (_ARRAY_OF_CODES.indexOf(_CODE) > -1) {
                let pos = _ARRAY_OF_CODES.indexOf(_CODE);
                if (_ARRAY_OF_CHECKEDS[pos] == _VALUE) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion } = this.props;"""
    
    new = """function FUN_CHECKLIST_N(props) {
    const { translation, swaMsg, globals, currentItem, currentVersion } = props;

    const _SET_CHILD_REVIEW_class = () => {
        var _CHILD = props.currentItem.fun_rs;
        var _CURRENT_VERSION = props.currentVersion - 1;
        if (_CHILD) {
            if (_CHILD[_CURRENT_VERSION] != null) {
                _CHILD = _CHILD[_CURRENT_VERSION]
            } else {
                _CHILD = false
            }
        }
        return _CHILD;
    }

    const _CHECK_INDEXVALUE_class = (_CODE, _VALUE) => {
        const _CHILD_REVIEW = _SET_CHILD_REVIEW_class();
        if (_CHILD_REVIEW) {
            let _ARRAY_OF_CODES = _CHILD_REVIEW.code.split(",");
            let _ARRAY_OF_CHECKEDS = _CHILD_REVIEW.checked.split(",");
            if (_ARRAY_OF_CODES.indexOf(_CODE) > -1) {
                let pos = _ARRAY_OF_CODES.indexOf(_CODE);
                if (_ARRAY_OF_CHECKEDS[pos] == _VALUE) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    useEffect(() => {
        if (props.currentVersion != null) {
            for (var i = 0; i < fatherValues.length; i++) {
                let radios = document.getElementsByName(fatherValues[i]);
                if (radios.length) {
                    (_CHECK_INDEXVALUE_class(fatherValues[i], 1)) ? radios[0].checked = true : radios[0].checked = false;
                    (_CHECK_INDEXVALUE_class(fatherValues[i], 0)) ? radios[1].checked = true : radios[1].checked = false;
                    (_CHECK_INDEXVALUE_class(fatherValues[i], 2)) ? radios[2].checked = true : radios[2].checked = false;
                }
            }
        }
    }, [props.currentVersion]);"""
    
    c = c.replace(old, new)
    
    # Fix remaining this. references
    c = c.replace("this.props.requestUpdate", "props.requestUpdate")
    c = c.replace("this.props.readOnly", "props.readOnly")
    c = c.replace("this.props.", "props.")
    c = c.replace("this.state.", "")
    
    # Remove render wrapper  
    c = remove_render_wrapper(c)
    
    write_file(path, c)
    remaining = len(re.findall(r'this\.', c))
    print(f"fun_checklist_n.js: {remaining} this. remaining")
    return remaining

# ===================== FILE 2: func_clock_chart.js =====================
def convert_func_clock_chart():
    path = os.path.join(BASE, 'func_clock_chart.js')
    c = read_file(path)
    
    # 1. Import
    c = c.replace("import { Component } from 'react';", "import { useState, useEffect } from 'react';")
    
    # 2. Class header -> function
    old = """class FUN_CLOCK_CHART extends Component {
    constructor(props) {
        super(props);
        this.state = {
            calendar_Data: [],
            hovered: false,
            crosshairValues: [],
            expand: true,
        };
    }
    componentDidMount() {
        this.setCalendarData();
    }"""
    
    new = """function FUN_CLOCK_CHART(props) {
    const [calendarData, setCalendarData_state] = useState([]);
    const [hovered, setHovered] = useState(false);
    const [crosshairValues, setCrosshairValues] = useState([]);
    const [expand, setExpand] = useState(true);
    const [endDate, setEndDate] = useState(null);
    const [startDate, setStartDate] = useState(null);

    useEffect(() => {
        setCalendarData();
    }, []);"""
    
    c = c.replace(old, new)
    
    # 3. Convert class methods to const
    c = c.replace("    setCalendarData() {", "    const setCalendarData = () => {")
    c = c.replace("    setCalendarNegative(clocks, version) {", "    const setCalendarNegative = (clocks, version) => {")
    c = c.replace("    addClock(calendar_clocks, date, state, event) {", "    const addClock = (calendar_clocks, date, state, event) => {")
    c = c.replace("    _GET_CLOCKS_STATE(state) {", "    const _GET_CLOCKS_STATE = (state) => {")
    c = c.replace("    _GET_CLOCKS_VERSION(version) {", "    const _GET_CLOCKS_VERSION = (version) => {")
    c = c.replace("    _REGEX_MATCH_PH(type) {", "    const _REGEX_MATCH_PH = (type) => {")
    c = c.replace("    _GET_CLOCK_STATE_VERSION(_state, _version) {", "    const _GET_CLOCK_STATE_VERSION = (_state, _version) => {")
    
    # 4. Fix this.props references 
    c = c.replace("this.props.", "props.")
    
    # 5. Fix this.state references
    c = c.replace("this.state.calendar_Data", "calendarData")
    c = c.replace("this.state.hovered", "hovered")
    c = c.replace("this.state.crosshairValues", "crosshairValues")
    c = c.replace("this.state.expand", "expand")
    c = c.replace("this.state.endDate", "endDate")
    c = c.replace("this.state.startDate", "startDate")
    c = c.replace("this.state.", "")
    
    # 6. Fix this.setState
    c = c.replace("this.setState({ endDate: _endDate, startDate: _startDate, calendar_Data: calendar_clocks })",
                   "setEndDate(_endDate); setStartDate(_startDate); setCalendarData_state(calendar_clocks)")
    c = c.replace("this.setState({ expand: !expand })", "setExpand(!expand)")
    # Handle any remaining setState patterns
    c = re.sub(r'this\.setState\(\{[^}]*\}\)', lambda m: _convert_setState(m.group(0)), c)
    
    # 7. Fix this. method calls
    c = c.replace("this.setCalendarData", "setCalendarData")
    c = c.replace("this.setCalendarNegative", "setCalendarNegative")
    c = c.replace("this.addClock", "addClock")
    c = c.replace("this._GET_CLOCKS_STATE", "_GET_CLOCKS_STATE")
    c = c.replace("this._GET_CLOCKS_VERSION", "_GET_CLOCKS_VERSION")
    c = c.replace("this._REGEX_MATCH_PH", "_REGEX_MATCH_PH")
    c = c.replace("this._GET_CLOCK_STATE_VERSION", "_GET_CLOCK_STATE_VERSION")
    
    # Catch remaining
    c = re.sub(r'this\.(\w+)', r'\1', c)
    
    # 8. Fix render
    c = re.sub(r'    render\(\) \{\n[^\n]*this\.props[^\n]*\n[^\n]*this\.state[^\n]*\n', '', c, count=1)
    # If render doesn't destructure, try simpler pattern
    if '    render() {' in c:
        c = c.replace('    render() {\n', '', 1)
    
    # Remove render wrapper
    c = remove_render_wrapper(c)
    
    write_file(path, c)
    remaining = len(re.findall(r'this\.', c))
    print(f"func_clock_chart.js: {remaining} this. remaining")
    return remaining

def _convert_setState(match_str):
    """Convert a this.setState({key: val}) to setter calls."""
    inner = match_str[len('this.setState('):-1]
    # Simple cases
    return match_str  # fallback for complex cases

# ===================== FILE 7: fun_clocks_negative.component.js =====================
def convert_fun_clocks_negative():
    path = os.path.join(BASE, 'fun_clocks_negative.component.js')
    c = read_file(path)
    
    # 1. Import
    c = c.replace("import { Component } from 'react';", "import { useState, useEffect } from 'react';")
    
    # 2. Class header -> function
    old = """class FUN_CLOCKS_NEGATIVE extends Component {
    constructor(props) {
        super(props);
        this.requestUpdate = this.requestUpdate.bind(this);
        this.manage_clock = this.manage_clock.bind(this);
        this.state = {
            fillActive: null,
        };
    }

    requestUpdate(id) {
        this.props.requestUpdate(id)
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.edit !== prevState.edit && this.state.edit != false) {
            var _ITEM = this.state.edit;
            document.getElementById("f_clock_edit_1").value = _ITEM.resolver_sattus ? _ITEM.resolver_sattus : 0;
            document.getElementById("f_clock_edit_2").value = _ITEM.resolver_id6 ? _ITEM.resolver_id6 : 0;
            document.getElementById("f_clock_edit_3").value = _ITEM.resolver_context;
            document.getElementById("f_clock_edit_4").value = _ITEM.date_start ? _ITEM.date_start : moment().format('YYYY-MM-DD');
        }
        // Verificar si hay nuevos datos para ejecutar la autoguardado
        if (this.props.currentItem !== prevProps.currentItem) {
            this.autoSaveMissingStartClock();
        }
    }

    componentDidMount() {
        this.setState({ fillActive: this.props.currentItem.state });
        this.autoSaveMissingStartClock();
    }"""
    
    new = """function FUN_CLOCKS_NEGATIVE(props) {
    const [fillActive, setFillActive] = useState(null);
    const [edit, setEdit] = useState(false);

    const requestUpdate = (id) => {
        props.requestUpdate(id)
    }

    useEffect(() => {
        if (edit != false) {
            var _ITEM = edit;
            document.getElementById("f_clock_edit_1").value = _ITEM.resolver_sattus ? _ITEM.resolver_sattus : 0;
            document.getElementById("f_clock_edit_2").value = _ITEM.resolver_id6 ? _ITEM.resolver_id6 : 0;
            document.getElementById("f_clock_edit_3").value = _ITEM.resolver_context;
            document.getElementById("f_clock_edit_4").value = _ITEM.date_start ? _ITEM.date_start : moment().format('YYYY-MM-DD');
        }
    }, [edit]);

    useEffect(() => {
        autoSaveMissingStartClock();
    }, [props.currentItem]);

    useEffect(() => {
        setFillActive(props.currentItem.state);
        autoSaveMissingStartClock();
    }, []);"""
    
    c = c.replace(old, new)
    
    # 3. Convert class methods
    c = c.replace("    // --- DATA GETTERS MOVIDOS A METODOS DE CLASE ---\n    get_child_clock() {",
                   "    // --- DATA GETTERS ---\n    const get_child_clock = () => {")
    c = c.replace("    get_clock_state_version(_state, _version) {",
                   "    const get_clock_state_version = (_state, _version) => {")
    c = c.replace("    // --- LOGICA DE AUTOGUARDADO ---\n    autoSaveMissingStartClock() {",
                   "    // --- LOGICA DE AUTOGUARDADO ---\n    const autoSaveMissingStartClock = () => {")
    c = c.replace("    // --- API ACTION ---\n    manage_clock(useMySwal, state, version, formDataClock) {",
                   "    // --- API ACTION ---\n    const manage_clock = (useMySwal, state, version, formDataClock) => {")
    
    # 4. Fix this. references
    c = c.replace("this.get_child_clock()", "get_child_clock()")
    c = c.replace("this.get_clock_state_version", "get_clock_state_version")
    c = c.replace("this.manage_clock", "manage_clock")
    c = c.replace("this.autoSaveMissingStartClock", "autoSaveMissingStartClock")
    c = c.replace("this.props.requestUpdate", "props.requestUpdate")
    c = c.replace("this.props.currentItem", "props.currentItem")
    c = c.replace("this.props.swaMsg", "props.swaMsg")
    c = c.replace("this.props.requestRefresh", "props.requestRefresh")
    c = c.replace("this.props.", "props.")
    
    # Fix state
    c = c.replace("this.state.fillActive", "fillActive")
    c = c.replace("this.state.edit", "edit")
    c = c.replace("this.state.", "")
    
    # Fix setState
    c = c.replace("this.setState({ fillActive: this.props.currentItem.state })", "setFillActive(props.currentItem.state)")
    c = c.replace("this.setState({ fillActive:", "setFillActive(")
    # Handle remaining setState patterns
    c = re.sub(r"this\.setState\(\{ edit: ([^}]+) \}\)", r"setEdit(\1)", c)
    c = re.sub(r"this\.setState\(\{([^}]*)\}\)", lambda m: _convert_setState_neg(m), c)
    
    # 5. Fix render
    c = c.replace("    render() {\n        const { translation, swaMsg, globals, currentItem, currentVersion } = this.props;\n        const { fillActive } = this.state;",
                   "        const { translation, swaMsg, globals, currentItem, currentVersion } = props;")
    
    # Remaining this. cleanup
    c = re.sub(r'this\.(\w+)', r'\1', c)
    
    # Remove render wrapper  
    c = remove_render_wrapper(c)
    
    write_file(path, c)
    remaining = len(re.findall(r'this\.', c))
    print(f"fun_clocks_negative.component.js: {remaining} this. remaining")
    return remaining

def _convert_setState_neg(match):
    inner = match.group(1).strip()
    parts = inner.split(':')
    if len(parts) == 2:
        key = parts[0].strip()
        val = parts[1].strip().rstrip(',')
        setter_map = {
            'fillActive': 'setFillActive',
            'edit': 'setEdit',
        }
        setter = setter_map.get(key, f'set{key[0].upper()}{key[1:]}')
        return f"{setter}({val})"
    return match.group(0)

# ===================== Run all conversions =====================
def main():
    total_remaining = 0
    
    print("Converting 11 class components to functional components...\n")
    
    total_remaining += convert_clocks_control()
    total_remaining += convert_fun_0_recipe()
    total_remaining += convert_fun_clocks_email()
    total_remaining += convert_fun_docs()
    total_remaining += convert_fun_doc_confirmlegal()
    total_remaining += convert_fun_pdf()
    total_remaining += convert_fun_pdf_check()
    total_remaining += convert_fun_doc_confirminc()
    total_remaining += convert_fun_checklist_n()
    total_remaining += convert_func_clock_chart()
    total_remaining += convert_fun_clocks_negative()
    
    print(f"\nTotal remaining 'this.' references across all files: {total_remaining}")
    if total_remaining > 0:
        print("Manual cleanup may be needed for remaining references.")

if __name__ == '__main__':
    main()
