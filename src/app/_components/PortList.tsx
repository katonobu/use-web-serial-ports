import * as React from 'react';
import { AddButton } from './SerialButtons'
import { DataGrid, GridColDef, GridValueGetterParams, GridEventListener } from '@mui/x-data-grid';
import { useSerialPorts } from "@/features/web-serial/webSerialDataProvider"
import { useRouter } from 'next/navigation'

const columns: GridColDef[] = [
    {
        field: 'idStr', headerName: 'ID', flex:0.5
    },{
        field: 'venderName', headerName: 'VenderName', flex:2
    },{
        field: 'vid', headerName: 'VID', flex:1,
        valueGetter: (params: GridValueGetterParams) => '0x'+('0000'+params.row.vid.toString(16)).slice(-4)
    },{
        field: 'pid', headerName: 'PID', flex:1,
        valueGetter: (params: GridValueGetterParams) => '0x'+('0000'+params.row.pid.toString(16)).slice(-4)
    },{
        field: 'isOpen', headerName: 'OPEN', flex:1,
    }
]

const PortList = ()=>{
    const serialPorts = useSerialPorts()
    const router = useRouter()
    const handleRowClick: GridEventListener<'rowClick'> = (
        params, // GridRowParams
        event, // MuiEvent<React.MouseEvent<HTMLElement>>
        details, // GridCallbackDetails
    ) => {
        router.push(`/${params.id}`)
        event.preventDefault()
    };
    return (
        <div style={{ height: '90%', width: '100%' }}>
            <AddButton></AddButton>
            <DataGrid
                rows={serialPorts}
                getRowId={(row:any)=>row.idStr}
                columns={columns}
                density='compact'
                hideFooter={true}
                checkboxSelection={false}
                onRowClick={ handleRowClick }
            />
        </div>
    )
}

export default PortList