#!/usr/bin/env python3
"""Convert class components to functional components in records/ directory."""
import re
import os

BASE = 'src/app/pages/user/records/'

def apply_body_replacements(content):
    """Apply common body replacements after header is done."""
    content = re.sub(r'\bthis\.props\.', '', content)
    content = re.sub(r'\bthis\.state\.', '', content)
    content = re.sub(r'\bthis\.', '', content)
    return content

def remove_class_close(content, component_name, has_nav_funa=False):
    """Remove the class-closing brace (keep render close as function close)."""
    if has_nav_funa:
        # Pattern: \n    }\n}\n\nconst NAV_FUNA
        content = content.replace('\n    }\n}\n\nconst NAV_FUNA', '\n    }\n\nconst NAV_FUNA')
    else:
        # Pattern: \n    }\n}\n\nexport default
        content = content.replace('\n    }\n}\n\nexport default', '\n    }\n\nexport default')
    return content

def count_this_refs(content):
    """Count remaining this. references (excluding comments)."""
    count = 0
    for line in content.split('\n'):
        stripped = line.strip()
        if 'this.' in line and not stripped.startswith('//') and not stripped.startswith('*') and not stripped.startswith('{/*'):
            count += 1
    return count

# ============================================================
# FILE 1: record_letter.component.js
# ============================================================
def convert_record_letter():
    filepath = BASE + 'record_letter.component.js'
    print(f"\nProcessing {filepath}...")
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    content = content.replace("import { Component } from 'react';", "import { useState, useEffect } from 'react';")
    
    old = """const MySwal = withReactContent(Swal);
class RECORD_DOC_LETTER extends Component {
    constructor(props) {
        super(props);
        this.state = {
            vrsRelated: [],
            vrSelected: null,
            cubSelected: null,
            idCUBxVr: null
        };
    }
    componentDidMount() {
        this.retrieveItem();
    }
    async retrieveItem() {
        try {
            await SubmitService.getIdRelated(this.props.currentItem.id_public).then(response => {
                this.setState({ vrsRelated: response.data })
            })
            const responseCubXVr = await CubXVrDataService.getByFUN(this.props.currentItem.id_public);
            const data = responseCubXVr.data.find(item => item.process === 'CARTA DE RATIFICACION');
            
            if(data) document.getElementById("vr_selected").value = data.vr
            this.setState({ vrSelected: data.vr, cubSelected: data.cub, idCUBxVr: data.id })
        } catch (error) {
            console.log(error);
        }
    }
    componentDidUpdate(prevProps) {
        // Uso tipico (no olvides de comparar las props):
        if (this.props.currentVersion !== prevProps.currentVersion && this.props.currentVersion != null) {
            var _CHILD_1 = this._SET_CHILD_1_FOREIGNER();
            document.getElementById('gena_type').value = formsParser1(_CHILD_1)
        }
    }
    _SET_CHILD_1_FOREIGNER = () => {
        var _CHILD = this.props.currentItem.fun_1s;
        var _CURRENT_VERSION = this.props.currentVersion - 1;
        var _CHILD_VARS = {
            tipo: [],
            tramite: [],
            m_urb: [],
            m_sub: [],
            m_lic: [],
        }
        if (_CHILD) {
            if (_CHILD[_CURRENT_VERSION] != null) {
                _CHILD_VARS.tipo = _CHILD[_CURRENT_VERSION].tipo ? _CHILD[_CURRENT_VERSION].tipo : "";
                _CHILD_VARS.tramite = _CHILD[_CURRENT_VERSION].tramite ? _CHILD[_CURRENT_VERSION].tramite : "";
                _CHILD_VARS.m_urb = _CHILD[_CURRENT_VERSION].m_urb ? _CHILD[_CURRENT_VERSION].m_urb : "";
                _CHILD_VARS.m_sub = _CHILD[_CURRENT_VERSION].m_sub ? _CHILD[_CURRENT_VERSION].m_sub : "";
                _CHILD_VARS.m_lic = _CHILD[_CURRENT_VERSION].m_lic ? _CHILD[_CURRENT_VERSION].m_lic : "";
            }
        }
        return _CHILD_VARS;

    }
    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion } = this.props;"""
    
    new = """const MySwal = withReactContent(Swal);
function RECORD_DOC_LETTER({ translation, swaMsg, globals, currentItem, currentVersion, requestUpdate, edit }) {
    const [vrsRelated, setVrsRelated] = useState([]);
    const [vrSelected, setVrSelected] = useState(null);
    const [cubSelected, setCubSelected] = useState(null);
    const [idCUBxVr, setIdCUBxVr] = useState(null);

    useEffect(() => {
        retrieveItem();
    }, []);

    useEffect(() => {
        if (currentVersion != null) {
            var _CHILD_1 = _SET_CHILD_1_FOREIGNER();
            document.getElementById('gena_type').value = formsParser1(_CHILD_1)
        }
    }, [currentVersion]);

    async function retrieveItem() {
        try {
            await SubmitService.getIdRelated(currentItem.id_public).then(response => {
                setVrsRelated(response.data);
            })
            const responseCubXVr = await CubXVrDataService.getByFUN(currentItem.id_public);
            const data = responseCubXVr.data.find(item => item.process === 'CARTA DE RATIFICACION');
            
            if(data) document.getElementById("vr_selected").value = data.vr
            setVrSelected(data.vr);
            setCubSelected(data.cub);
            setIdCUBxVr(data.id);
        } catch (error) {
            console.log(error);
        }
    }

    function _SET_CHILD_1_FOREIGNER() {
        var _CHILD = currentItem.fun_1s;
        var _CURRENT_VERSION = currentVersion - 1;
        var _CHILD_VARS = {
            tipo: [],
            tramite: [],
            m_urb: [],
            m_sub: [],
            m_lic: [],
        }
        if (_CHILD) {
            if (_CHILD[_CURRENT_VERSION] != null) {
                _CHILD_VARS.tipo = _CHILD[_CURRENT_VERSION].tipo ? _CHILD[_CURRENT_VERSION].tipo : "";
                _CHILD_VARS.tramite = _CHILD[_CURRENT_VERSION].tramite ? _CHILD[_CURRENT_VERSION].tramite : "";
                _CHILD_VARS.m_urb = _CHILD[_CURRENT_VERSION].m_urb ? _CHILD[_CURRENT_VERSION].m_urb : "";
                _CHILD_VARS.m_sub = _CHILD[_CURRENT_VERSION].m_sub ? _CHILD[_CURRENT_VERSION].m_sub : "";
                _CHILD_VARS.m_lic = _CHILD[_CURRENT_VERSION].m_lic ? _CHILD[_CURRENT_VERSION].m_lic : "";
            }
        }
        return _CHILD_VARS;
    }"""
    
    if old in content:
        content = content.replace(old, new)
        print("  Header: OK")
    else:
        print("  WARNING: Header not found!")
        return
    
    content = apply_body_replacements(content)
    content = remove_class_close(content, 'RECORD_DOC_LETTER', has_nav_funa=False)
    
    refs = count_this_refs(content)
    print(f"  Remaining this. refs: {refs}")
    
    with open(filepath, 'w') as f:
        f.write(content)
    print(f"  Written OK")

# ============================================================
# FILE 2: record_letter_2.component.js
# ============================================================
def convert_record_letter_2():
    filepath = BASE + 'record_letter_2.component.js'
    print(f"\nProcessing {filepath}...")
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    content = content.replace("import { Component } from 'react';", "import { useState, useEffect } from 'react';")
    
    old = """const MySwal = withReactContent(Swal);
class RECORD_DOC_LETTER_2 extends Component {
    constructor(props) {
        super(props);
        this.state = {
            vrsRelated: [],
            vrSelected: null,
            cubSelected: null,
            idCUBxVr: null
        };
    }
    componentDidUpdate(prevProps) {
        // Uso tipico (no olvides de comparar las props):
        if (this.props.currentVersion !== prevProps.currentVersion && this.props.currentVersion != null) {
            var _CHILD_1 = this._SET_CHILD_1_FOREIGNER();
            document.getElementById('gena_type').value = formsParser1(_CHILD_1)
        }
    }
    componentDidMount() {
        this.retrieveItem();
    }
    async retrieveItem() {
        try {
            await SubmitService.getIdRelated(this.props.currentItem.id_public).then(response => {
                this.setState({ vrsRelated: response.data })
            })
            const responseCubXVr = await CubXVrDataService.getByFUN(this.props.currentItem.id_public);
            const data = responseCubXVr.data.find(item => item.process === 'CARTA AMPLIACION DE TERMINOS');

            if(data) document.getElementById("vr_selected1").value = data.vr
            this.setState({ vrSelected: data.vr, cubSelected: data.cub, idCUBxVr: data.id })
        } catch (error) {
            console.log(error);
        }
    }
    _SET_CHILD_1_FOREIGNER = () => {
        var _CHILD = this.props.currentItem.fun_1s;
        var _CURRENT_VERSION = this.props.currentVersion - 1;
        var _CHILD_VARS = {
            tipo: [],
            tramite: [],
            m_urb: [],
            m_sub: [],
            m_lic: [],
        }
        if (_CHILD) {
            if (_CHILD[_CURRENT_VERSION] != null) {
                _CHILD_VARS.tipo = _CHILD[_CURRENT_VERSION].tipo ? _CHILD[_CURRENT_VERSION].tipo : "";
                _CHILD_VARS.tramite = _CHILD[_CURRENT_VERSION].tramite ? _CHILD[_CURRENT_VERSION].tramite : "";
                _CHILD_VARS.m_urb = _CHILD[_CURRENT_VERSION].m_urb ? _CHILD[_CURRENT_VERSION].m_urb : "";
                _CHILD_VARS.m_sub = _CHILD[_CURRENT_VERSION].m_sub ? _CHILD[_CURRENT_VERSION].m_sub : "";
                _CHILD_VARS.m_lic = _CHILD[_CURRENT_VERSION].m_lic ? _CHILD[_CURRENT_VERSION].m_lic : "";
            }
        }
        return _CHILD_VARS;

    }
    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion } = this.props;"""
    
    new = """const MySwal = withReactContent(Swal);
function RECORD_DOC_LETTER_2({ translation, swaMsg, globals, currentItem, currentVersion, requestUpdate, edit }) {
    const [vrsRelated, setVrsRelated] = useState([]);
    const [vrSelected, setVrSelected] = useState(null);
    const [cubSelected, setCubSelected] = useState(null);
    const [idCUBxVr, setIdCUBxVr] = useState(null);

    useEffect(() => {
        retrieveItem();
    }, []);

    useEffect(() => {
        if (currentVersion != null) {
            var _CHILD_1 = _SET_CHILD_1_FOREIGNER();
            document.getElementById('gena_type').value = formsParser1(_CHILD_1)
        }
    }, [currentVersion]);

    async function retrieveItem() {
        try {
            await SubmitService.getIdRelated(currentItem.id_public).then(response => {
                setVrsRelated(response.data);
            })
            const responseCubXVr = await CubXVrDataService.getByFUN(currentItem.id_public);
            const data = responseCubXVr.data.find(item => item.process === 'CARTA AMPLIACION DE TERMINOS');

            if(data) document.getElementById("vr_selected1").value = data.vr
            setVrSelected(data.vr);
            setCubSelected(data.cub);
            setIdCUBxVr(data.id);
        } catch (error) {
            console.log(error);
        }
    }

    function _SET_CHILD_1_FOREIGNER() {
        var _CHILD = currentItem.fun_1s;
        var _CURRENT_VERSION = currentVersion - 1;
        var _CHILD_VARS = {
            tipo: [],
            tramite: [],
            m_urb: [],
            m_sub: [],
            m_lic: [],
        }
        if (_CHILD) {
            if (_CHILD[_CURRENT_VERSION] != null) {
                _CHILD_VARS.tipo = _CHILD[_CURRENT_VERSION].tipo ? _CHILD[_CURRENT_VERSION].tipo : "";
                _CHILD_VARS.tramite = _CHILD[_CURRENT_VERSION].tramite ? _CHILD[_CURRENT_VERSION].tramite : "";
                _CHILD_VARS.m_urb = _CHILD[_CURRENT_VERSION].m_urb ? _CHILD[_CURRENT_VERSION].m_urb : "";
                _CHILD_VARS.m_sub = _CHILD[_CURRENT_VERSION].m_sub ? _CHILD[_CURRENT_VERSION].m_sub : "";
                _CHILD_VARS.m_lic = _CHILD[_CURRENT_VERSION].m_lic ? _CHILD[_CURRENT_VERSION].m_lic : "";
            }
        }
        return _CHILD_VARS;
    }"""
    
    if old in content:
        content = content.replace(old, new)
        print("  Header: OK")
    else:
        print("  WARNING: Header not found!")
        return
    
    content = apply_body_replacements(content)
    content = remove_class_close(content, 'RECORD_DOC_LETTER_2', has_nav_funa=False)
    
    refs = count_this_refs(content)
    print(f"  Remaining this. refs: {refs}")
    
    with open(filepath, 'w') as f:
        f.write(content)
    print(f"  Written OK")

# ============================================================
# FILE 3: record_ph.js
# ============================================================
def convert_record_ph():
    filepath = BASE + 'record_ph.js'
    print(f"\nProcessing {filepath}...")
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    content = content.replace("import { Component } from 'react';", "import { useState, useEffect } from 'react';")
    
    old = """class RECORD_PH extends Component {
    constructor(props) {
        super(props);
        this.setItem_RecordArc = this.setItem_RecordArc.bind(this);
        this.requestUpdateRecord = this.requestUpdateRecord.bind(this);
        this.requestUpdate = this.requestUpdate.bind(this);
        this.retrieveItem = this.retrieveItem.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.state = {
            currentRecord: null,
            currentVersionR: null,
            loaded: false,
        };
    }
    componentDidMount() {
        this.setItem_RecordArc();
        this.retrieveItem(this.props.currentId);
    }
    setItem_RecordArc() {
        RECORD_PH_SERVICE.getRecord(this.props.currentId)
            .then(response => {
                if (response.data.length < 1) {
                    this.setState({
                        currentRecord: null,
                        currentVersionR: null,
                        loaded: true,
                    });
                } else {
                    this.setState({
                        currentRecord: response.data[0],
                        currentVersionR: response.data[0].version,
                        loaded: true,
                    });
                }
            })
            .catch(e => {
                console.log(e);
                MySwal.fire({
                    title: this.props.swaMsg.generic_eror_title,
                    text: this.props.swaMsg.generic_error_text,
                    icon: 'warning',
                    confirmButtonText: this.props.swaMsg.text_btn,
                });
            });
    }
    requestUpdateRecord(id) {
        RECORD_PH_SERVICE.getRecord(id)
            .then(response => {
                this.setState({
                    currentRecord: response.data[0],
                    currentVersionR: response.data[0].version,
                    loaded: true,
                });
            })
            .catch(e => {
                console.log(e);
            });
    }
    requestUpdate(id) {
        this.props.requestUpdate(id);
    }
    closeModal() {
        this.props.closeModal();
        this.props.requesRefresh();
    }
    retrieveItem(id) {
        FUN_SERVICE.get(id)
            .then(response => {
                this.setState({
                    currentItem: response.data,
                    load: true
                })
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
    navigation_version = (STEP) => {
        switch (STEP) {
            case "minus":
                this.setState({ currentVersionR: this.state.currentVersionR - 1 });
                break;
            case "plus":
                this.setState({ currentVersionR: this.state.currentVersionR + 1 });
                break;
        }
    }
    render() {
        const { translation, swaMsg, globals, currentVersion } = this.props;
        const { loaded, currentRecord, currentVersionR, currentItem } = this.state;"""
    
    new = """function RECORD_PH({ translation, swaMsg, globals, currentVersion, currentId, NAVIGATION, requestUpdate, closeModal: closeModalProp, requesRefresh }) {
    const [currentRecord, setCurrentRecord] = useState(null);
    const [currentVersionR, setCurrentVersionR] = useState(null);
    const [loaded, setLoaded] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);

    useEffect(() => {
        setItem_RecordArc();
        retrieveItem(currentId);
    }, []);

    function setItem_RecordArc() {
        RECORD_PH_SERVICE.getRecord(currentId)
            .then(response => {
                if (response.data.length < 1) {
                    setCurrentRecord(null);
                    setCurrentVersionR(null);
                    setLoaded(true);
                } else {
                    setCurrentRecord(response.data[0]);
                    setCurrentVersionR(response.data[0].version);
                    setLoaded(true);
                }
            })
            .catch(e => {
                console.log(e);
                MySwal.fire({
                    title: swaMsg.generic_eror_title,
                    text: swaMsg.generic_error_text,
                    icon: 'warning',
                    confirmButtonText: swaMsg.text_btn,
                });
            });
    }

    function requestUpdateRecord(id) {
        RECORD_PH_SERVICE.getRecord(id)
            .then(response => {
                setCurrentRecord(response.data[0]);
                setCurrentVersionR(response.data[0].version);
                setLoaded(true);
            })
            .catch(e => {
                console.log(e);
            });
    }

    function closeModal() {
        closeModalProp();
        requesRefresh();
    }

    function retrieveItem(id) {
        FUN_SERVICE.get(id)
            .then(response => {
                setCurrentItem(response.data);
            })
            .catch(e => {
                console.log(e);
                MySwal.fire({
                    title: "ERROR AL CARGAR",
                    text: "No ha sido posible cargar este item, intentelo nuevamente.",
                    icon: 'error',
                    confirmButtonText: swaMsg.text_btn,
                });
            });
    }

    function navigation_version(STEP) {
        switch (STEP) {
            case "minus":
                setCurrentVersionR(prev => prev - 1);
                break;
            case "plus":
                setCurrentVersionR(prev => prev + 1);
                break;
        }
    }"""
    
    if old in content:
        content = content.replace(old, new)
        print("  Header: OK")
    else:
        print("  WARNING: Header not found!")
        return
    
    # Remove formData declaration that uses state destructuring
    content = content.replace("        var formData = new FormData();\n", "        var formData = new FormData();\n")
    
    content = apply_body_replacements(content)
    content = remove_class_close(content, 'RECORD_PH', has_nav_funa=True)
    
    refs = count_this_refs(content)
    print(f"  Remaining this. refs: {refs}")
    
    with open(filepath, 'w') as f:
        f.write(content)
    print(f"  Written OK")

# ============================================================
# FILE 4: record_law.js
# ============================================================
def convert_record_law():
    filepath = BASE + 'record_law.js'
    print(f"\nProcessing {filepath}...")
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    content = content.replace("import { Component } from 'react';", "import { useState, useEffect } from 'react';")
    
    old = """class RECORD_LAW extends Component {
    constructor(props) {
        super(props);
        this.setItem_RecordArc = this.setItem_RecordArc.bind(this);
        this.requestUpdateRecord = this.requestUpdateRecord.bind(this);
        this.requestUpdate = this.requestUpdate.bind(this);
        this.retrieveItem = this.retrieveItem.bind(this);
        this.retrievePQRSxFUN = this.retrievePQRSxFUN.bind(this);
        this.state = {
            currentRecord: null,
            currentVersionR: null,
            loaded: false,
            pqrsxfun: false,
            currentItem: null,
        };
    }
    componentDidMount() {
        this.setItem_RecordArc();
        this.retrieveItem(this.props.currentId);
    }
    setItem_RecordArc() {
        RECORD_LAW_SERVICE.getRecord(this.props.currentId)
            .then(response => {
                if (response.data.length < 1) {
                    this.setState({
                        currentRecord: null,
                        currentVersionR: null,
                        loaded: true,
                    });
                } else {
                    this.setState({
                        currentRecord: response.data[0],
                        currentVersionR: response.data[0].version,
                        loaded: true,
                    });
                }
            })
            .catch(e => {
                console.log(e);
                MySwal.fire({
                    title: this.props.swaMsg.generic_eror_title,
                    text: this.props.swaMsg.generic_error_text,
                    icon: 'warning',
                    confirmButtonText: this.props.swaMsg.text_btn,
                });
            });
    }
    requestUpdateRecord(id) {
        RECORD_LAW_SERVICE.getRecord(id)
            .then(response => {
                this.setState({
                    currentRecord: response.data[0],
                    currentVersionR: response.data[0].version,
                    loaded: true,
                });
            })
            .catch(e => {
                console.log(e);
            });
    }
    requestUpdate(id) {
        this.retrieveItem(id);
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
    navigation_version = (STEP) => {
        switch (STEP) {
            case "minus":
                this.setState({ currentVersionR: this.state.currentVersionR - 1 });
                break;
            case "plus":
                this.setState({ currentVersionR: this.state.currentVersionR + 1 });
                break;
        }
    }
    render() {
        const { translation, swaMsg, globals, currentVersion } = this.props;
        const { loaded, currentRecord, currentVersionR, currentItem } = this.state;"""
    
    new = """function RECORD_LAW({ translation, swaMsg, globals, currentVersion, currentId, NAVIGATION }) {
    const [currentRecord, setCurrentRecord] = useState(null);
    const [currentVersionR, setCurrentVersionR] = useState(null);
    const [loaded, setLoaded] = useState(false);
    const [pqrsxfun, setPqrsxfun] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);

    useEffect(() => {
        setItem_RecordArc();
        retrieveItem(currentId);
    }, []);

    function setItem_RecordArc() {
        RECORD_LAW_SERVICE.getRecord(currentId)
            .then(response => {
                if (response.data.length < 1) {
                    setCurrentRecord(null);
                    setCurrentVersionR(null);
                    setLoaded(true);
                } else {
                    setCurrentRecord(response.data[0]);
                    setCurrentVersionR(response.data[0].version);
                    setLoaded(true);
                }
            })
            .catch(e => {
                console.log(e);
                MySwal.fire({
                    title: swaMsg.generic_eror_title,
                    text: swaMsg.generic_error_text,
                    icon: 'warning',
                    confirmButtonText: swaMsg.text_btn,
                });
            });
    }

    function requestUpdateRecord(id) {
        RECORD_LAW_SERVICE.getRecord(id)
            .then(response => {
                setCurrentRecord(response.data[0]);
                setCurrentVersionR(response.data[0].version);
                setLoaded(true);
            })
            .catch(e => {
                console.log(e);
            });
    }

    function requestUpdate(id) {
        retrieveItem(id);
    }

    function retrieveItem(id) {
        FUN_SERVICE.get(id)
            .then(response => {
                setCurrentItem(response.data);
                retrievePQRSxFUN(response.data.id_public);
            })
            .catch(e => {
                console.log(e);
                MySwal.fire({
                    title: "ERROR AL CARGAR",
                    text: "No ha sido posible cargar este item, intentelo nuevamente.",
                    icon: 'error',
                    confirmButtonText: swaMsg.text_btn,
                });
            });
    }

    function retrievePQRSxFUN(id_public) {
        FUN_SERVICE.loadPQRSxFUN(id_public)
            .then(response => {
                setPqrsxfun(response.data);
            })
            .catch(e => {
                console.log(e);
            });
    }

    function navigation_version(STEP) {
        switch (STEP) {
            case "minus":
                setCurrentVersionR(prev => prev - 1);
                break;
            case "plus":
                setCurrentVersionR(prev => prev + 1);
                break;
        }
    }"""
    
    if old in content:
        content = content.replace(old, new)
        print("  Header: OK")
    else:
        print("  WARNING: Header not found!")
        return
    
    content = apply_body_replacements(content)
    content = remove_class_close(content, 'RECORD_LAW', has_nav_funa=True)
    
    refs = count_this_refs(content)
    print(f"  Remaining this. refs: {refs}")
    
    with open(filepath, 'w') as f:
        f.write(content)
    print(f"  Written OK")

# ============================================================
# FILE 5: record_arc.js
# ============================================================
def convert_record_arc():
    filepath = BASE + 'record_arc.js'
    print(f"\nProcessing {filepath}...")
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    content = content.replace("import { Component } from 'react';", "import { useState, useEffect } from 'react';")
    
    old = """class RECORD_ARC extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentRecord: null,
            currentVersionR: null,
            loaded: false,
            pqrsxfun: false,
            currentItem: null,
        };
        this.requestUpdateRecord = this.requestUpdateRecord.bind(this);
        this.retrievePQRSxFUN = this.retrievePQRSxFUN.bind(this);
        this.retrieveItem = this.retrieveItem.bind(this);
        this.setItem_RecordArc = this.setItem_RecordArc.bind(this);
        this.requestUpdate = this.requestUpdate.bind(this);
    }
    componentDidMount() {
        this.setItem_RecordArc();
        this.retrieveItem(this.props.currentId);
    }

    setItem_RecordArc(id) {
        RECORD_ARCSERVICE.getRecord(id || this.props.currentId)
            .then(response => {
                let record_arc = response.data.record_arc
                record_arc.record_arc_steps = response.data.record_arc_steps;
                record_arc.record_arc_33_areas = response.data.record_arc_33_areas;
                record_arc.record_arc_34_ks = response.data.record_arc_34_ks;
                record_arc.record_arc_34_gens = response.data.record_arc_34_gens;
                record_arc.record_arc_35_parkings = response.data.record_arc_35_parkings;
                record_arc.record_arc_36_infos = response.data.record_arc_36_infos;
                record_arc.record_arc_37s = response.data.record_arc_37s;
                record_arc.record_arc_35_locations = response.data.record_arc_35_locations;
                record_arc.record_arc_38s = response.data.record_arc_38s;
                
                this.setState({
                    currentRecord: record_arc,
                    currentVersionR: record_arc.version,
                    loaded: true,
                });
               
            })
            .catch(e => {
                console.log(e);
                MySwal.fire({
                    title: this.props.swaMsg.generic_eror_title,
                    text: this.props.swaMsg.generic_error_text,
                    icon: 'warning',
                    confirmButtonText: this.props.swaMsg.text_btn,
                });
            });
    }

    requestUpdateRecord(id) {
        this.setItem_RecordArc(id);
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

    retrieveItem(id) {
        FUN_SERVICE.get(id)
            .then(response => {
                this.setState({
                    currentItem: response.data,
                    loaded: true
                });
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
    requestUpdate(id) {
        this.retrieveItem(id);
    }
    navigation_version = (STEP) => {
        switch (STEP) {
            case "minus":
                this.setState({ currentVersionR: this.state.currentVersionR - 1 });
                break;
            case "plus":
                this.setState({ currentVersionR: this.state.currentVersionR + 1 });
                break;
        }
    }
    render() {
        const { translation, swaMsg, globals, currentVersion } = this.props;
        const { loaded, currentRecord, currentVersionR, currentItem } = this.state;"""
    
    new = """function RECORD_ARC({ translation, swaMsg, globals, currentVersion, currentId, NAVIGATION }) {
    const [currentRecord, setCurrentRecord] = useState(null);
    const [currentVersionR, setCurrentVersionR] = useState(null);
    const [loaded, setLoaded] = useState(false);
    const [pqrsxfun, setPqrsxfun] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);

    useEffect(() => {
        setItem_RecordArc();
        retrieveItem(currentId);
    }, []);

    function setItem_RecordArc(id) {
        RECORD_ARCSERVICE.getRecord(id || currentId)
            .then(response => {
                let record_arc = response.data.record_arc
                record_arc.record_arc_steps = response.data.record_arc_steps;
                record_arc.record_arc_33_areas = response.data.record_arc_33_areas;
                record_arc.record_arc_34_ks = response.data.record_arc_34_ks;
                record_arc.record_arc_34_gens = response.data.record_arc_34_gens;
                record_arc.record_arc_35_parkings = response.data.record_arc_35_parkings;
                record_arc.record_arc_36_infos = response.data.record_arc_36_infos;
                record_arc.record_arc_37s = response.data.record_arc_37s;
                record_arc.record_arc_35_locations = response.data.record_arc_35_locations;
                record_arc.record_arc_38s = response.data.record_arc_38s;
                
                setCurrentRecord(record_arc);
                setCurrentVersionR(record_arc.version);
                setLoaded(true);
            })
            .catch(e => {
                console.log(e);
                MySwal.fire({
                    title: swaMsg.generic_eror_title,
                    text: swaMsg.generic_error_text,
                    icon: 'warning',
                    confirmButtonText: swaMsg.text_btn,
                });
            });
    }

    function requestUpdateRecord(id) {
        setItem_RecordArc(id);
    }

    function retrievePQRSxFUN(id_public) {
        FUN_SERVICE.loadPQRSxFUN(id_public)
            .then(response => {
                setPqrsxfun(response.data);
            })
            .catch(e => {
                console.log(e);
            });
    }

    function retrieveItem(id) {
        FUN_SERVICE.get(id)
            .then(response => {
                setCurrentItem(response.data);
                setLoaded(true);
                retrievePQRSxFUN(response.data.id_public);
            })
            .catch(e => {
                console.log(e);
                MySwal.fire({
                    title: "ERROR AL CARGAR",
                    text: "No ha sido posible cargar este item, intentelo nuevamente.",
                    icon: 'error',
                    confirmButtonText: swaMsg.text_btn,
                });
            });
    }

    function requestUpdate(id) {
        retrieveItem(id);
    }

    function navigation_version(STEP) {
        switch (STEP) {
            case "minus":
                setCurrentVersionR(prev => prev - 1);
                break;
            case "plus":
                setCurrentVersionR(prev => prev + 1);
                break;
        }
    }"""
    
    if old in content:
        content = content.replace(old, new)
        print("  Header: OK")
    else:
        print("  WARNING: Header not found!")
        return
    
    content = apply_body_replacements(content)
    content = remove_class_close(content, 'RECORD_ARC', has_nav_funa=True)
    
    refs = count_this_refs(content)
    print(f"  Remaining this. refs: {refs}")
    
    with open(filepath, 'w') as f:
        f.write(content)
    print(f"  Written OK")

# ============================================================
# FILE 6: record_eng.js
# ============================================================
def convert_record_eng():
    filepath = BASE + 'record_eng.js'
    print(f"\nProcessing {filepath}...")
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    content = content.replace("import { Component } from 'react';", "import { useState, useEffect } from 'react';")
    
    old = """class RECORD_ENG extends Component {
    constructor(props) {
        super(props);
        this.setItem_RecordArc = this.setItem_RecordArc.bind(this);
        this.loadArcSteps = this.loadArcSteps.bind(this);
        this.requestUpdateRecord = this.requestUpdateRecord.bind(this);
        this.requestUpdate = this.requestUpdate.bind(this);
        this.retrieveItem = this.retrieveItem.bind(this);
        this.state = {
            currentRecord: null,
            currentVersionR: null,
            loaded: false,
            pqrsxfun: false,
            arcSteps: [],
        };
    }
    componentDidMount() {
        this.setItem_RecordArc();
        this.retrieveItem(this.props.currentId);
        this.loadArcSteps(this.props.currentId)
    }
    loadArcSteps(id) {
        RECORD_ARCSERVICE.getSteps(id)
            .then(response => {
                if (response.data.length < 1) {
                    this.setState({
                        arcSteps: [],
                    });
                } else {
                    this.setState({
                        arcSteps: response.data.record_arc_steps,
                    });
                }
            })
            .catch(e => {
                console.log(e);
            });
    }
    setItem_RecordArc() {
        RECORD_ENG_SERVICE.findIdRelated(this.props.currentId)
            .then(response => {
                if (response.data.length < 1) {
                    this.setState({
                        currentRecord: null,
                        currentVersionR: null,
                        loaded: true,
                    });
                } else {
                    this.setState({
                        currentRecord: response.data[0],
                        currentVersionR: response.data[0].version,
                        loaded: true,
                    });
                }
            })
            .catch(e => {
                console.log(e);
                MySwal.fire({
                    title: this.props.swaMsg.generic_eror_title,
                    text: this.props.swaMsg.generic_error_text,
                    icon: 'warning',
                    confirmButtonText: this.props.swaMsg.text_btn,
                });
            });
    }
    requestUpdateRecord(id) {
        RECORD_ENG_SERVICE.findIdRelated(id)
            .then(response => {
                this.setState({
                    currentRecord: response.data[0],
                    currentVersionR: response.data[0].version,
                    loaded: true,
                });
            })
            .catch(e => {
                console.log(e);
            });
    }
    requestUpdate(id) {
        this.retrieveItem(id);
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
    navigation_version = (STEP) => {
        switch (STEP) {
            case "minus":
                this.setState({ currentVersionR: this.state.currentVersionR - 1 });
                break;
            case "plus":
                this.setState({ currentVersionR: this.state.currentVersionR + 1 });
                break;
        }
    }
    render() {
        const { translation, swaMsg, globals, currentVersion } = this.props;
        const { loaded, currentRecord, currentVersionR, currentItem, arcSteps } = this.state;"""
    
    new = """function RECORD_ENG({ translation, swaMsg, globals, currentVersion, currentId, NAVIGATION }) {
    const [currentRecord, setCurrentRecord] = useState(null);
    const [currentVersionR, setCurrentVersionR] = useState(null);
    const [loaded, setLoaded] = useState(false);
    const [pqrsxfun, setPqrsxfun] = useState(false);
    const [arcSteps, setArcSteps] = useState([]);
    const [currentItem, setCurrentItem] = useState(null);

    useEffect(() => {
        setItem_RecordArc();
        retrieveItem(currentId);
        loadArcSteps(currentId);
    }, []);

    function loadArcSteps(id) {
        RECORD_ARCSERVICE.getSteps(id)
            .then(response => {
                if (response.data.length < 1) {
                    setArcSteps([]);
                } else {
                    setArcSteps(response.data.record_arc_steps);
                }
            })
            .catch(e => {
                console.log(e);
            });
    }

    function setItem_RecordArc() {
        RECORD_ENG_SERVICE.findIdRelated(currentId)
            .then(response => {
                if (response.data.length < 1) {
                    setCurrentRecord(null);
                    setCurrentVersionR(null);
                    setLoaded(true);
                } else {
                    setCurrentRecord(response.data[0]);
                    setCurrentVersionR(response.data[0].version);
                    setLoaded(true);
                }
            })
            .catch(e => {
                console.log(e);
                MySwal.fire({
                    title: swaMsg.generic_eror_title,
                    text: swaMsg.generic_error_text,
                    icon: 'warning',
                    confirmButtonText: swaMsg.text_btn,
                });
            });
    }

    function requestUpdateRecord(id) {
        RECORD_ENG_SERVICE.findIdRelated(id)
            .then(response => {
                setCurrentRecord(response.data[0]);
                setCurrentVersionR(response.data[0].version);
                setLoaded(true);
            })
            .catch(e => {
                console.log(e);
            });
    }

    function requestUpdate(id) {
        retrieveItem(id);
    }

    function retrieveItem(id) {
        FUN_SERVICE.get(id)
            .then(response => {
                setCurrentItem(response.data);
                retrievePQRSxFUN(response.data.id_public);
            })
            .catch(e => {
                console.log(e);
                MySwal.fire({
                    title: "ERROR AL CARGAR",
                    text: "No ha sido posible cargar este item, intentelo nuevamente.",
                    icon: 'error',
                    confirmButtonText: swaMsg.text_btn,
                });
            });
    }

    function retrievePQRSxFUN(id_public) {
        FUN_SERVICE.loadPQRSxFUN(id_public)
            .then(response => {
                setPqrsxfun(response.data);
            })
            .catch(e => {
                console.log(e);
            });
    }

    function navigation_version(STEP) {
        switch (STEP) {
            case "minus":
                setCurrentVersionR(prev => prev - 1);
                break;
            case "plus":
                setCurrentVersionR(prev => prev + 1);
                break;
        }
    }"""
    
    if old in content:
        content = content.replace(old, new)
        print("  Header: OK")
    else:
        print("  WARNING: Header not found!")
        return
    
    content = apply_body_replacements(content)
    content = remove_class_close(content, 'RECORD_ENG', has_nav_funa=True)
    
    refs = count_this_refs(content)
    print(f"  Remaining this. refs: {refs}")
    
    with open(filepath, 'w') as f:
        f.write(content)
    print(f"  Written OK")

# ============================================================
# FILE 7: record_review.js
# ============================================================
def convert_record_review():
    filepath = BASE + 'record_review.js'
    print(f"\nProcessing {filepath}...")
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    content = content.replace("import { Component } from 'react';", "import { useState, useEffect } from 'react';")
    
    old = """class RECORD_REVIEW extends Component {
    constructor(props) {
        super(props);
        this.setItem_Record = this.setItem_Record.bind(this);
        this.requestUpdateRecord = this.requestUpdateRecord.bind(this);
        this.requestUpdate = this.requestUpdate.bind(this);
        this.retrieveItem = this.retrieveItem.bind(this);
        this.state = {
            currentRecord: null,
            currentVersionR: null,
            loaded: false,
            currentStepIndex: 0,
            pqrsxfun: false,
            vrsRelated: [],
            vrSelected: null,
            cubSelected: null,
            idCUBxVr: null,
        };
    }
    componentDidMount() {
        this.setItem_Record();
        this.retrieveItem(this.props.currentId);
    }
    setItem_Record() {
        RECORD_REVIEW_SERVICE.getRecord(this.props.currentId)
            .then(response => {
                if (response.data.length < 1) {
                    this.setState({
                        currentRecord: null,
                        currentVersionR: null,
                        loaded: true,
                    });
                } else {
                    this.setState({
                        currentRecord: response.data[0],
                        currentVersionR: response.data[0].version,
                        loaded: true,
                    });
                }
            })
            .catch(e => {
                console.log(e);
                MySwal.fire({
                    title: this.props.swaMsg.generic_eror_title,
                    text: this.props.swaMsg.generic_error_text,
                    icon: 'warning',
                    confirmButtonText: this.props.swaMsg.text_btn,
                });
            });
    }
    requestUpdateRecord(id) {
        RECORD_REVIEW_SERVICE.getRecord(id)
            .then(response => {
                this.setState({
                    currentRecord: response.data[0],
                    currentVersionR: response.data[0].version,
                    loaded: true,
                });
            })
            .catch(e => {
                console.log(e);
            });
    }
    requestUpdate(id) {
        this.props.requestUpdate(id);
    }
    retrieveItem(id) {
        FUN_SERVICE.get(id)
            .then(response => {
                this.setState({
                    currentItem: response.data,
                    load: true
                })
                this.retrievePQRSxFUN(response.data.id_public);
                SubmitService.getIdRelated(response.data.id_public).then(resres => {
                    this.setState({ vrsRelated: resres.data })
                })
                this.retrieveCubXvrs(response.data.id_public)
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
    async retrieveCubXvrs(id_public) {
        console.log(id_public)
        const response = await CubXVrDataService.getByFUN(id_public)
        const data = response.data.find(item => item.process === 'OBSERVACIONES Y CORRECIONES')

        if (data) {
            document.getElementById("vr_selected11").value = data.vr
            this.setState({ vrSelected: data.vr, cubSelected: data.cub, idCUBxVr: data.id })
        }
    }"""
    
    new = """function RECORD_REVIEW({ translation, swaMsg, globals, currentVersion, currentId, NAVIGATION, requestUpdate: requestUpdateProp, closeModal: closeModalProp }) {
    const [currentRecord, setCurrentRecord] = useState(null);
    const [currentVersionR, setCurrentVersionR] = useState(null);
    const [loaded, setLoaded] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [pqrsxfun, setPqrsxfun] = useState(false);
    const [vrsRelated, setVrsRelated] = useState([]);
    const [vrSelected, setVrSelected] = useState(null);
    const [cubSelected, setCubSelected] = useState(null);
    const [idCUBxVr, setIdCUBxVr] = useState(null);
    const [currentItem, setCurrentItem] = useState(null);
    const [tn, setTn] = useState(undefined);

    useEffect(() => {
        setItem_Record();
        retrieveItem(currentId);
    }, []);

    function setItem_Record() {
        RECORD_REVIEW_SERVICE.getRecord(currentId)
            .then(response => {
                if (response.data.length < 1) {
                    setCurrentRecord(null);
                    setCurrentVersionR(null);
                    setLoaded(true);
                } else {
                    setCurrentRecord(response.data[0]);
                    setCurrentVersionR(response.data[0].version);
                    setLoaded(true);
                }
            })
            .catch(e => {
                console.log(e);
                MySwal.fire({
                    title: swaMsg.generic_eror_title,
                    text: swaMsg.generic_error_text,
                    icon: 'warning',
                    confirmButtonText: swaMsg.text_btn,
                });
            });
    }

    function requestUpdateRecord(id) {
        RECORD_REVIEW_SERVICE.getRecord(id)
            .then(response => {
                setCurrentRecord(response.data[0]);
                setCurrentVersionR(response.data[0].version);
                setLoaded(true);
            })
            .catch(e => {
                console.log(e);
            });
    }

    function requestUpdate(id) {
        requestUpdateProp(id);
    }

    function retrieveItem(id) {
        FUN_SERVICE.get(id)
            .then(response => {
                setCurrentItem(response.data);
                retrievePQRSxFUN(response.data.id_public);
                SubmitService.getIdRelated(response.data.id_public).then(resres => {
                    setVrsRelated(resres.data);
                })
                retrieveCubXvrs(response.data.id_public);
            })
            .catch(e => {
                console.log(e);
                MySwal.fire({
                    title: "ERROR AL CARGAR",
                    text: "No ha sido posible cargar este item, intentelo nuevamente.",
                    icon: 'error',
                    confirmButtonText: swaMsg.text_btn,
                });
            });
    }

    function retrievePQRSxFUN(id_public) {
        FUN_SERVICE.loadPQRSxFUN(id_public)
            .then(response => {
                setPqrsxfun(response.data);
            })
            .catch(e => {
                console.log(e);
            });
    }

    async function retrieveCubXvrs(id_public) {
        console.log(id_public)
        const response = await CubXVrDataService.getByFUN(id_public)
        const data = response.data.find(item => item.process === 'OBSERVACIONES Y CORRECIONES')

        if (data) {
            document.getElementById("vr_selected11").value = data.vr
            setVrSelected(data.vr);
            setCubSelected(data.cub);
            setIdCUBxVr(data.id);
        }
    }"""
    
    if old in content:
        content = content.replace(old, new)
        print("  Header: OK")
    else:
        print("  WARNING: Header not found!")
        return
    
    # Handle the CREATE_CHECK method - it's an async class method that stays
    # It uses this.props.swaMsg which will be handled by body replacements
    # But we need to convert it from class method to function
    old_create = """    async CREATE_CHECK(_detail, chekcs, _currentItem, _headers) {
        let swaMsg = this.props.swaMsg;"""
    new_create = """    async function CREATE_CHECK(_detail, chekcs, _currentItem, _headers) {
        let swaMsgLocal = swaMsg;"""
    if old_create in content:
        content = content.replace(old_create, new_create)
        # Replace swaMsg refs inside CREATE_CHECK that used the local var
        # Actually the local var shadowed the prop, so it's fine
        # But we renamed it to swaMsgLocal to avoid confusion
        # Wait, actually in the original this was:
        # let swaMsg = this.props.swaMsg;
        # and then used swaMsg.title_wait etc
        # After our regex, this.props.swaMsg becomes just swaMsg
        # But that would mean `let swaMsg = swaMsg;` which is a reference error
        # So we need to handle this specially
        # Actually let's just remove that line since swaMsg is already available from props
        content = content.replace("        let swaMsgLocal = swaMsg;\n", "")
        print("  CREATE_CHECK: OK")
    
    # Handle render() line and its destructuring
    old_render = """    render() {
        const { translation, swaMsg, globals, currentVersion } = this.props;
        const { loaded, currentRecord, currentVersionR, currentItem, currentStepIndex, vrsRelated } = this.state;"""
    new_render = """    // Render body"""
    if old_render in content:
        content = content.replace(old_render, new_render)
        print("  Render header: OK")
    else:
        print("  WARNING: Render header not found!")
    
    # Handle this.setState for tn in render body
    content = content.replace(
        "onChange={(e) => this.setState({ 'tn': e.target.value })}",
        "onChange={(e) => setTn(e.target.value)}"
    )
    
    # Handle this.props.closeModal()
    content = content.replace('this.props.closeModal()', 'closeModalProp()')
    
    content = apply_body_replacements(content)
    content = remove_class_close(content, 'RECORD_REVIEW', has_nav_funa=True)
    
    refs = count_this_refs(content)
    print(f"  Remaining this. refs: {refs}")
    if refs > 0:
        for i, line in enumerate(content.split('\n'), 1):
            if 'this.' in line and not line.strip().startswith('//') and not line.strip().startswith('*'):
                print(f"    Line {i}: {line.strip()[:100]}")
    
    with open(filepath, 'w') as f:
        f.write(content)
    print(f"  Written OK")

# ============================================================
# Run all conversions
# ============================================================
if __name__ == '__main__':
    convert_record_letter()
    convert_record_letter_2()
    convert_record_ph()
    convert_record_law()
    convert_record_arc()
    convert_record_eng()
    convert_record_review()
    print("\n=== ALL DONE ===")
