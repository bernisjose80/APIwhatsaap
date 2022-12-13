'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const getConnection = require('./libs/postgres');
let c_order_id= 0;


const app = express();


app.set('port', 5000);
app.use(bodyParser.json());

app.get('/', function(req, response){
    
    response.send('Mi Servidor Express!');
    
})

app.get('/webhook', function(req, response){
 

    if(req.query['hub.verify_token'] === '14nc4r1n4'){
        response.send(req.query['hub.challenge']);
    } else {
        response.send(' Violacion.No tienes permisos.')
    }
})

app.post('/webhook/', async function(req, res){   
    let body_param = req.body;    
    let status='';
    let wamId='';  

    
    
    


        
      
      if (body_param.object){
         
        if (body_param.entry && body_param.entry[0].changes[0] && body_param.entry[0].changes[0].value.statuses){
               
                status=body_param.entry[0].changes[0].value.statuses[0].status; 
                wamId=body_param.entry[0].changes[0].value.statuses[0].id;                
                console.log(status);     
                
                 switch (status) {
                    case 'sent':
                     
                    
                      //console.log(c_order_id);                      
                      //const client = await getConnection();  
                      //const rta= await client.query(`insert into bot_wsapp (bot_wsapp_fecha,bot_wsapp_status,c_order_id,bot_wsapp_wamid)
                      //values('${FormatFecha()}', '${status}', ${c_order_id},'${wamId}')`);            
                      //console.log(`Numero de filas afectadas: ${rta.rowCount}`);                        
                     
                      
                      break;

                    case 'read':
                     
                    case 'delivered':
                      let SiWam = await SelectWam(wamId);
                      if (SiWam != 0) {
                        
                        const client = await getConnection();  
                        const rta= await client.query(`insert into bot_wsapp (bot_wsapp_fecha,bot_wsapp_status,c_order_id,bot_wsapp_wamid)
                        values('${FormatFecha()}', '${status}', ${SiWam},'${wamId}')`);            
                        console.log(`Numero de filas afectadas: ${rta.rowCount}`);     

                      }
                      break;
                    
                 }            
              
                          
               
           

          
           
        } else  if (body_param.entry && 
           body_param.entry[0].changes[0] &&
            body_param.entry[0].changes[0].value.messages && 
            body_param.entry[0].changes[0].value.messages[0]){
             
             
                  let message = body_param.entry[0].changes[0].value.messages[0].button.text;
                  wamId =  body_param.entry[0].changes[0].value.messages[0].context.id;

             
              
               if (message === 'Si') {
                  console.log('Ticket Aprobado'); //Aqui va el update de c_order

                  const IsAproved ='Y';
                  const DocStatus ='CO';
                  const Processed ='Y';
                  const Docaction = 'CL';
                  status = 'Aprobado';
                  let SiWam = await SelectWam(wamId);

                  if (SiWam != 0) {
                  InsertBotW(status,SiWam,wamId); // aqui incluye en la tabla botwsapp cuando es el 4to status y aprobado
                   
                  const client = await getConnection();                   
                  
                  const rta= await client.query(`Update c_order set docstatus='${DocStatus}', isapproved='${IsAproved}' , processed='${Processed}' , docaction='${Docaction}' where c_order_id=${SiWam}`);
                  
                  console.log(`Update:c_order Numero de filas afectadas: ${rta.rowCount}`);
                  }
                  
                 
   

                } else {
                   console.log('Ticket NO Aprobado');
                   const IsAproved ='N';
                   const DocStatus ='CO';
                   const Processed ='Y';
                   const Docaction = 'CL';
                   status = 'Rechazado';

                  let SiWam = await SelectWam(wamId);                  
                  if (SiWam != 0) {

                   InsertBotW(status,SiWam,wamId); // aqui incluye en la tabla botwsapp cuando es el 4to status y rechazado
                 
                   const client = await getConnection();  
                   const rta= await client.query(`Update c_order set docstatus='${DocStatus}', isapproved='${IsAproved}' , processed='${Processed}' , docaction='${Docaction}' where c_order_id=${SiWam}`);
                  
                   console.log(`Update:c_order Numero de filas afectadas: ${rta.rowCount}`);
                  }
                }
                

           }
   
   res.sendStatus(200);


     
  }      
          
     
})

app.listen(app.get('port'), function(){
  
  setInterval (Listening, 30000);

  console.log('Nuestro servidor esta funcionando en el puerto', app.get('port'));
})

function TratarLength(cadena){
  
  let length=cadena.length;
  if (length <=1) {
      length=`0${cadena}`;      
      return length
  }
 length=`${cadena}`;
 return length;
}

async function SelectBd(IdOrder){  // revisa si ya se mando un mensaje al usuario aprobador (no lo puede volver a enviar)
 let NumR = 0;
  const client = await getConnection();   
  const rta= await client.query(`SELECT * FROM bot_wsapp where c_order_id = ${IdOrder}`);
  if (rta.rowCount > 0) {
     NumR = 1;
  }
  return NumR;
}

async function SelectWam(IdWam){  // revisa si ya se mando un mensaje al usuario aprobador (no lo puede volver a enviar)
  let NumR = 0;
  let i = 0;
   const client = await getConnection();     
   const rta= await client.query(`SELECT * FROM bot_wsapp where bot_wsapp_wamid = '${IdWam}'`);
   if (rta.rowCount > 0) {
      NumR = rta.rows[i].c_order_id;
   }
   return NumR;
 }

async function InsertBotW (stat,id_order,wamiden){
  const client = await getConnection();  
  const rta= await client.query(`insert into bot_wsapp (bot_wsapp_fecha,bot_wsapp_status,c_order_id,bot_wsapp_wamid)
  values('${FormatFecha()}', '${stat}', ${id_order},'${wamiden}')`);            
  console.log(`Numero de filas afectadas botw: ${rta.rowCount}`);
}

function FormatFecha(){
    const fecha= new Date(); 
    let fecha_format='';
    let[year,month,day,hour,minutes,second] = [fecha.getFullYear(), fecha.getMonth(),fecha.getDate(),fecha.getHours(),fecha.getUTCMinutes(),fecha.getSeconds()];
    year=TratarLength(year.toString());
    month=TratarLength((month+1).toString());
    day= TratarLength(day.toString());
    hour=TratarLength(hour.toString());
    minutes=TratarLength(minutes.toString());
    second= TratarLength(second.toString());
    fecha_format=(`${year}-${month}-${day} ${hour}:${minutes}:${second}`);

    return fecha_format
}


async function Listening(){
  const IsAproved ='N';
  const DocStatus ='IP';
  const ResId = 101;    
  let SendOn =0;
  
  console.log('estoy escuchando la BD');
 

 

  const client = await getConnection();  
  
  
  const rta= await client.query(`SELECT oc.created, awfp.ad_wf_process_id, awfp.record_id, awfp.processed, awfa.ad_wf_responsible_id, au.name AS user, au.email, au.phone, oc.ad_org_id As Organización, oc.isapproved AS Aprobada, oc.docstatus AS Status FROM ad_wf_process AS awfp JOIN ad_wf_activity AS awfa ON awfa.ad_wf_process_id = awfp.ad_wf_process_id JOIN ad_user AS au ON au.ad_user_id = awfa.ad_user_id JOIN c_order AS oc ON awfp.record_id = oc.c_order_id where oc.isapproved='${IsAproved}' and oc.docstatus='${DocStatus}' and awfa.ad_wf_responsible_id <> ${ResId} ORDER BY 1`);
   
 
   
    if (rta.rowCount > 0) {

     
       let i = 0;
      
       while (i < rta.rowCount){
        
        if (rta.rows[i].phone != null){          
          
          c_order_id = rta.rows[i].record_id;
          SendOn = await SelectBd(c_order_id);
          console.log(SendOn);
          if (SendOn === 0) {
            console.log(rta.rows[i].phone);
            callSendApi(rta.rows[i].phone, c_order_id);
          }
         
        }              

       i= i+1;
      }
        
          

      } else {
          console.log('No se han conseguido registro en la tabla');
     }

     
    

}



function callSendApi(NroPhone,NroReq) {

  
   
   
    var options = {
      'method': 'POST',
      'url': 'https://graph.facebook.com/v14.0/108485265393652/messages',
      'headers': {
        'Authorization': 'Bearer EAASsZC9DBFEEBAC0nUK3IXQtZBPzFC3IF9CaZAQ4G5MSVvYKhAzjIBhZBduZAfkZASB15e5bdBpQ3Y0XFIqtQV1a95tgsZBhmy8mgakOFzyJRLD5r5aDEjZAyeNsJVkbtgMfLkcZACyYMtzSpUeopvltHkprGEzkIm2ojjIPdCrkGQnt78UZA6OVGOQwMSokyuBOeEOOVndAtIZBwZDZD',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "messaging_product": "whatsapp",
        "to": NroPhone,
        "type": "template",
        "template": {
          "name": "ticket_recepcion",
          "language": {
            "code": "es"
          },
          "components": [
            {
              "type": "header",
              "parameters": [
                {
                  "type": "document",
                  "document": {
                    "link": "http://www.unimet.edu.ve/wp-content/uploads/sites/3/2015/05/Facturas-segun-el-SENIAT.pdf"
                  }
                }
              ]
            },
            {
              "type": "body",
              "parameters": [
                {
                  "type": "text",
                  "text": NroReq
                },
                {
                  "type": "text",
                  "text": "Msc Bernabe Williams"
                },
                {
                  "type": "text",
                  "text": "Araure COD"
                }
              ]
            }
          ]
        }
      })
    
    };
    request(options, function (error, response) {
      if (error) throw new Error(error);                
          //console.log(response.body);  
          let data = JSON.parse(response.body);
          let mssg = (data.messages[0].id);
          let codorder = (NroReq);
          const estado = 'sent';
          InsertBotW(estado,codorder,mssg);
       
       
    });
}

