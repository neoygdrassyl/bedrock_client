import React, { Component } from 'react';
import Sidebar from "react-sidebar";

import Page from '../fun'


const mql = window.matchMedia(`(min-width: 800px)`);

class SideBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sidebarOpen: true,
            sidebarDocked: mql.matches,
            items: []
        };
        this.onSetSidebarOpen = this.onSetSidebarOpen.bind(this);
        this.onUpdateList = this.onUpdateList.bind(this);
    }

    onSetSidebarOpen() {
        this.setState({ sidebarOpen: !this.state.sidebarOpen });
    }
    onUpdateList(listName, listItems){
        console.log("here! on function call");
        this.setState({items : listItems})
    }
    render() {
        const { translation, swaMsg, globals, breadCrums } = this.props;
        const { items } = this.state;
        
        return (
            <Sidebar
                sidebar={<SideBarContent itemsList={items}/>}
                open={this.state.sidebarOpen}
                onSetOpen={this.onSetSidebarOpen}
                styles={{ sidebar: { background: "white" } }}
                docked={this.state.sidebarDocked}
            >
              <div className="container-primary p-3 m-0" style={{ position: 'relative', zIndex: '1' }}> 
                    <Page
                        translation={translation}
                        swaMsg={swaMsg}
                        globals={globals}
                        breadCrums={breadCrums}
                        onUpdateList={this.onUpdateList}
                    />
               </div>
            </Sidebar>
        );
    }
}

class SideBarContent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            itemsList: [],
        };
        this.componentDidUpdate = this.componentDidUpdate.bind(this);
    }
    componentDidUpdate(PrevProps, prevState) {
        if (this.props.itemsList !== PrevProps.itemsList && this.props.itemsList !== null) {
           this.setState({itemsList : this.props.itemsLis})
           this.getList();
        }
    }
    getList = () => {
        for (const item in this.props.itemsList) {
            console.log(item)
          }
    }
    render() {
        const { itemsList } = this.state;
        

        return (
            <div>
                <div className="p-3 bg-info"><p className="lead fw-normal">LISTA SOLICITUDES</p></div>
                <div className="px-2">
                    <p className="lead fw-normal">EN RADICACION</p>
                    {}
                    <p className="lead fw-normal">INCOMPLETAS</p>
                    <p className="lead fw-normal">LEGAL Y DEBIDA FORMA</p>
                    </div>
            </div>
        )
    };
}

export default SideBar;