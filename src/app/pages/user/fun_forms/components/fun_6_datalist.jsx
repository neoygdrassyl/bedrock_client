import JSONDATLIST from '../../../../components/jsons/fun6DocsList.json'

function FUN6DATALIST() {

    let _SETDATALISTOPTIONS = () => {
            let _COMPONENT = [];
            Object.entries(JSONDATLIST).forEach(([key, value]) => {
                // FIX: Added key prop for list items
                _COMPONENT.push(<option key={key} value={value}> {key} {value}</option>)
              });
            return <div>{_COMPONENT}</div>;
        }
        return (
        <datalist id="fun_6_docs_list">
            {_SETDATALISTOPTIONS()}
        </datalist>
        );
}

export default FUN6DATALIST;