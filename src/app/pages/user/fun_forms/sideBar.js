import { useState, useEffect, useRef } from 'react';
import Sidebar from "react-sidebar";

import Page from '../fun'


const mql = window.matchMedia(`(min-width: 800px)`);

function SideBar({ translation, swaMsg, globals, breadCrums }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [sidebarDocked] = useState(mql.matches);
    const [items, setItems] = useState([]);

    const onSetSidebarOpen = () => {
        setSidebarOpen(prev => !prev);
    };
    const onUpdateList = (listName, listItems) => {
        console.log("here! on function call");
        setItems(listItems);
    };

        return (
            <Sidebar
                sidebar={<SideBarContent itemsList={items}/>}
                open={sidebarOpen}
                onSetOpen={onSetSidebarOpen}
                styles={{ sidebar: { background: "white" } }}
                docked={sidebarDocked}
            >
              <div className="container-primary p-3 m-0" style={{ position: 'relative', zIndex: '1' }}> 
                    <Page
                        translation={translation}
                        swaMsg={swaMsg}
                        globals={globals}
                        breadCrums={breadCrums}
                        onUpdateList={onUpdateList}
                    />
               </div>
            </Sidebar>
        );
}

function SideBarContent({ itemsList }) {
    const prevItemsListRef = useRef(itemsList);

    const getList = () => {
        for (const item in itemsList) {
            console.log(item);
        }
    };

    useEffect(() => {
        if (itemsList !== prevItemsListRef.current && itemsList !== null) {
            getList();
        }
        prevItemsListRef.current = itemsList;
    }, [itemsList]);

        return (
            <div>
                <div className="p-3 bg-primary text-primary-foreground"><p className="lead fw-normal">LISTA SOLICITUDES</p></div>
                <div className="px-2">
                    <p className="lead fw-normal">EN RADICACION</p>
                    {}
                    <p className="lead fw-normal">INCOMPLETAS</p>
                    <p className="lead fw-normal">LEGAL Y DEBIDA FORMA</p>
                    </div>
            </div>
        );
}

export default SideBar;