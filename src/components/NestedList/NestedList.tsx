import * as React from 'react';
import { ReactNode, useCallback } from 'react';
import ListSubheader from '@mui/material/ListSubheader';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

interface MenuItem {
    'title':string;
    'icon':ReactNode;
    'id':string;
    'children'?:Array<MenuItem>
}
type MenuItems = MenuItem[]

interface OpenCloseStt {
    [key: string]: boolean;
}

export default function NestedList({ nestItems }: { nestItems: MenuItems }){
    const [open, setOpen] = React.useState<OpenCloseStt>({});
    const handleClick = (id:string) => {
        setOpen((oldOpen) => {
            const newOpen = {
                ...oldOpen,
                [id]: !oldOpen[id]
            }
            console.log(newOpen)
            return newOpen
        })
    };
    const extractNestItems = useCallback(
        (items:MenuItems | undefined, nest:number) => {
            return Array.isArray(items)?items.map((item) => {
                if ('id' in item && 'title' in item && 'icon' in item && 'children' in item) {
                    const idStr:string = item.id;
                    let openStt:boolean = !!open[idStr]
                    return (
                        <React.Fragment key={idStr + '_'}>
                            <ListItemButton onClick={()=>handleClick(idStr)} sx={{ pl: 4 * nest}} key={idStr + 'lib'}>
                                <ListItemIcon key={idStr + 'ico'}>
                                {item.icon}
                                </ListItemIcon>
                                <ListItemText primary={item.title} key={idStr + 'txt'}/>
                                {openStt ? <ExpandLess key={idStr + 'exp'} /> : <ExpandMore key={idStr + 'exp'} />}
                            </ListItemButton>
                            <Collapse in={openStt} timeout="auto" unmountOnExit  key={idStr + 'col'} >
                                <List component="div"  key={idStr + 'lst'} >
                                {extractNestItems(item?.children, nest + 1)}
                                </List>
                            </Collapse> 
                        </React.Fragment>
                    )
                } else if ('id' in item && 'title' in item && 'icon' in item) {
                    const idStr:string = item.id;
                    return (
                        <ListItemButton sx={{ pl: 4 * nest }} key={idStr + 'lib'}>
                            <ListItemIcon key={idStr + 'ico'}>
                            {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.title}  key={idStr + 'txt'}/>
                        </ListItemButton>
                    )
                }
            }):<></>
        },
        [nestItems,open],
    );

/*
    return (
        <List
            sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
            component="nav"
            aria-labelledby="nested-list-subheader"
            subheader={
                <ListSubheader component="div" id="nested-list-subheader">
                Dynamic Nested List Test
                </ListSubheader>
            }
        >
        {extractNestItems(nestItems, 0)}
        </List>
    );
    */
    return (
        <List component="nav">
        {extractNestItems(nestItems, 0)}
        </List>
    );

}