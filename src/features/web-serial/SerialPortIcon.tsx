import React from 'react'
import SvgIcon from '@mui/material/SvgIcon';

// SVG PATh d
// https://developer.mozilla.org/ja/docs/Web/SVG/Attribute/d
function make_d_circle(x:number,y:number,r:number,w:number, isNorth:boolean) {
    return ("M "+
      (x-r-w).toString(10)+","+y.toString(10) +
      " A "+ (r+w).toString(10)+","+(r+w).toString(10) + " 0 0," + (isNorth?"0 ":"1 ") + (x+r+w).toString(10)+","+y.toString(10)+
      " h "+(-w*2).toString(10)+
      " A "+ (r-w).toString(10)+","+(r-w).toString(10) + " 0 0," + (isNorth?"1 ":"0 ") + (x-r+w).toString(10)+","+y.toString(10)+
      " z")
}

function make_d_vline(x:number, y_s:number, y_b:number, w:number) {
    return ("M "+
      (x-w).toString(10)+","+y_s.toString(10) +
      " h "+ (w*2).toString(10)+" v "+(y_b-y_s).toString(10) +
      " h "+ (-w*2).toString(10)+" z"
    )
}

function SerialPortIcon2(props:any) {
    // https://material.io/design/iconography/system-icons.html#design-principles
    // https://www.iso.org/obp/ui#iec:grs:60417:5850
    // strokeは明示的に指定した色しか付かない。
    // fillさせることで、CSSが当たるっぽいので、path dで丹精込めてfillさせる。→出典なし、経験からのの推測。
    const line_width:number = 0.7
    const y_center:number = 12
    const line_y_len:number = 8.4
    const line_y_start:number = y_center - (line_y_len / 2)
    const line_y_end:number   = y_center + (line_y_len / 2)
    const circle_r:number = 4
    return (
      <SvgIcon {...props}>
        <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
          <path d={make_d_vline( 1,line_y_start,line_y_end,line_width)}/>
          <path d={make_d_vline(12,line_y_start,line_y_end,line_width)}/>
          <path d={make_d_vline(23,line_y_start,line_y_end,line_width)}/>
          <path d={make_d_circle( 6.5,y_center,circle_r,line_width,true)}/>
          <path d={make_d_circle( 6.5,y_center,circle_r,line_width,false)}/>
          <path d={make_d_circle(17.5,y_center,circle_r,line_width,true)}/>
          <path d={make_d_circle(17.5,y_center,circle_r,line_width,false)}/>
        </svg>
      </SvgIcon>
    );
}

const SerialPortIcon = (props:any) => {
   const {color} = props
   return (<SvgIcon {...props}>
      <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill={color}>
         <path d="M  12,     7
                  L  20,     7
                  Q  22.59,  7, 
                     21.92,  9.55
                  L  19.92, 16.55
                  Q  19.16, 18, 
                     18,    18
                  L   6,    18
                  Q   4.84, 18, 
                     4.08, 16.55
                  L   2.08,  9.55
                  Q   1.41,  7,
                      4,     7
                  L  12,     7
                  L  12,     9
                  L   4,     9
                  L   6,    16
                  L  18,    16
                  L  20,     9
                  L  12,     9
                  z"
            strokeWidth="0"/>
         {[6,9,12,15,18].map((x)=>(
            <circle
               cx={x.toString(10)}
               cy="11"
               r="1"
               key={x.toString(10)}
            />
         ))}
         {[7.5, 10.5, 13.5, 16.5].map((x)=>(
            <circle
               cx={x.toString(10)}
               cy="14"
               r="1"
               key={x.toString(10)}
            />
         ))}
      </svg>
   </SvgIcon>
   )
}
export default SerialPortIcon;
/*
    <path d="M 12,     7
            L  20,     7
            Q  22.59,  7, 
               21.92,  9.55
            L  19.92, 16.55
            Q  19.16, 18, 
               18,    18
            L   6,    18
            Q   4.84, 18, 
                4.08, 16.55
            L   2.08,  9.55
            Q   1.41,  7,
                4,     7
            L  12,     7
            L  12,     9
            L   4,     9
            L   6,    16
            L  18,    16
            L  20,     9
            L  12,     9
            z"
    stroke-width="0"/>


    <path d="M 12,     6.5
            L  20,     6.5
            Q  22.6,   6.5, 
               21.923, 9.05
            L  19.923,16.05
            Q  19.1,  17.5, 
               18,    17.5
            L   6,    17.5
            Q   4.84, 17.5, 
                4.02, 16.05
            L   2.08,  9.05
            Q   1.41,  6.5,
                4,     6.5
            L  12,     6.5
            L  12,     8.5
            L   4,     8.5
            L   6,    15.5
            L  18,    15.5
            L  20,     8.5
            L  12,     8.5
            z"
    stroke-width="0"/>

*/