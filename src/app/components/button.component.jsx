import React from 'react'
import { IconButton } from 'rsuite'
export const Button_navigation = (props) => {
    const { Idup, Iddown } = props
    const _Redirec = (id) => {
        const element = document.getElementById(id);
        element.scrollIntoView()
    }
    return <>
        {
            Iddown == null ? '' : <IconButton appearance='subtle' onClick={() => _Redirec(Iddown)} size="xs" icon={<i class="fas fa-arrow-circle-down"></i>} />
        }
        {
            Idup == null ? '' : <IconButton appearance='subtle' onClick={() => _Redirec(Idup)} size="xs" icon={<i class="fas fa-arrow-circle-up"></i>} />
        }
    </>
}
