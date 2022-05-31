const AWS = require('aws-sdk')
const databaseManager = require(`./databaseManager`);


const ddb=new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10', region: process.env.AWS_REGION
})


const api = new AWS.ApiGatewayManagementApi({
  endpoint: process.env.CALLBACK_URL
 })

 
 const CONN_TABLE = process.env.CONN_TABLE;
 const USERS_TABLE = process.env.USERS_TABLE;



/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */


exports.lambdaHandler = async (event, context) => {

  // if (!event.requestContext) {
  //   return {};
  // }

  const body = JSON.parse(event.body || '{}');


  console.log(event)

  const route = event.requestContext.routeKey;
  const connectionId = event.requestContext.connectionId;

  switch (route) {
      case '$connect':

          console.log('Connection occurred')

          break
      case '$default':

          console.log('default event ',event)
          console.log('default body ',body)

          break
      case '$disconnect':

          console.log('Disconnection occurred')

         let disconData = await databaseManager.updateItemConn(CONN_TABLE, connectionId, "disconnected", true);

         console.log('disconData.userId',disconData)



         if(disconData.userId != undefined){
           
          if(disconData.role == "subqueue" || disconData.role == "queue"  ){
            await deleteTicket(connectionId);


           }



          
        /////admin notif stuff

        let admindataDis = await getAdmin(disconData.userId)

        console.log("adminData",admindataDis)
        if(admindataDis.length != 0){


          let usersDataDis = await getTicketByUserId(disconData.userId)

          console.log("usersData", usersDataDis )

          await sendToAll(admindataDis ,{ data : usersDataDis })

        }

      console.log("queue verifiation" ,disconData.queueId)
     
     
     
               if(disconData.queueId != undefined){


                  /////queue notif stuff
                  let listqudata5Dis;
                  if(disconData.isQueueSpecial == false){


                     listqudata5Dis = await getListQueue(disconData.userId,disconData.queueId)

                    console.log("queueData to",listqudata5Dis)
          
                    let quData5Dis = await getqueue(disconData.userId,disconData.queueId)
          
                    console.log("queueData rec", quData5Dis )
          
                    await sendToAll(listqudata5Dis ,{ data : quData5Dis })  


                  }




                  if(disconData.isQueueSpecial  == true){
 
                    listqudata5Dis = await specialgetListQueue(disconData.userId)
          
                   console.log("queueData to",listqudata5Dis)
          
          
                   if(listqudata5Dis.length != 0){
          
                     for(var i = 0; i < listqudata5Dis.length; i++) {
          
          
                       console.log(listqudata5Dis[i])
          
                       let quData6enduserDisc= await getqueue(listqudata5Dis[i].userId,listqudata5Dis[i].queueId)
          
                       console.log("queueData rec", quData6enduserDisc )
          
          
                       let speclistqudata4Disc = await getListQueue(listqudata5Dis[i].userId,listqudata5Dis[i].queueId)
          
                       console.log("queueData to",speclistqudata4Disc)
          
           
                       await sendToAll(speclistqudata4Disc ,{ data : quData6enduserDisc }) 
                       
                       
                     }
                   
          
                 }
          
          
                 }




      }
                

            console.log("subqueue verifiation" ,disconData.subQueueId )
            console.log("subqueue verifiation !=  " ,disconData.subQueueId != "")



          ///subqueue notif stuff

          if(disconData.subQueueId != ""){
            let listqudata4sub1Dis ;

            if(disconData.isSubQueueSpecial  == false){
               listqudata4sub1Dis = await getListSubQueue(disconData.userId,disconData.subQueueId)

              console.log("subqueueData to",listqudata4sub1Dis)
      
              let quData4sub1Dis = await getsubqueue(disconData.userId,disconData.subQueueId)
      
              console.log("queueData rec", quData4sub1Dis )
      
              await sendToAll(listqudata4sub1Dis ,{ data : quData4sub1Dis })  
            }







            if(disconData.isSubQueueSpecial   == true){

              listqudata4sub1Dis = await specialgetListSubQueue(disconData.userId)
    
              console.log("subqueueData to",listqudata4sub1Dis)
    
              if(listqudata4sub1Dis.length != 0){
    
                for(var i = 0; i < listqudata4sub1Dis.length; i++) {
    
    
                  console.log(listqudata4sub1Dis[i])
    
                  let quData4subDeconn = await getsubqueue(listqudata4sub1Dis[i].userId,listqudata4sub1Dis[i].subQueueId)
    
                  console.log("subqueueData rec", quData4subDeconn )
    
    
                  let listqudata4Deconn = await getListSubQueue(listqudata4sub1Dis[i].userId,listqudata4sub1Dis[i].subQueueId)
    
                  console.log("subqueueData to",listqudata4Deconn)
    
      
                  await sendToAll(listqudata4Deconn ,{ data : quData4subDeconn }) 
                  
                  
                }
    
              }
    
            }



          };




        }


        console.log("delete disconData.userId == undefined",event)
        
        if(disconData.userId == undefined){
                    await deleteConnectionId(event);


        }


          break
      case 'auth':
        await addAdmin(connectionId , body.iduse);

        let oldData = await getTicketByUserId(body.iduse)

        console.log("usersData",oldData)

        await sendToOne(connectionId ,{ data : oldData })  
        break


      case 'set':

        let dataSet =await addConnectionId(event);
        console.log(dataSet)

        await sendToOne(connectionId ,{ setData : dataSet})



            /////admin notif stuff

            let admindata = await getAdmin(body.userId)

            console.log("adminData",admindata)
            if(admindata.length != 0){
              let usersData = await getTicketByUserId(body.userId)

              console.log("usersData",usersData)

              await sendToAll(admindata ,{ data : usersData })


            }



            /////queue notif stuff
            let listqudata4;

          if(dataSet.isQueueSpecial == false){

            console.log("i am in dataSet.isQueueSpecial == false")


             listqudata4 = await getListQueue(body.userId,body.queueId)

            console.log("queueData to",listqudata4)

            let quData4 = await getqueue(body.userId,body.queueId)

            console.log("queueData rec", quData4 )

            await sendToAll(listqudata4 ,{ data : quData4 })  


          }
          if(dataSet.isQueueSpecial == true){
  
            listqudata4 = await specialgetListQueue(body.userId)

            console.log("queueData to",listqudata4)

            if(listqudata4.length != 0){

              for(var i = 0; i < listqudata4.length; i++) {


                console.log(listqudata4[i])

                let specquData4 = await getqueue(listqudata4[i].userId,listqudata4[i].queueId)

                console.log("queueData rec", specquData4 )


                let speclistqudata4 = await getListQueue(listqudata4[i].userId,listqudata4[i].queueId)

                console.log("queueData to",speclistqudata4)

    
                await sendToAll(speclistqudata4 ,{ data : specquData4 }) 
                
                
              }
              

          }

     }

            /////subqueue notif stuff


            if(body.subQueueId != undefined){
              let listqudata4sub;

              if(dataSet.isSubQueueSpecial == false){


                 listqudata4sub = await getListSubQueue(body.userId,body.subQueueId)

                console.log("subqueueData to",listqudata4sub)
        
                let quData4sub = await getsubqueue(body.userId,body.subQueueId)
        
                console.log("queueData rec", quData4sub )
        
                await sendToAll(listqudata4sub ,{ data : quData4sub })  
              
         
              }

              if(dataSet.isSubQueueSpecial == true){

                listqudata4sub = await specialgetListSubQueue(body.userId)

                console.log("subqueueData to",listqudata4sub)
    
                if(listqudata4sub.length != 0){
    
                  for(var i = 0; i < listqudata4sub.length; i++) {
    
    
                    console.log(listqudata4sub[i])
    
                    let quData4subSpec = await getsubqueue(listqudata4sub[i].userId,listqudata4sub[i].subQueueId)
    
                    console.log("subqueueData rec", quData4subSpec )
    
    
                    let listqudata4subSpeci = await getListSubQueue(listqudata4sub[i].userId,listqudata4sub[i].subQueueId)
    
                    console.log("subqueueData to",listqudata4subSpeci)
    
        
                    await sendToAll(listqudata4subSpeci ,{ data : quData4subSpec }) 
                    
                    
                  }
    
                }

              }



        }

      
        break



      case 'reset':


        let dataReSet =await reSetConnectionId(event);
        if(dataReSet != []){
        console.log(dataReSet)

        await sendToOne(connectionId ,{ setData : dataReSet})
      }

        /////admin notif stuff

        let admindataReset = await getAdmin(dataReSet.userId)

        console.log("adminData",admindataReset)

        if(admindataReset.length != 0){

          let usersDataReset = await getTicketByUserId(dataReSet.userId)

          console.log("usersData",usersDataReset)

          await sendToAll(admindataReset ,{ data : usersDataReset })

        }



        /////queue notif stuff
        let listqudata4Reset;
        if(dataReSet.isQueueSpecial == false){


           listqudata4Reset = await getListQueue(dataReSet.userId,dataReSet.queueId)

          console.log("queueData to",listqudata4Reset)

          let quData4Reset = await getqueue(dataReSet.userId,dataReSet.queueId)

          console.log("queueData rec", quData4Reset )

          await sendToAll(listqudata4Reset ,{ data : quData4Reset })  

        }



        if(dataReSet.isQueueSpecial == true){
 
          listqudata4Reset = await specialgetListQueue(dataReSet.userId)

         console.log("queueData to",listqudata4Reset)


         if(listqudata4Reset.length != 0){

           for(var i = 0; i < listqudata4Reset.length; i++) {


             console.log(listqudata4Reset[i])

             let quData6enduserReset= await getqueue(listqudata4Reset[i].userId,listqudata4Reset[i].queueId)

             console.log("queueData rec", quData6enduserReset )


             let speclistqudata4Reset = await getListQueue(listqudata4Reset[i].userId,listqudata4Reset[i].queueId)

             console.log("queueData to",speclistqudata4Reset)

 
             await sendToAll(speclistqudata4Reset ,{ data : quData6enduserReset }) 
             
             
           }
         

       }


       }



        /////subqueue notif stuff


        if(dataReSet.subQueueId != ""){
          let listqudata4subReset ;

          if(dataReSet.isSubQueueSpecial == false){
            
            listqudata4subReset = await getListSubQueue(dataReSet.userId,dataReSet.subQueueId)

            console.log("subqueueData to",listqudata4subReset)
    
            let quData4subReset = await getsubqueue(dataReSet.userId,dataReSet.subQueueId)
    
            console.log("queueData rec", quData4subReset )
    
            await sendToAll(listqudata4subReset ,{ data : quData4subReset })  

          }

          
          if(dataReSet.isSubQueueSpecial == true){

            listqudata4subReset = await specialgetListSubQueue(dataReSet.userId)

            console.log("subqueueData to",listqudata4subReset)

            if(listqudata4subReset.length != 0){

              for(var i = 0; i < listqudata4subReset.length; i++) {


                console.log(listqudata4subReset[i])

                let quData4subRes = await getsubqueue(listqudata4subReset[i].userId,listqudata4subReset[i].subQueueId)

                console.log("subqueueData rec", quData4subRes )


                let listqudata4Res = await getListSubQueue(listqudata4subReset[i].userId,listqudata4subReset[i].subQueueId)

                console.log("subqueueData to",listqudata4Res)

    
                await sendToAll(listqudata4Res ,{ data : quData4subRes }) 
                
                
              }

            }

          }

          
        }


        break


      case 'call':
          let {id2,queueId2,subQueueId2} = await updateTicketCallNum(body.to)

          // await sendToOne(body.to ,{ callMessage : "votre commande est prêt"})

          let items3 = await databaseManager.queryConnTable(CONN_TABLE, body.to);

          await sendToOne(body.to ,{ data : items3[0]})

          /////admin notif stuff

          let admindata1 = await getAdmin(id2)

          console.log("adminData",admindata1)

          if(admindata1.length != 0){


            let usersData1 = await getTicketByUserId(id2)

            console.log("usersData",usersData1)

            await sendToAll(admindata1 ,{ data : usersData1 })

          }



          
          /////queue notif stuff


          let listqudata5 = await getListQueue(id2,queueId2)

          console.log("queueData to",listqudata5)

          let quData5 = await getqueue(id2,queueId2)

          console.log("queueData rec", quData5 )

          await sendToAll(listqudata5 ,{ data : quData5 })  



          ///subqueue notif stuff

          if(subQueueId2 != ""){


            let listqudata4sub1 = await getListSubQueue(id2,subQueueId2)

            console.log("subqueueData to",listqudata4sub1)
    
            let quData4sub1 = await getsubqueue(id2,subQueueId2)
    
            console.log("queueData rec", quData4sub1 )
    
            await sendToAll(listqudata4sub1 ,{ data : quData4sub1 })  

          };


      break;
      

      case 'continouscall':
        await databaseManager.updateItemConn(CONN_TABLE, body.to, "ready", true);


        let contnousCalldata =await databaseManager.updateItemConn(CONN_TABLE, body.to, "isContiousCalled", true);
        
        await databaseManager.updateItemConn(CONN_TABLE, body.to, "stopContiousCalled", false);

        let conid2 = contnousCalldata.userId ;
        let conqueueId2 = contnousCalldata.queueId ;
        let  consubQueueId2 = contnousCalldata.subQueueId;


          let conitems3 = await databaseManager.queryConnTable(CONN_TABLE, body.to);

          await sendToOne(body.to ,{ data : conitems3[0]})

          /////admin notif stuff

          let conadmindata1 = await getAdmin(conid2)

          console.log("adminData",conadmindata1)

          if(conadmindata1.length != 0){


            let conusersData1 = await getTicketByUserId(conid2)

            console.log("usersData",conusersData1)

            await sendToAll(conadmindata1 ,{ data : conusersData1 })


          }


          
          /////queue notif stuff


          let conlistqudata5 = await getListQueue(conid2,conqueueId2)

          console.log("queueData to",conlistqudata5)

          let conquData5 = await getqueue(conid2,conqueueId2)

          console.log("queueData rec", conquData5 )

          await sendToAll(conlistqudata5 ,{ data : conquData5 })  



          ///subqueue notif stuff

          if(consubQueueId2 != ""){


            let conlistqudata4sub1 = await getListSubQueue(conid2,consubQueueId2)

            console.log("subqueueData to",conlistqudata4sub1)
    
            let conquData4sub1 = await getsubqueue(conid2,consubQueueId2)
    
            console.log("queueData rec", conquData4sub1 )
    
            await sendToAll(conlistqudata4sub1 ,{ data : conquData4sub1 })  

          };


      break;

      case 'uncontinouscall':

        let uncontnousCalldata =await databaseManager.updateItemConn(CONN_TABLE, body.to, "isContiousCalled", false);
        

        let unconid2 = uncontnousCalldata.userId ;
        let unconqueueId2 = uncontnousCalldata.queueId ;
        let  unconsubQueueId2 = uncontnousCalldata.subQueueId;


          let unconitems3 = await databaseManager.queryConnTable(CONN_TABLE, body.to);

          await sendToOne(body.to ,{ data : unconitems3[0]})

          /////admin notif stuff

          let unconadmindata1 = await getAdmin(unconid2)

          console.log("adminData",unconadmindata1)

          if(unconadmindata1.length != 0){


            let unconusersData1 = await getTicketByUserId(unconid2)

            console.log("usersData",unconusersData1)

            await sendToAll(unconadmindata1 ,{ data : unconusersData1 })


          }


          /////queue notif stuff


          let unconlistqudata5 = await getListQueue(unconid2,unconqueueId2)

          console.log("queueData to",unconlistqudata5)

          let unconquData5 = await getqueue(unconid2,unconqueueId2)

          console.log("queueData rec", unconquData5 )

          await sendToAll(unconlistqudata5 ,{ data : unconquData5 })  



          ///subqueue notif stuff

          if(unconsubQueueId2 != ""){


            let unconlistqudata4sub1 = await getListSubQueue(unconid2,unconsubQueueId2)

            console.log("subqueueData to",unconlistqudata4sub1)
    
            let unconquData4sub1 = await getsubqueue(unconid2,unconsubQueueId2)
    
            console.log("queueData rec", unconquData4sub1 )
    
            await sendToAll(unconlistqudata4sub1 ,{ data : unconquData4sub1 })  

          };


      break;




      case 'stopcontinouscall':

        let contnousCalldata3 = await databaseManager.updateItemConn(CONN_TABLE, body.to, "stopContiousCalled", true);

        let conid23 = contnousCalldata3.userId ;
        let conqueueId23 = contnousCalldata3.queueId ;
        let  consubQueueId23 = contnousCalldata3.subQueueId;


          let conitems33 = await databaseManager.queryConnTable(CONN_TABLE, body.to);

          await sendToOne(body.to ,{ data : conitems33[0]})

          /////admin notif stuff

          let conadmindata13 = await getAdmin(conid23)

          console.log("adminData",conadmindata13)
          if(conadmindata13.length != 0){

            let conusersData13 = await getTicketByUserId(conid23)

            console.log("usersData",conusersData13)

            await sendToAll(conadmindata13 ,{ data : conusersData13 })
          }
          /////queue notif stuff

          let conlistqudata53 = await getListQueue(conid23,conqueueId23)

          console.log("queueData to",conlistqudata53)

          let conquData53 = await getqueue(conid23,conqueueId23)

          console.log("queueData rec", conquData53 )

          await sendToAll(conlistqudata53 ,{ data : conquData53 })  

          ///subqueue notif stuff

          if(consubQueueId23 != ""){


            let conlistqudata4sub13 = await getListSubQueue(conid23,consubQueueId23)

            console.log("subqueueData to",conlistqudata4sub13)
    
            let conquData4sub13 = await getsubqueue(conid23,consubQueueId23)
    
            console.log("queueData rec", conquData4sub13 )
    
            await sendToAll(conlistqudata4sub13 ,{ data : conquData4sub13 })  

          };


      break;


      case 'confirm':

        let {id1,queueId1,subQueueId1,isQueueSpecial1 , isSubQueueSpecial1} = await  confirmTicket(body.ticketConnId)

        console.log(body.currentQueueId)
        console.log(body.currentQueueId != undefined)

        if(isQueueSpecial1 == true){
          await databaseManager.updateItemConn(CONN_TABLE, body.ticketConnId, "isQueueSpecial", false);


          if(body.currentQueueId != undefined){
            await databaseManager.updateItemConn(CONN_TABLE, body.ticketConnId, "queueId", body.currentQueueId);
 
 
         }

        }

        if(isSubQueueSpecial1 == true){

          await databaseManager.updateItemConn(CONN_TABLE, body.ticketConnId, "isSubQueueSpecial", false);

        if(body.currentSubQueueId != undefined){
          await databaseManager.updateItemConn(CONN_TABLE, body.ticketConnId, "subQueueId", body.currentSubQueueId);


       }

        }

   
        console.log("id :",id1,"queueId ",queueId1,"subqueueId ",subQueueId1)

        let items1 = await databaseManager.queryConnTable(CONN_TABLE, body.ticketConnId);

        await sendToOne(body.ticketConnId ,{ data : items1[0]})


        /////admin notif stuff

        let admindata3 = await getAdmin(id1)

        console.log("adminData",admindata3)
        
        if(admindata3.length != 0){

          let usersData3 = await getTicketByUserId(id1)

          console.log("usersData", usersData3 )

          await sendToAll(admindata3 ,{ data : usersData3 })

        }


        /////queue notif stuff
        let listqudata3;
        if(isQueueSpecial1 == false){

           listqudata3 = await getListQueue(id1,queueId1)

          console.log("queueData",listqudata3)

          let quData3 = await getqueue(id1,queueId1)

          console.log("usersData", quData3 )

          await sendToAll(listqudata3 ,{ data : quData3 })

        }


        if(isQueueSpecial1 == true){
 
           listqudata3 = await specialgetListQueue(id1)

          console.log("queueData to",listqudata3)


          if(listqudata3.length != 0){

            for(var i = 0; i < listqudata3.length; i++) {


              console.log(listqudata3[i])

              let quData6enduserCon = await getqueue(listqudata3[i].userId,listqudata3[i].queueId)

              console.log("queueData rec", quData6enduserCon )


              let speclistqudata4Con = await getListQueue(listqudata3[i].userId,listqudata3[i].queueId)

              console.log("queueData to",speclistqudata4Con)

  
              await sendToAll(speclistqudata4Con ,{ data : quData6enduserCon }) 
              
              
            }
          

        }


        }


        /////subqueue notif stuff


        if(subQueueId1 != ""){
          let listqudata4sub2 ;

          if(isSubQueueSpecial1 == false){

             listqudata4sub2 = await getListSubQueue(id1,body.currentSubQueueId)

            console.log("subqueueData to",listqudata4sub2)
    
            let quData4sub2 = await getsubqueue(id1,body.currentSubQueueId)
    
            console.log("subqueueData rec", quData4sub2 )
    
            await sendToAll(listqudata4sub2 ,{ data : quData4sub2 })  



          }

          if(isSubQueueSpecial1 == true){

            listqudata4sub2 = await specialgetListSubQueue(id1)
  
            console.log("subqueueData to",listqudata4sub2)
  
            if(listqudata4sub2.length != 0){
  
              for(var i = 0; i < listqudata4sub2.length; i++) {
  
  
                console.log(listqudata4sub2[i])
  
                let quData4subCon = await getsubqueue(listqudata4sub2[i].userId,listqudata4sub2[i].subQueueId)
  
                console.log("subqueueData rec", quData4subCon )
  
  
                let listqudata4Con = await getListSubQueue(listqudata4sub2[i].userId,listqudata4sub2[i].subQueueId)
  
                console.log("subqueueData to",listqudata4Con)
  
    
                await sendToAll(listqudata4Con ,{ data : quData4subCon }) 
                
                
              }
  
            }
  
          }

          


        }

      

        break



      case 'delete':

          let item4 = await databaseManager.updateItemConn(CONN_TABLE, body.ticketConnId, "deleted", true);


          // let datauserId2 = await  deleteTicket(body.ticketConnId)

          let userId2 = item4.userId;    //          let userId2 = item4.userId;

          console.log(userId2)


          await sendToOne(body.ticketConnId ,{ data : item4})

        /////admin notif stuff

          let admindata2 = await getAdmin(userId2)

          console.log("adminData",admindata2)

          if(admindata2.length != 0){

            let usersData2 = await getTicketByUserId(userId2)

            console.log("usersData", admindata2 )

            await sendToAll(admindata2 ,{ data : usersData2 })

          }


            /////queue notif stuff
            let listqudata6;
            if(item4.isQueueSpecial == false){

               listqudata6 = await getListQueue(item4.userId,item4.queueId)

              console.log("queueData to",listqudata6)

              let quData6 = await getqueue(item4.userId,item4.queueId)

              console.log("queueData rec", quData6 )

              await sendToAll(listqudata6 ,{ data : quData6 })  


            }

            if(item4.isQueueSpecial == true){
 
              listqudata6 = await specialgetListQueue(item4.userId)
   
              console.log("queueData to",listqudata6)
  
  
              if(listqudata6.length != 0){
  
                for(var i = 0; i < listqudata6.length; i++) {
  
  
                  console.log(listqudata6[i])
  
                  let quData6enduserDel = await getqueue(listqudata6[i].userId,listqudata6[i].queueId)
  
                  console.log("queueData rec", quData6enduserDel )
  
  
                  let speclistqudata4Del = await getListQueue(listqudata6[i].userId,listqudata6[i].queueId)
  
                  console.log("queueData to",speclistqudata4Del)
  
      
                  await sendToAll(speclistqudata4Del ,{ data : quData6enduserDel }) 
                  
                  
                }
              
  
            }
  
  
            }




            /////subqueue notif stuff

            if(item4.subQueueId != ""){
              let listqudata4sub3;

              if(item4.isSubQueueSpecial   == false){


                 listqudata4sub3 = await getListSubQueue(item4.userId,item4.subQueueId)

                console.log("subqueueData to",listqudata4sub3)
        
                let quData4sub3 = await getsubqueue(item4.userId,item4.subQueueId)
        
                console.log("subqueueData rec", quData4sub3 )
        
                await sendToAll(listqudata4sub3 ,{ data : quData4sub3 })  

              }





              if(item4.isSubQueueSpecial   == true){

                listqudata4sub3 = await specialgetListSubQueue(item4.userId)
      
                console.log("subqueueData to",listqudata4sub3)
      
                if(listqudata4sub3.length != 0){
      
                  for(var i = 0; i < listqudata4sub3.length; i++) {
      
      
                    console.log(listqudata4sub3[i])
      
                    let quData4subDeconndel = await getsubqueue(listqudata4sub3[i].userId,listqudata4sub3[i].subQueueId)
      
                    console.log("subqueueData rec", quData4subDeconndel )
      
      
                    let listqudata4Deconndel = await getListSubQueue(listqudata4sub3[i].userId,listqudata4sub3[i].subQueueId)
      
                    console.log("subqueueData to",listqudata4Deconndel)
      
        
                    await sendToAll(listqudata4Deconndel ,{ data : quData4subDeconndel }) 
                    
                    
                  }
      
                }
      
              }



            }





        break


      case 'deleteenduser':



         let item4enduser = await databaseManager.updateItemConn(CONN_TABLE, body.ticketConnId, "deletedbyenduser", true);

   

          let userId2enduser = item4enduser.userId;    //          let userId2 = item4.userId;

          console.log(userId2enduser)

          // await sendToOne(body.ticketConnId  ,{ deleteMessage : "votre ticket est supprimer"})

          await sendToOne(body.ticketConnId ,{ data : item4enduser})

        /////admin notif stuff

          let admindata2enduser = await getAdmin(userId2enduser)

          console.log("adminData",admindata2enduser)

          if(admindata2enduser.length != 0){

            let usersData2enduser = await getTicketByUserId(userId2enduser)

            console.log("usersData", admindata2enduser )

            await sendToAll(admindata2enduser ,{ data : usersData2enduser })

        }

            /////queue notif stuff


            let listqudata6enduser;

            if(item4enduser.isQueueSpecial == false){

              listqudata6enduser = await getListQueue(item4enduser.userId,item4enduser.queueId)

            console.log("queueData to",listqudata6enduser)


            let quData6enduser = await getqueue(item4enduser.userId,item4enduser.queueId)

            console.log("queueData rec", quData6enduser )

            await sendToAll(listqudata6enduser ,{ data : quData6enduser })  
 
 
           }
           if(item4enduser.isQueueSpecial == true){
 
            listqudata6enduser = await specialgetListQueue(item4enduser.userId)
 
            console.log("queueData to",listqudata6enduser)


            if(listqudata6enduser.length != 0){

              for(var i = 0; i < listqudata6enduser.length; i++) {


                console.log(listqudata6enduser[i])

                let quData6enduser = await getqueue(listqudata6enduser[i].userId,listqudata6enduser[i].queueId)

                console.log("queueData rec", quData6enduser )


                let speclistqudata4test = await getListQueue(listqudata6enduser[i].userId,listqudata6enduser[i].queueId)

                console.log("queueData to",speclistqudata4test)

    
                await sendToAll(speclistqudata4test ,{ data : quData6enduser }) 
                
                
              }
            

          }


          }
 


            /////subqueue notif stuff

            if(item4enduser.subQueueId != ""){

              let listqudata4sub3enduser;

              if(item4enduser.isSubQueueSpecial  == false){

                listqudata4sub3enduser = await getListSubQueue(item4enduser.userId,item4enduser.subQueueId)

                console.log("subqueueData to",listqudata4sub3enduser)
        
                let quData4sub3enduser = await getsubqueue(item4enduser.userId,item4enduser.subQueueId)
        
                console.log("subqueueData rec", quData4sub3enduser )
        
                await sendToAll(listqudata4sub3enduser ,{ data : quData4sub3enduser })  

              }



              if(item4enduser.isSubQueueSpecial  == true){

                listqudata4sub3enduser = await specialgetListSubQueue(item4enduser.userId)
      
                console.log("subqueueData to",listqudata4sub3enduser)
      
                if(listqudata4sub3enduser.length != 0){
      
                  for(var i = 0; i < listqudata4sub3enduser.length; i++) {
      
      
                    console.log(listqudata4sub3enduser[i])
      
                    let quData4subDelEndUser = await getsubqueue(listqudata4sub3enduser[i].userId,listqudata4sub3enduser[i].subQueueId)
      
                    console.log("subqueueData rec", quData4subDelEndUser )
      
      
                    let listqudata4DelEnd = await getListSubQueue(listqudata4sub3enduser[i].userId,listqudata4sub3enduser[i].subQueueId)
      
                    console.log("subqueueData to",listqudata4DelEnd)
      
        
                    await sendToAll(listqudata4DelEnd ,{ data : quData4subDelEndUser }) 
                    
                    
                  }
      
                }
      
              }



            }



        break




      case 'note':

        let {id3,queueid3} = await  noteTicket(body.ticketConnId,body.note)


        let items2 = await databaseManager.queryConnTable(CONN_TABLE, body.ticketConnId);

        await sendToOne(body.ticketConnId ,{ data : items2[0]})

        /////admin notif stuff

        let admindata4 = await getAdmin(id3)

        console.log("adminData",admindata4)

        if(admindata4.length != 0){
          let usersData4 = await getTicketByUserId(id3)

          console.log("usersData", usersData4 )

          await sendToAll(admindata4 ,{ data : usersData4 })

        }
        /////queue notif stuff


        let listqudata7 = await getListQueue(items2[0].userId,items2[0].queueId)

        console.log("queueData to",listqudata7)

        let quData7 = await getqueue(items2[0].userId,items2[0].queueId)

        console.log("queueData rec", quData7 )

        await sendToAll(listqudata7 ,{ data : quData7 })  



       /////subqueue notif stuff

       if(items2[0].subQueueId != ""){


        let listqudata4sub4 = await getListSubQueue(items2[0].userId , items2[0].subQueueId )

        console.log("subqueueData to",listqudata4sub4)

        let quData4sub4 = await getsubqueue(items2[0].userId, items2[0].subQueueId)

        console.log("subqueueData rec", quData4sub4 )

        await sendToAll(listqudata4sub4 ,{ data : quData4sub4 })  


      }


      // return {statusCode: 200}



      break;

      case 'getterqueue':

           await addQueueListen(event)

            let dataQueue = await getqueue(body.userId,body.queueId)

            await sendToOne(connectionId,{ data : dataQueue})
                 //>|get current data
    
              break




     case 'gettersubqueue':


            await addSubQueueListen(event)
            
            let dataSubQueue = await getsubqueue(body.userId,body.subQueueId)
            console.log("dataConnectQueue",dataSubQueue)

            await sendToOne(connectionId,{ data : dataSubQueue })
    
      break





      case 'ping':

                 // await sendToOne(connectionId ,{ data : "Why did you wake me up ?" })

                /////admin notif stuff


                // let admindataping = await getAdmin(body.userId)

                // console.log("adminData",admindataping)
        
                // let usersDataping = await getTicketByUserId(body.userId)
        
                // console.log("usersData",usersDataping)
        
                // await sendToAll(admindataping ,{ data : usersDataping })


                //ping ticket by ticket 
        
                let arrPing  = await getTicketToPing(body.userId)

                console.log("ticket to ping in pingFunction ",arrPing)


               

                  if(arrPing.length != 0){
      
                    for(var i = 0; i < arrPing.length; i++) {
                      console.log("conn id pinger",arrPing[i].connId)

                      sendToOne(arrPing[i].connId ,{ pingdata : "wake up !!"  })
          
                   }
              }




            //ping queue
            let QueueNotifData = await specialgetListQueue(body.userId)

            if(QueueNotifData.length != 0){
                  
              for(var i = 0; i < QueueNotifData.length; i++) {

                sendToOne(QueueNotifData[i].connId ,{ pingdata : "wake up !!" })

            }
            }
            //ping subqueue

            let subQueueNotifData = await specialgetListSubQueue(body.userId)

            
            if(subQueueNotifData.length != 0){
                  
              for(var i = 0; i < subQueueNotifData.length; i++) {

                sendToOne(subQueueNotifData[i].connId ,{ pingdata : "wake up !!" })

            }
            }

                  
    
          break

      case 'specialconfirm':

        
                let conarrPing  = await getTicketToPing(body.userId)

                console.log("ticket to ping",conarrPing)


                if(conarrPing.length != 0){


                    const allTick = conarrPing.map(async (i) => {
                      console.log(i)

                      sendToOne(i.connId ,{ continuousData : i })
          
                    });
          
                    Promise.all(allTick);


                }
    
    
          break

      case 'pingenduser':


        let itemsPing = await databaseManager.queryConnTable(CONN_TABLE, body.ticketConnId);

          await sendToOne(body.ticketConnId ,{ pingdata : itemsPing[0] })

          break

      default:
          console.log('Received unknown route:', route)
  }
console.log("at the end")
  return {}
}



const sendToOne = async (id, body) =>{

  try{
    const params = {
      ConnectionId: id,
      Data: Buffer.from(JSON.stringify(body))
    }
  
    await  api.postToConnection(params).promise()
  
  }
  catch (err){
    if (err.statusCode === 410) {
      console.log(err)

      console.log("nested element",id)

     let nestedItem = await databaseManager.updateItemConn(CONN_TABLE, id, "disconnected", true);

            if(nestedItem.userId == undefined){
              await  deleteTicket(id)


            }




  } else {
    console.log(err)
  }


  }
  
  }


  const sendToAll = async (ids, body) =>{
    const all = ids.map(async ({ connId }) => {
      console.log(connId);
    
        await sendToOne(connId, body);

    });
    
    return Promise.all(all);
  }
  



const getAdmin = async (iduse) =>{
  if(iduse == undefined){
    return [];
  }
  let connectionData;
  try{
  
    connectionData = await ddb.scan(
      { TableName: CONN_TABLE,
        ProjectionExpression: 'connId',
        FilterExpression: "#iduse= :iduse  AND  #role= :role AND #disconnected= :disconnected",
        ExpressionAttributeValues: {
          ":iduse": iduse,
          ":role": "admin",
          ":disconnected": false
        } ,

        ExpressionAttributeNames: {
          "#iduse": "iduse",
          "#role": "role",
          "#disconnected": "disconnected",
      },
  }).promise();
  
  }
  catch (err){
    console.log(err)
  }
  
  return  connectionData.Items  ;
  
  }


const getListSubQueue= async (userId,subQueueId) =>{
  let connectionData;
  try{
  
    connectionData = await ddb.scan(
      { TableName: CONN_TABLE,
        ProjectionExpression: 'connId',
        FilterExpression: "#userId= :userId  AND  #role= :role AND  #subQueueId= :subQueueId AND  #disconnected= :disconnected",
        ExpressionAttributeValues: {
          ":userId": userId,
          ":role": "subqueue",
          ":subQueueId": subQueueId,
          ":disconnected": false

        } ,

        ExpressionAttributeNames: {
          "#userId": "userId",
          "#role": "role",
          "#subQueueId": "subQueueId",
          "#disconnected": "disconnected",
      },
  }).promise();
  
  }
  catch (err){
    console.log(err)
  }
  
  return  connectionData.Items
  
  }

const getConectedListSubQueue= async (userId) =>{
  let connectionData;
  try{
  
    connectionData = await ddb.scan(
      { TableName: CONN_TABLE,
        ProjectionExpression: 'connId',
        FilterExpression: "#userId= :userId  AND  #role= :role AND #disconnected= :disconnected",
        ExpressionAttributeValues: {
          ":userId": userId,
          ":role": "subqueue",
          ":disconnected": false

        } ,

        ExpressionAttributeNames: {
          "#userId": "userId",
          "#role": "role",
          "#disconnected": "disconnected",
      },
  }).promise();
  
  }
  catch (err){
    console.log(err)
  }
  
  return  connectionData.Items
  
  }


const pingListSubQueue = async (userId) =>{
  let connectionData;
  try{
  
    connectionData = await ddb.scan(
      { TableName: CONN_TABLE,
        ProjectionExpression: 'connId',
        FilterExpression: "#userId= :userId  AND  #role= :role AND  #disconnected= :disconnected",
        ExpressionAttributeValues: {
          ":userId": userId,
          ":role": "subqueue",
          ":disconnected": false

        } ,

        ExpressionAttributeNames: {
          "#userId": "userId",
          "#role": "role",
          "#disconnected": "disconnected",
      },
  }).promise();
  
  }
  catch (err){
    console.log(err)
  }
  
  return  connectionData.Items
  
}





const getListQueue= async (userId,queueId) =>{
  let connectionData;
  try{
  
    connectionData = await ddb.scan(
      { TableName: CONN_TABLE,
        ProjectionExpression: 'connId',
        FilterExpression: "#userId= :userId  AND  #role= :role AND  #queueId= :queueId AND #disconnected= :disconnected",
        ExpressionAttributeValues: {
          ":userId": userId,
          ":role": "queue",
          ":queueId": queueId,
          ":disconnected": false

        } ,

        ExpressionAttributeNames: {
          "#userId": "userId",
          "#role": "role",
          "#queueId": "queueId",
          "#disconnected": "disconnected",

      },
  }).promise();
  
  }
  catch (err){
    console.log(err)
  }
  
  return  connectionData.Items
  
  }


const specialgetListQueue= async (userId) =>{
  let connectionData;
  try{
  
    connectionData = await ddb.scan(
      { TableName: CONN_TABLE,
        // ProjectionExpression: 'connId',
        FilterExpression: "#userId= :userId  AND  #role= :role AND #disconnected= :disconnected",
        ExpressionAttributeValues: {
          ":userId": userId,
          ":role": "queue",
          ":disconnected": false

        } ,

        ExpressionAttributeNames: {
          "#userId": "userId",
          "#role": "role",
          "#disconnected": "disconnected",

      },
  }).promise();
  
  }
  catch (err){
    console.log(err)
  }
  
  return  connectionData.Items
  
  }

const specialgetListSubQueue= async (userId) =>{
  let connectionData;
  try{
  
    connectionData = await ddb.scan(
      { TableName: CONN_TABLE,
        // ProjectionExpression: 'connId',
        FilterExpression: "#userId= :userId  AND  #role= :role AND #disconnected= :disconnected",
        ExpressionAttributeValues: {
          ":userId": userId,
          ":role": "subqueue",
          ":disconnected": false

        } ,

        ExpressionAttributeNames: {
          "#userId": "userId",
          "#role": "role",
          "#disconnected": "disconnected",

      },
  }).promise();
  
  }
  catch (err){
    console.log(err)
  }
  
  return  connectionData.Items
  
  }


const getqueue = async (userId,queueId) =>{
  let connectionData;
  try{
  
    connectionData = await ddb.scan(
      { TableName: CONN_TABLE,
        FilterExpression: "( #userId= :userId AND #role= :role AND #deleted= :deleted ) AND (( #queueId= :queueId ) OR ( #isQueueSpecial= :isQueueSpecial ))  ",
        ExpressionAttributeValues: {
          ":userId": userId,
          ":queueId":queueId,
          ":role": "ticket",
          ":deleted": false,
          ":isQueueSpecial": true

        } ,

        
      ExpressionAttributeNames: {
        "#userId": "userId",
        "#queueId": "queueId",
        "#role": "role",
        "#deleted": "deleted",
        "#isQueueSpecial": "isQueueSpecial",

    },

   
  }).promise();
  
  }
  catch (err){
    console.log(err)
  }
  
  return  connectionData.Items
  
  }




const getsubqueue = async (userId,subQueueId) =>{
  if(subQueueId == undefined){
    return  [];


  }
  let connectionData;
  try{


    connectionData = await ddb.scan(
      { TableName: CONN_TABLE,
        FilterExpression: " (#userId= :userId AND #role= :role AND #deleted = :deleted) AND (( #subQueueId= :subQueueId ) OR ( #isSubQueueSpecial= :isSubQueueSpecial )) ",
        ExpressionAttributeValues: {
          ":userId": userId,
          ":subQueueId":subQueueId,
          ":role": "ticket",
          ":deleted": false,
          ":isSubQueueSpecial": true


        } ,

        
      ExpressionAttributeNames: {
        "#userId": "userId",
        "#subQueueId": "subQueueId",
        "#role": "role",
        "#deleted": "deleted",
        "#isSubQueueSpecial": "isSubQueueSpecial",

    },

   
  }).promise();

  
  }
  catch (err){
    console.log(err)
  }
  
  return  connectionData.Items
  
  }







const getTicketByUserId = async (userId) =>{
  let connectionData;
  try{
  
    connectionData = await ddb.scan(
      { TableName: CONN_TABLE,
        // ProjectionExpression: 'connId',
        FilterExpression: "#userId = :userId AND #role= :role AND #deleted = :deleted ",
        ExpressionAttributeValues: {
          ":userId": userId,
          ":role": "ticket",
          ":deleted": false

        } ,

        ExpressionAttributeNames: {
          "#userId": "userId",
          "#role": "role",
          "#deleted": "deleted"
      },
   
  }).promise();
  
  }
  catch (err){
    console.log(err)
  }
  
  return  connectionData.Items
  
  }


const getTicketToPing= async (userId) =>{
  let connectionData;
  try{
  
    connectionData = await ddb.scan(
      { TableName: CONN_TABLE,
        // ProjectionExpression: 'connId',
        FilterExpression: "#userId = :userId AND #role= :role AND #deleted = :deleted AND #disconnected = :disconnected ",
        ExpressionAttributeValues: {
          ":userId": userId,
          ":role": "ticket",
          ":deleted": false,
          ":disconnected": false

        } ,

        ExpressionAttributeNames: {
          "#userId": "userId",
          "#role": "role",
          "#deleted": "deleted",
          "#disconnected": "disconnected"
      },
   
  }).promise();
  
  }
  catch (err){
    console.log(err)
  }
  
  return  connectionData.Items
  
  }






async function addConnectionId(event) {

  const identity = event.requestContext.identity;


  const body= JSON.parse(event.body);
  let queueId = body.queueId || "";
  let subQueueId = body.subQueueId || "";
  let userId = body.userId || "";

  let ticketNum = await getTicketNum(userId);
  let isQueueSpecial = await checkQueueSpecial(userId,queueId);
  console.log("isQueueSpecial",isQueueSpecial)

  let isSubQueueSpecial = await checkSubQueueSpecial(userId,queueId,subQueueId);
  console.log("isSubQueueSpecial",isSubQueueSpecial)

  const now = new Date();

  //ticket

  const param = {
    TableName: CONN_TABLE,
    Item: {
      connId: event.requestContext.connectionId,
      queueId: queueId,
      subQueueId: subQueueId,
      userId: userId,
      isQueueSpecial: isQueueSpecial || false,
      isSubQueueSpecial: isSubQueueSpecial || false,
      numero: ticketNum || 0,
      note: "",
      role: "ticket",
      callNumber: 0,
      identity: identity,
      confirmed: false,
      disconnected: false,
      isContiousCalled: false,
      stopContiousCalled: true,
      ready: false,
      active: true,
      deleted: false,
      deletedbyenduser: false,
      created_date: now.toISOString()


    }
  };


  try {
    await ddb.put(param).promise();
  } catch (err) {
    console.log(err)
 
  }

  return param.Item;


}


async function reSetConnectionId(event) {

  const body= JSON.parse(event.body);
  let oldTicketConnId = body.oldTicketConnId ;



   
  let items = await databaseManager.queryConnTable(CONN_TABLE, oldTicketConnId);

  console.log("event connId",event.requestContext.connectionId , "old connId",oldTicketConnId)
  if (event.requestContext.connectionId != oldTicketConnId){
    console.log("fi wset conndition event.requestContext.connectionId != oldTicketConnId")

    if(items.length != 0){
        items[0].connId = event.requestContext.connectionId;
        items[0].disconnected = false
        console.log( "new data bro ",items[0])

      


      //ticket

      const param = {
        TableName: CONN_TABLE,
        Item: items[0]
      };


      try {
        await ddb.put(param).promise();
      } catch (err) {
        console.log(err)
    
      }console.log("oldTicketConnId pour supprimer",oldTicketConnId)
      await deleteTicket(oldTicketConnId)


      return param.Item;

    }
}
console.log("barra men conndition event.requestContext.connectionId != oldTicketConnId")


    items[0].disconnected = false


    //ticket

    const param = {
    TableName: CONN_TABLE,
    Item: items[0]
    };


    try {
    await ddb.put(param).promise();
    } catch (err) {
    console.log(err)

    }


    return param.Item;

}



const getTicketNum = async (userId) => {

  let items;
  try {
  items = await databaseManager.queryTable(USERS_TABLE, userId);
  if (items.length === 0) {
    console.log("empty table")
  }
} catch (err) {
  console.log(err)
}

  let oldbeepCount = items[0].beepscount;
  let  newVal =oldbeepCount + 1;



    let paramName1 = "beepscount";

    await databaseManager.updateItemUser(USERS_TABLE, userId,items[0].created_date, paramName1, newVal);

return newVal;


}


const checkQueueSpecial = async (userId,queueId) => {
  let result;
  let items;
  try {
  items = await databaseManager.queryTable(USERS_TABLE, userId);
  if (items.length === 0) {
    console.log("empty table")
  }
} catch (err) {
  console.log(err)
}

let  arr =  items[0].queues;


for(var i = 0; i < arr.length; i++) {
  if(arr[i].idQueue == queueId) {
      result = arr[i].special ;
      break;
  }
}


return result;


}

const checkSubQueueSpecial = async (userId,queueId,subQueueId) => {
  let result;
  let items;
  try {
  items = await databaseManager.queryTable(USERS_TABLE, userId);
  if (items.length === 0) {
    console.log("empty table")
  }
} catch (err) {
  console.log(err)
}

let  arr =  items[0].queues;


for(var i = 0; i < arr.length; i++) {
  if(arr[i].idQueue == queueId) {
    for(var j = 0; j < arr[i].subQueues.length; j++) {

      if(arr[i].subQueues[j].idSubQueue == subQueueId) {


        result = arr[i].subQueues[j].special ;

        break;
      } 
    }
  }
}



return result;


}



const updateTicketCallNum = async (connectionId) => {

 
  let items = await databaseManager.queryConnTable(CONN_TABLE, connectionId);


  let oldCallNum = items[0].callNumber;
  let  newCallNum =oldCallNum + 1;



    let paramName1 = "callNumber";

     await databaseManager.updateItemConn(CONN_TABLE, connectionId, paramName1, newCallNum);

    const data =await databaseManager.updateItemConn(CONN_TABLE, connectionId, "ready", true);


  return { id2 : data.userId , queueId2 : data.queueId , subQueueId2 : data.subQueueId}

}




async function addAdmin(connectionId,iduse) {
  const now = new Date();


  const param = {
    TableName: CONN_TABLE,
    Item: {
      connId: connectionId,
      iduse: iduse ,
      role: "admin" ,
      disconnected: false,
      created_date: now.toISOString()
    }
  };


  try {
    await ddb.put(param).promise();
  } catch (err) {
    return { statusCode: 500, body: err };

  }

  return { };



}


async function addQueueListen(event) {
  const now = new Date();

  const body= JSON.parse(event.body);
  let userId = body.userId || "";
  let queueId = body.queueId || "";

  const param = {
    TableName: CONN_TABLE,
    Item: {
      connId: event.requestContext.connectionId,
      userId: userId,
      queueId: queueId,
      role: "queue",
      disconnected: false,

      created_date: now.toISOString()
    }
  };


  try {
    await ddb.put(param).promise();
  } catch (err) {
    console.log(err)
  }

  return param;


}

async function addSubQueueListen(event) {
  const now = new Date();

  const body= JSON.parse(event.body);
  let userId = body.userId || "";
  let subQueueId = body.subQueueId || "";


  const param = {
    TableName: CONN_TABLE,
    Item: {
      connId: event.requestContext.connectionId,
      userId: userId,
      subQueueId: subQueueId,
      role: "subqueue",
      created_date: now.toISOString(),
      disconnected: false,

    }
  };


  try {
    await ddb.put(param).promise();
  } catch (err) {
    console.log(err)
  }

  return param;


}


async function deleteConnectionId(event) {

  const param = {
    TableName: CONN_TABLE,
    Key: {
      connId: event.requestContext.connectionId
    }
  };


  try {
    await ddb.delete(param).promise();
  } catch (err) {
    console.log(err)

    return { statusCode: 500, body: err };

  }

  return {};





}



async function deleteTicket(ConnectionId) {


 let items = await databaseManager.queryConnTable(CONN_TABLE, ConnectionId);
console.log(items)
  const param = {
    TableName: CONN_TABLE,
    Key: {
      connId: ConnectionId
    }
  };


  try {
    await ddb.delete(param).promise();

  } catch (err) {
    console.log(err)
  }

return items[0];

}


async function noteTicket(connectionId,note) {


 let items = await databaseManager.queryConnTable(CONN_TABLE, connectionId);


 let paramName1 = "note";
 let paramvalue = note;

let  data;
  try {

     data = await databaseManager.updateItemConn(CONN_TABLE, connectionId, paramName1, paramvalue);  
    } catch (err) {
    console.log(err)
  }
  console.log("udser Id ", data)

return {id3 : items[0].userId, queueId3: items[0].queueId};

}


async function confirmTicket(connectionId) {


 let items = await databaseManager.queryConnTable(CONN_TABLE, connectionId);


 let paramName1 = "confirmed";
 let paramvalue = true;
let data;
  try {

    data =  await databaseManager.updateItemConn(CONN_TABLE, connectionId, paramName1, paramvalue);  
    } catch (err) {
    console.log(err)
  }

return {id1 :data.userId, queueId1 :data.queueId, subQueueId1 :data.subQueueId , isQueueSpecial1 :data.isQueueSpecial , isSubQueueSpecial1 :data.isSubQueueSpecial  };

}

