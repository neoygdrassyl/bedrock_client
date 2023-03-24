import React, { Component } from 'react';
import JSONDATLIST from '../../../../components/jsons/fun6DocsList.json'

class FUN6DATALIST extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    render() {

        let _SETDATALISTOPTIONS = () => {
            let _COMPONENT = [];
            Object.entries(JSONDATLIST).forEach(([key, value]) => {
                _COMPONENT.push(<option value={value}> {key} {value}</option>)
              });
            return <div>{_COMPONENT}</div>;
        }
        return (
        <datalist id="fun_6_docs_list">
            {_SETDATALISTOPTIONS()}
        </datalist>
        );
    }
}

export default FUN6DATALIST;