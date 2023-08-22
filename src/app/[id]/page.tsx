'use client';
import { useRxBufferLen } from '@/features/web-serial/webSerialDataProvider'
import { OpenCloseButton, DeleteButton, ListButton } from '../_components/SerialButtons'
import Grid from '@mui/material/Grid';

export default function Page({ params }: { params: { id: string } }) {
    const idStr = params.id
    const id = parseInt(idStr, 10)
    const {totalLines, updatedLines} = useRxBufferLen(idStr)
    return (
        <div>
            <div>
            <Grid container>
                <Grid item xs={10}>
                    <OpenCloseButton idStr={idStr}/>
                </Grid>
                <Grid item xs={1}>
                    <ListButton/>
                </Grid>
                <Grid item xs={1}>
                    <DeleteButton idStr={idStr}/>
                </Grid>
            </Grid>
            </div>            
            <p>totalLines:{totalLines.toString(10)}</p>
            <p>updateLines:{updatedLines.toString(10)}</p>
        </div>
    )
}