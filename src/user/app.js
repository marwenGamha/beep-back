"use strict";

const databaseManager = require(`./databaseManager`);
const config =require("./config.json")
const {authSchema,userauthSchema,superAdminSchema,commercialCompanyAuthSchema,commercialindivAuthSchema} =require("./schema")


const AWS = require("aws-sdk");
const { nanoid } = require("nanoid/async");
const axios = require('axios');

const { aws4Interceptor } = require("aws4-axios");
const luhn = require("luhn");

const Ajv = require("ajv")
const addFormats = require("ajv-formats")
const ajv = new Ajv({allErrors: true}) 
addFormats(ajv)



const interceptor = aws4Interceptor(
  {
    region: "eu-west-3",
    service: "execute-api",
  }
);


axios.interceptors.request.use(interceptor);




const dynamo = new AWS.DynamoDB.DocumentClient();
const cognito = new AWS.CognitoIdentityServiceProvider();
const s3 = new AWS.S3();
const now = new Date();


const TABLE_NAME = process.env.USERS_TABLE;
const TABLE_PACKS = process.env.PACKS_TABLE;
const RECLAMATION_TABLE = process.env.RECLAMATION_TABLE;

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

// get rest by id ticket beep genertae 
exports.lambdaHandler = async (event, context) => {
  switch (event.httpMethod) {

    case "DELETE":
      if (event.resource == "/users/{id}") {
        return deleteItem(event);
      }
      else if (event.resource == "/superadmin/userdelete/{id}") {
        return deleteAdminBrodcast(event);
      }
      
      
 
      

    case "GET":
      if (event.resource == "/users/isadmin/{id}") {
        return isAdmin(event);
      }
      else if (event.resource == "/users/{id}") {
        return getItemByEmail(event);   //get user by email
      }
      else if (event.resource == "/admin/cashback") {
        return getterCashBack();   
      }
      else if (event.resource == "/users/subuser/{id}") {
        return getItemCompanyId(event);  
      }
      else if (event.resource == "/users/byid/{id}") {
        return getItemQuery(event);  
      }
      else if (event.resource == "/users/isblocked/{id}") {
        return isBlocked(event);
      }      
      else if (event.resource  == "/users/validite/{id}") {
        return checkingDate(event);
      }
      else if (event.resource  == "/users/promocode/{id}") {
        return checkingPromo(event);
      }
      else if (event.path == "/users") {
        return adminGett();
      }
      else if (event.resource == "/packs") {
        return gatAllPacks(event);
      }
      else if (event.resource == "/packs/byid/{id}") {
        return gatPackByid(event);
      }
      else if (event.resource == "/users/stripe/history/{id}") {
        return getDashboardHistory(event);  //getDashboardHistory
      }
      else if (event.resource == "/users/stripe/cancelsub/{id}") {
        return cancelSubscription(event);
      }
      else if (event.resource == "/users/stripe/updatepay/{id}") {
        return updatePayment(event);
      }
      else if (event.resource == "/users/stripe/updatesub/{id}") {
        return subUpdate(event);
      }
      else if (event.resource == "/users/promo/all") {
        return getAllPromo(event);
      }
      else if (event.resource == "/admin/promocode/activate/{id}") {
        return activatePromo(event);
      }
      else if (event.resource == "/admin/promocode/deactivate/{id}") {
        return deactivatePromo(event);
      }
      else if (event.resource == "/reclamation/all") {
        return gellAllItems(RECLAMATION_TABLE);
      }
      else if (event.resource == "/users/bloquer/{id}") {
        return restaurantBloquer(event);
      }
      else if (event.resource == "/users/unbloquer/{id}") {
        return restaurantUnBloquer(event);
      }

  

    case "POST":
      if (event.resource == "/users") {
        return adminAction(event);
      }
      else if (event.resource == "/users/checkout/{id}") {
        return checkoutSession(event);
      }else if (event.resource == "/reclamation/submit") {
        return addReclamation(event);
      } 
      else if (event.resource == "/stripe/webhook") {
        console.log(event)
        return WEBHOOKS(event);
      }
      else if (event.resource == "/admin/promocode") {
        return createPromo(event);
      }
      else if (event.resource == "/users/update/subuser/{id}") {
        return updateCredentialSubUser(event);
      }    
      else if (event.path == "/users/confirmed") {
        return updateConfirmUser(event);
      }
      


    case "PUT":

      if (event.resource == "/users/update/{id}") {
        return updateCredentialUser(event);
      } 
      else if (event.resource == "/superadmin/userbloque/{id}") {
        return setAuthBlocker(event);
      } 
      else if (event.resource == "/users/updatecashback/{id}") {
        return CashBackSetter(event);
      } 
      else if (event.resource == "/users/updatepack/{id}") {
        return savePackDb(event);
      } else if (event.resource == "/users/addqueue/{id}") {
        return addQueue(event);
      }else if (event.resource == "/users/addsubqueue/{id}") {
        return addSubQueue(event);
      }else if (event.resource == "/users/savedb/{id}") {
        return saveAttachementDb(event);
      }else if (event.resource == "/users/deletedb/{id}") {
        return deleteAttachementDb(event);
      } 
      else if (event.resource == "/users/deletequeue/{id}") {
        return deleteQueue(event);   
      }else if (event.resource == "/users/deletesubqueue/{id}") {
        return deleteSubQueue(event);   
      }
      else if (event.resource == "/packs/update/{id}") {
        return updatePack(event);
      } 
      else if (event.resource == "/users/queue/{id}") {
        return getQueueById(event);
      } 
      else if (event.resource == "/users/siret") {
        return checkSiret(event);
      }
      else if (event.resource == "/users/address/{id}") {
        return updateAdress(event);
      } 
      else if (event.resource == "/users/biling/{id}") {
        return updateBilingInfo(event);
      } 
      else if (event.resource == "/queue/update/{id}") {
        return updateQueue(event);
      } else if (event.resource == "/user/updatesubqueue/{id}") {
        return updateSubQueue(event);
      } else if (event.queryStringParameters) {
        return presignedUrl(event);
      }

    default:
      return sendResponse(
        404,
        JSON.stringify(`Unsupported method  ${event.httpMethod} `)
      );
  }
};


const presignedUrl = async (event) => {
  const doc = event.queryStringParameters;

  let method = doc.method;
  let entite = doc.entite;
  let id_entite = doc.id_entite;
  let type = doc.type;
  let filename = doc.filename;

  let object = [entite, id_entite, type, filename].join("/");

  let methods = {
    get: "getObject",
    put: "putObject",
    delete: "deleteObject",
  };

  let params = {
    Bucket: process.env.BUCKET_NAME,
    Key: object, 
    Expires: 60,
  };
  const url = await s3.getSignedUrlPromise(methods[method], params);

  return sendResponse(200, JSON.stringify(url));
};




/****************************************firstTime Hook****************************************************/

const WEBHOOKS  = async (event) => {

  let data = JSON.parse(event.body);


if (data.event_type == "customer.subscription.created"){

  let itemsUser = await databaseManager.clientIdGetter(TABLE_NAME, data.customer_id);
       
  let itemsPacks = await databaseManager.packNameGetter(TABLE_PACKS, data.product_id);


  if(data.status == "trialing"){ //free trialing 


    await databaseManager.updateItem(TABLE_NAME, itemsUser[0].id, itemsUser[0].created_date, "payetat", data.status)



       let paramValue = {  
        packType: itemsPacks[0].id || "pack0",
        regDate: data.current_period_start || "NO-DATE",
        expDate: data.current_period_end || "NO-DATE",
    
      };


       return await databaseManager.updateItem(TABLE_NAME, itemsUser[0].id, itemsUser[0].created_date, "packs", paramValue)
       .then((response) => {
         return sendResponse(
           200,
           JSON.stringify(response)
         );
       })




  }


}

if (data.event_type == "customer.subscription.updated"){

  let itemsUser = await databaseManager.clientIdGetter(TABLE_NAME, data.customer_id);
       
  let itemsPacks = await databaseManager.packNameGetter(TABLE_PACKS, data.product_id);

  await databaseManager.updateItem(TABLE_NAME, itemsUser[0].id, itemsUser[0].created_date, "payetat", data.status)


       let paramValue = {  
        packType: itemsPacks[0].id || "pack0",
        regDate: data.current_period_start || "NO-DATE",
        expDate: data.current_period_end || "NO-DATE",
    
      };


       return await databaseManager.updateItem(TABLE_NAME, itemsUser[0].id, itemsUser[0].created_date, "packs", paramValue)
       .then((response) => {
         return sendResponse(
           200,
           JSON.stringify(response)
         );
       })
}


    if (data.event_type  == "invoice.payment_succeeded"){ 

      let itemsUser = await databaseManager.clientIdGetter(TABLE_NAME, data.customer_id);
          
      let itemsPacks = await databaseManager.packNameGetter(TABLE_PACKS, data.product_id);

      let bonusParam = [{
        amount_paid : data.amount_paid || 0,
        invoice_url : data.hosted_invoice_url || "",
        pack : itemsPacks[0].id || "",
        invoice_pdf : data.invoice_pdf ,
        date:now.toISOString(),
      }];

      await addPay(itemsUser[0].id,bonusParam);


      if(itemsUser[0].payetat == "active" && data.proration == false){  //caschBack
        await generateCashBack(itemsUser[0].id)
      }
    }


    
    if (data.event_type  == "customer.subscription.deleted"){ 
      let itemsUser = await databaseManager.clientIdGetter(TABLE_NAME, data.customer_id);
          

      let paramName ="queues";
      let paramValue =[];
      let paramName1 ="packs";
      let paramValue1 = null;

       await  databaseManager.updateItem(TABLE_NAME, itemsUser[0].id, itemsUser[0].created_date, paramName, paramValue)
       await  databaseManager.updateItem(TABLE_NAME, itemsUser[0].id, itemsUser[0].created_date, paramName1, paramValue1)

    }
    
};


const checkingvalidPromo = async (promoCode,iduser,userCreatedDate) => {

if(promoCode != ""){
     
      let items = await databaseManager.queryTable(TABLE_NAME, promoCode);
      if (items.length === 0) {
          const data = await axios.get(`${config.api.invokeurl}/promos`)
            const arr =  data.data;
            var indexOfPromo = arr.findIndex(i => i.code == promoCode && i.active == true);



          if (indexOfPromo != -1){
               return  await databaseManager.updateItem(TABLE_NAME, iduser, userCreatedDate,"promoCode", promoCode)  //update promo code 
          }






      }
      if (items.length != 0) {
       return  await  databaseManager.updateItem(TABLE_NAME, iduser, userCreatedDate, "referralId", promoCode)  //update promo code 
      }

    }
};




const getAllPromo = async () => {




    return await axios.get(`${config.api.invokeurl}/promos`)
          .then((data) => {
            const arr =  data.data;
            return sendResponse(
              200,
              JSON.stringify(arr)
            );
            })
          .catch((err) => {
            console.log(err)

            return sendResponse(
              400,
              JSON.stringify(err)
            );
            });
}


/********************************Paiement update sttus********************************************/

const generateCashBack = async (id) => {

  let items = await databaseManager.queryTable(TABLE_NAME, id);

  let items2 = await databaseManager.queryTable(TABLE_NAME, items[0].referralId);

  let bonusVal = await databaseManager.queryTable("config", "bonus");


    let paramValue2 = [{
      idpar: items[0].id,
      date:now.toISOString(),
      desc:`vous avez un nouveau bonus ${bonusVal[0].value} € de la cote de ${items[0].companyName} `,

    }];

    await addBonus(items[0].referralId,paramValue2)
    

    let bonusAmountInt = parseInt(bonusVal[0].value)


    return await databaseManager.upVoteBonus(TABLE_NAME, items[0].referralId, items2[0].created_date,bonusAmountInt)
    .then((response) => {
      return sendResponse(
        200,
        JSON.stringify({
          message: `item with this id : ${id} is successfully updated`,
        })
      );
    });

};


/**************************************** save user attachement db function ****************************************************/

const saveAttachementDb = async (event) => {

  
  const itemId = event.pathParameters.id;

  let { entite, type, filename,fileType,idQueue } = JSON.parse(event.body);

  let object = [entite, itemId, type, filename].join("/");


  let items = await databaseManager.queryTable(TABLE_NAME, itemId);

  if (items.length === 0) {
    return sendResponse(
      404,
      JSON.stringify({
        message: `item with this id : ${itemId} not found`,
      })
    );
  }

  if (type =="queue"){

    let params = {  
      entite: entite,
      idEntite: itemId,
      type: type,
      filename: filename,
      fileType: fileType,
      key: object,
    };

    const arr =  items[0].queues;

  for(var i = 0; i < arr.length; i++) {
    if(arr[i].idQueue == idQueue) {

        arr[i].queueImg = params;
        break;
    }
}

  let paramName ="queues"

  return await  databaseManager.updateItem(TABLE_NAME, items[0].id, items[0].created_date, paramName, arr)
    .then((response) => {
      return sendResponse(
        200,
        JSON.stringify(response)
      );
    })   
    .catch((err) => {
      console.log(err)

      return sendResponse(
        400,
        JSON.stringify({message : err})
      );
    });
  }
  if (type =="logo" || "menu"){

    let paramValue = {  
      entite: entite,
      idEntite: itemId,
      type: type,
      filename: filename,
      fileType: fileType,
      key: object,
    };

    
    return databaseManager
      .updateItem(TABLE_NAME, items[0].id, items[0].created_date, type, paramValue)
      .then((response) => {
        return sendResponse(
          200,
          JSON.stringify(response)
        );
      })
  }
};


/****************************************save pack db function ****************************************************/

const savePackDb = async (event) => {
  const itemId = event.pathParameters.id;

  let { packType, regDate, expDate} = JSON.parse(event.body);
  let items = await databaseManager.queryTable(TABLE_NAME, itemId);

  if (items.length === 0) {
    return sendResponse(
      404,
      JSON.stringify({
        message: `item with this id : ${itemId} not found`,
      })
    );
  }

  let paramValue = {  
    packType: packType || "pack 0",
    regDate: regDate || "NO-DATE",
    expDate: expDate || "NO-DATE",

  };


    let paramName ="packs"
    
    return databaseManager
      .updateItem(TABLE_NAME, items[0].id, items[0].created_date, paramName, paramValue)
      .then((response) => {
        return sendResponse(
          200,
          JSON.stringify(response)
        );
      })
};

// /*************************************add  queue to db */

const addQueue =async (event)=>{

  const itemId = event.pathParameters.id;

  let { name , desc, status ,special } = JSON.parse(event.body);
  let items = await databaseManager.queryTable(TABLE_NAME, itemId);

  if (items.length === 0) {
    return sendResponse(
      404,
      JSON.stringify({
        message: `item with this id : ${itemId} not found`,
      })
    );
  }

  if(items[0].packs == null){

    return sendResponse(
      403,
      JSON.stringify({
        message: "vous devez achter pack",
      })
    );
  }

  if(items[0].queues.length >= 1 && items[0].packs.packType == "pack1" ){

    return sendResponse(
      403,
      JSON.stringify({
        message: "vous devez mettre à jour votre pack",
      })
    );

  }

  if(items[0].queues.length >= 5){

    return sendResponse(
      403,
      JSON.stringify({
        message: "votre limit est 5 queue",
      })
    );

  }

  let params = [{  
    name: name,
    idQueue: await nanoid(10),
    status: status,
    special: special || false,
    desc: desc,
    subQueues:[],
    queueImg:{}

  }];



  let paramName ="queues"

  return await  databaseManager.updateItemList(TABLE_NAME, items[0].id, items[0].created_date, paramName, params)
    .then((response) => {
      return sendResponse(
        200,
        JSON.stringify(response)
      );
    })   
    .catch((err) => {
      console.log(err)

      return sendResponse(
        400,
        JSON.stringify({message : err})
      );
    });

}

// /*************************************delete queue to db */

const deleteQueue =async (event)=>{

  const itemId = event.pathParameters.id;

  let { idQueue } = JSON.parse(event.body);
  let items = await databaseManager.queryTable(TABLE_NAME, itemId);

  if (items.length === 0) {
    return sendResponse(
      404,
      JSON.stringify({
        message: `item with this id : ${itemId} not found`,
      })
    );
  }

  let  arr =  items[0].queues;



  for(var i = 0; i < arr.length; i++) {
    if(arr[i].idQueue == idQueue) {
        arr.splice(i, 1);
        break;
    }
}
  let paramName ="queues"

  return await  databaseManager.updateItem(TABLE_NAME, items[0].id, items[0].created_date, paramName, arr)
    .then((response) => {
      return sendResponse(
        200,
        JSON.stringify(response)
      );
    })   
    .catch((err) => {
      console.log(err)

      return sendResponse(
        400,
        JSON.stringify({message : err})
      );
    });

}



// /*************************************delete queue to db */

const getQueueById =async (event)=>{

  const itemId = event.pathParameters.id;

  let { idQueue } = JSON.parse(event.body);
  let items = await databaseManager.queryTable(TABLE_NAME, itemId);

  if (items.length === 0) {
    return sendResponse(
      404,
      JSON.stringify({
        message: `item with this id : ${itemId} not found`,
      })
    );
  }

  const arr =  items[0].queues;

  var indexOfQueue = arr.findIndex(i => i.idQueue === idQueue);
  console.log('The index of the queue is ' + indexOfQueue);


if (indexOfQueue == -1){
  return sendResponse(
    404,
    JSON.stringify({
      message: `queue with this id : ${idQueue} not found`,
    })
  );
}


return sendResponse(
  200,
  JSON.stringify(items[0].queues[indexOfQueue])
);

}


// /*************************************update queue to db */

const updateQueue =async (event)=>{

  const itemId = event.pathParameters.id;

  let { idQueue,name,desc,status , special } = JSON.parse(event.body);

  let items = await databaseManager.queryTable(TABLE_NAME, itemId);

  if (items.length === 0) {
    return sendResponse(
      404,
      JSON.stringify({
        message: `item with this id : ${itemId} not found`,
      })
    );
  }

  let  arr =  items[0].queues;



  for(var i = 0; i < arr.length; i++) {
    if(arr[i].idQueue == idQueue) {
        arr[i].name =name;
        arr[i].desc =desc;
        arr[i].status =status;
        arr[i].special =special || false;
        break;
    }
}
  let paramName ="queues"

  return await  databaseManager.updateItem(TABLE_NAME, items[0].id, items[0].created_date, paramName, arr)
    .then((response) => {
      return sendResponse(
        200,
        JSON.stringify(response)
      );
    })   
    .catch((err) => {
      console.log(err)

      return sendResponse(
        400,
        JSON.stringify({message : err})
      );
    });

}






/*************************************add sous file selon le besoin */

const addSubQueue =async (event)=>{

  const itemId = event.pathParameters.id;

  let { name, desc,idQueue,status,special } = JSON.parse(event.body);



  let items = await databaseManager.queryTable(TABLE_NAME, itemId);

  if (items.length === 0) {
    return sendResponse(
      404,
      JSON.stringify({
        message: `item with this id : ${itemId} not found`,
      })
    );
  }

  const arr =  items[0].queues;

  var indexOfQueue = arr.findIndex(i => i.idQueue === idQueue);
  console.log('The index of the queue is ' + indexOfQueue);


if (indexOfQueue == -1){
  return sendResponse(
    404,
    JSON.stringify({
      message: `queue with this id : ${idQueue} not found`,
    })
  );
}


  let arrValue =  items[0].queues[indexOfQueue].subQueues;
  
  if(items[0].packs.packType != "pack3" ){

    return sendResponse(
      403,
      JSON.stringify({
        message: "vous devez mettre à jour votre pack",
      })
    );

  }

  if(arrValue.length >= 5){

    return sendResponse(
      403,
      JSON.stringify({
        message: "votre limit est 5 sous file",
      })
    );

  }


let paramValue = {  
  name: name,
  idSubQueue: await nanoid(10),
  status: status,
  desc: desc,
  special: special || false,

};


arrValue.push(paramValue)

  return databaseManager
  .updateElementList(TABLE_NAME, items[0].id, items[0].created_date, arrValue,indexOfQueue)
  .then((response) => {
    return sendResponse(
      200,
      JSON.stringify(response)
    );
  })
  .catch((err) => {
    console.log(err)
    return sendResponse(
      400,
      JSON.stringify( err)
    );
  });
}



// /*************************************delete subQueue from db */

const deleteSubQueue =async (event)=>{

  const itemId = event.pathParameters.id;

  let { idQueue,idSubQueue } = JSON.parse(event.body);
  let items = await databaseManager.queryTable(TABLE_NAME, itemId);

  if (items.length === 0) {
    return sendResponse(
      404,
      JSON.stringify({
        message: `item with this id : ${itemId} not found`,
      })
    );
  }

  let  arr =  items[0].queues;



  for(var i = 0; i < arr.length; i++) {
    if(arr[i].idQueue == idQueue) {
      for(var j = 0; j < arr[i].subQueues.length; j++) {

        if(arr[i].subQueues[j].idSubQueue == idSubQueue) {

          arr[i].subQueues.splice(j, 1);
          break;
        }
      }
    }
}

  let paramName ="queues"

  return await  databaseManager.updateItem(TABLE_NAME, items[0].id, items[0].created_date, paramName, arr)
    .then((response) => {
      return sendResponse(
        200,
        JSON.stringify(response)
      );
    })   
    .catch((err) => {
      console.log(err)

      return sendResponse(
        400,
        JSON.stringify({message : err})
      );
    });

}


// /*************************************update subqueue to db */

const updateSubQueue =async (event)=>{

  const itemId = event.pathParameters.id;

  let { idQueue,idSubQueue,name,desc,status,special } = JSON.parse(event.body);

  let items = await databaseManager.queryTable(TABLE_NAME, itemId);

  if (items.length === 0) {
    return sendResponse(
      404,
      JSON.stringify({
        message: `item with this id : ${itemId} not found`,
      })
    );
  }

  let  arr =  items[0].queues;




  for(var i = 0; i < arr.length; i++) {
    if(arr[i].idQueue == idQueue) {
      for(var j = 0; j < arr[i].subQueues.length; j++) {

        if(arr[i].subQueues[j].idSubQueue == idSubQueue) {

          arr[i].subQueues[j].name =name;
          arr[i].subQueues[j].desc =desc;
          arr[i].subQueues[j].status =status;
          arr[i].subQueues[j].special =special || false;

          break;
        } 
      }
    }
}

  let paramName ="queues"

  return await  databaseManager.updateItem(TABLE_NAME, items[0].id, items[0].created_date, paramName, arr)
    .then((response) => {
      return sendResponse(
        200,
        JSON.stringify(response)
      );
    })   
    .catch((err) => {
      console.log(err)

      return sendResponse(
        400,
        JSON.stringify({message : err})
      );
    });

}



/****************************************delete attachement db function ****************************************************/

const deleteAttachementDb = async (event) => {
  const itemId = event.pathParameters.id;
  let {type } = JSON.parse(event.body);

  let items = await databaseManager.queryTable(TABLE_NAME, itemId);

  if (items.length === 0) {
    return sendResponse(
      404,
      JSON.stringify({
        message: `item with this id : ${itemId} not found`,
      })
    );
  }

    if (type =="queue"){

      let {index } = JSON.parse(event.body);

      let paramValue = {}
      return databaseManager
        .updateList(TABLE_NAME, items[0].id, items[0].created_date, paramValue,index)
        .then((response) => {
          return sendResponse(
            200,
            JSON.stringify(response)
          );
        })
        .catch((err) => {
          console.log(err)
          return sendResponse(
            400,
            JSON.stringify( err)
          );
        });
    }

    if (type =="logo" || "menu"){
      let paramValue = {}
      return databaseManager
        .updateItem(TABLE_NAME, items[0].id, items[0].created_date, type, paramValue)
        .then((response) => {
          return sendResponse(
            200,
            JSON.stringify(response)
          );
        })
    
    }
};

/****************************************get item by id function****************************************************/
const getItemQuery = async (event) => {
  const itemId = event.pathParameters.id;
  let items;

  try {
    items = await databaseManager.queryTable(TABLE_NAME, itemId);
  } catch (err) {
    return sendResponse(
      500,
      JSON.stringify({
        message: err,
      })
    );
  }
  if (items.length === 0) {
    return sendResponse(
      404,
      JSON.stringify({
        message: `item with this id : "${itemId}" not found`,
      })
    );
  }
  return sendResponse(200, JSON.stringify(items[0]));
};
/****************************************get item by email function****************************************************/
const getItemByEmail = async (event) => {
  const itemId = event.pathParameters.id;

  let items;


  try {
    items = await databaseManager.queryTableByEmail(TABLE_NAME, itemId);

    if (items.length === 0) {
      return sendResponse(
        404,
        JSON.stringify({
          message: `item with this email : ${itemId} not found`,
        })
      );
    }
  } catch (err) {
    return sendResponse(
      500,
      JSON.stringify({
        message: err,
      })
    );
  }

  let responde= {
     email :items[0].email,
     id :items[0].id,
     responsableFullName :items[0].responsableFullName,
     companyName :items[0].companyName,
     group :items[0].group,
     isAuthorized :items[0].isAuthorized,

  }

  return sendResponse(200, JSON.stringify(responde));
};

/****************************************get item by companyid function****************************************************/
const getItemCompanyId = async (event) => {
  const itemId = event.pathParameters.id;

  let items;


  try {
    items = await databaseManager.queryTableByCompanyId(TABLE_NAME, itemId);

    if (items.length === 0) {
      return sendResponse(
        200,
        JSON.stringify([])
      );
    }
  } catch (err) {
    return sendResponse(
      500,
      JSON.stringify({
        message: err,
      })
    );
  }


  return sendResponse(200, JSON.stringify(items));
};



/****************************************unAuthorzied all subUser by user function****************************************************/
const setAuthBlocker = async (event) => {
  const itemId = event.pathParameters.id;

  let { status } = JSON.parse(event.body);




  
    let items = await databaseManager.queryTableByCompanyId(TABLE_NAME, itemId);  //list of campany by id 
    let paramName ="isAuthorized"
    let paramValue = status

    if (items.length === 0) {


      let  itemsAdmin = await databaseManager.queryTable(TABLE_NAME, itemId);
      await  databaseManager.updateItem(TABLE_NAME, itemsAdmin[0].id, itemsAdmin[0].created_date, paramName, paramValue )

      return sendResponse(
        200,
        JSON.stringify({message: "admin n'a pas des utilisateurs",})
      );
    }


  

    try {

      const all = items.map(async ({ id,created_date }) => {

        await  databaseManager.updateItem(TABLE_NAME, id, created_date, paramName, paramValue )

      });

          Promise.all(all);

      let  itemsAdmin = await databaseManager.queryTable(TABLE_NAME, itemId);
      await  databaseManager.updateItem(TABLE_NAME, itemsAdmin[0].id, itemsAdmin[0].created_date, paramName, paramValue )

      return sendResponse(
        200,
        JSON.stringify({
          message: "succfully updated data",
        })
      );


  } catch (err) {
    return sendResponse(
      500,
      JSON.stringify({
        message: err,
      })
    );
  }


};

/****************************************unAuthorzied all subUser by user function****************************************************/
const deleteAdminBrodcast = async (event) => {
  const itemId = event.pathParameters.id;


    let items = await databaseManager.queryTableByCompanyId(TABLE_NAME, itemId);  //list of campany by id 


    if (items.length === 0) {

      let  itemsAdmin = await databaseManager.queryTable(TABLE_NAME, itemId);

      await cognito.adminDeleteUser({UserPoolId: process.env.USER_POOL_ID,Username: itemsAdmin[0].email}).promise();
  
      await databaseManager.deleteItem(TABLE_NAME, itemsAdmin[0].id, itemsAdmin[0].created_date);

      await  deleteSubUser(itemsAdmin[0].clientId) 

      return sendResponse(
        200,
        JSON.stringify({message: "admin n'a pas des utilisateurs",})
      );
    }


    try {

          const all = items.map(async ({ id,created_date,email }) => {


            await cognito.adminDeleteUser({UserPoolId: process.env.USER_POOL_ID,Username: email}).promise();
      
            await databaseManager.deleteItem(TABLE_NAME, id, created_date);



            // await deleteSubUser (id,created_date,email)

          });

          Promise.all(all);

         let  itemsAdmin = await databaseManager.queryTable(TABLE_NAME, itemId);

          await cognito.adminDeleteUser({UserPoolId: process.env.USER_POOL_ID,Username: itemsAdmin[0].email}).promise();
      
          await databaseManager.deleteItem(TABLE_NAME, itemsAdmin[0].id, itemsAdmin[0].created_date);

          await  deleteSubUser(itemsAdmin[0].clientId) 


          return sendResponse(
              200,
              JSON.stringify({
                message: "succfully updated data",
              })
            );


  } catch (err) {
    return sendResponse(
      500,
      JSON.stringify({
        message: err,
      })
    );
  }


};


/****************************************boolean function return is user is admin by email****************************************************/

const isAdmin = async (event) => {
  const itemId = event.pathParameters.id;
  let items;

  try {
    items = await databaseManager.queryTableByEmail(TABLE_NAME, itemId);

    if (items.length === 0) {
      return sendResponse(
        404,
        JSON.stringify({
          message: `item with this email : ${itemId} not found`,
        })
      );
    }


  } catch (err) {
    return sendResponse(
      500,
      JSON.stringify({
        message: err,
      })
    );
  }

  let data = items[0];
  if (data["group"] == "superAdmin") {
    return sendResponse(
      200,
      JSON.stringify({
        message: true,
      })
    );
  }

  return sendResponse(
    200,
    JSON.stringify({
      message: false,
    })
  );
};


/****************************************cashBack****************************************************/

const getterCashBack = async () => {
  let items;

  try {
     items = await databaseManager.queryTable("config", "bonus");

  } catch (err) {
    return sendResponse(
      500,
      JSON.stringify({
        message: err,
      })
    );
  }

  return sendResponse(
    200,
    JSON.stringify({
      amount: items[0].value,
    })
  );
};

/****************************************boolean function return is user is admin by email****************************************************/

const adminGett = async () => {
  // const itemId = event.pathParameters.id;
  let items;

  try {
    items = await databaseManager.adminGetter(TABLE_NAME);

    if (items.length === 0) {
      return sendResponse(
        200,
        JSON.stringify([])
      );
    }


  } catch (err) {
    return sendResponse(
      500,
      JSON.stringify({
        message: err,
      })
    );
  }


  return sendResponse(
    200,
    JSON.stringify(items)
  );
};

/****************************************boolean function check if user is blocked****************************************************/

const isBlocked = async (event) => {
  const itemId = event.pathParameters.id;
  let items;

  try {
    items = await databaseManager.queryTableByEmail(TABLE_NAME, itemId);

    if (items.length === 0) {
      return sendResponse(
        404,
        JSON.stringify({
          message: "Email non trouvé",
        })
      );
    }

  } catch (err) {
    return sendResponse(
      500,
      JSON.stringify({
        message: err,
      })
    );
  }

  let data = items[0];
  if (data["isAuthorized"] == true) {
    return sendResponse(
      200,
      JSON.stringify({
        message: false,
      })
    );
  }

  return sendResponse(
    200,
    JSON.stringify({
      message: true,
    })
  );
};

/****************************************get all Restaurant items function****************************************************/

const gellAllItems = async (TABLE_NAME) => {
  let params = {
    TableName: TABLE_NAME,
  };

  let scanResults = [];
  let items;
  do {
    items = await dynamo.scan(params).promise();
    items.Items.forEach((item) => scanResults.push(item));
    params.ExclusiveStartKey = items.LastEvaluatedKey;
  } while (typeof items.LastEvaluatedKey != "undefined");

  if (!scanResults) {
    return sendResponse(
      404,
      JSON.stringify({
        message: "empty table",
      })
    );
  }
  return sendResponse(200, JSON.stringify(scanResults));
};


/****************************************unique siret num****************************************************/

const checkSiret = async (event) => {
//55203253400646
  let {siret } = JSON.parse(event.body);

 
  let is_valid = luhn.validate(siret);

  if (is_valid == false) {
    return sendResponse(
      200,
      JSON.stringify({
        message: "format Siret invalide",
      })
    );
  }


  let  items = await databaseManager.siretChecker(TABLE_NAME, siret);



  if (items.length === 0) {
    return sendResponse(
      200,
      JSON.stringify({
        message: "valide",
      })
    );
  }

  return sendResponse(
    200,
    JSON.stringify({
      message: "Numéro siret deja existant",
    })
  );


};


/****************************************unique siret num****************************************************/

const checkingPromo = async (event) => {

const id = event.pathParameters.id;


  let  items = await databaseManager.queryTable(TABLE_NAME, id);



  if (items.length != 0) {


    return sendResponse(
      400,
      JSON.stringify({
        message: "code de parrainage valide",
      })
    );

  }

  return sendResponse(
    200,
    JSON.stringify({
      message: "code de parrainage invalide ",
    })
  );





};

/****************************************create user(cognito+DB) function****************************************************/

const adminAction = async (event) => {

/*****************************validation */
  let data;

  try{
  data = JSON.parse(event.body)

  } catch (err) {
    return sendResponse(
      500,
      JSON.stringify({
        message: "Could not decode JSON body",
      })
    );
  }



/*****************************validation */
  let {group,email} = JSON.parse(event.body)


  let emailItems = await databaseManager.queryTableByEmail(TABLE_NAME, email);

  if (emailItems.length != 0) {
    return sendResponse(
      404,
      JSON.stringify({
        message: `this email: ${email} already exist`,
      })
    );
  }


  if (group == "admin") {

    
    const validate =ajv.compile(authSchema)


    const valid=validate(data)
      if(!valid){
        return sendResponse(
          400,
          JSON.stringify({
            message: validate.errors,
          })
        );
      }

      //end validation

      let {
        email,
        group,
        responsableFullName,
        companyName,
        siretNumber,
        phone,
        fieldOfActivity,
        typeOfCompany,
        code
      } = JSON.parse(event.body)


      try {
        await cognito
          .adminAddUserToGroup({
            UserPoolId: process.env.USER_POOL_ID,
            Username: email,
            GroupName: group,
          })
          .promise();
    
        let {id ,createDate} = await saveUserInDb(
          email,
          group,
          responsableFullName,
          companyName,
          siretNumber,
          phone,
          fieldOfActivity,
          typeOfCompany
        );

        await checkingvalidPromo(code,id,createDate)
    
        let items = await databaseManager.queryTable(TABLE_NAME, id);
    
        return sendResponse(
          200,
          JSON.stringify(items[0])
        );
    
    
      } catch (err) {
        return sendResponse(
          500,
          JSON.stringify({
            message: err,
          })
        );
      }
  }


  if (group == "superAdmin") {

        
    const validate =ajv.compile(superAdminSchema)


    const valid=validate(data)
      if(!valid){
        return sendResponse(
          400,
          JSON.stringify({
            message: validate.errors,
          })
        );
      }

      //end validation

      let {email,group,fullName} = JSON.parse(event.body)



    let password = getrandomNumber();

    let params = {
      UserPoolId: process.env.USER_POOL_ID,
      Username: email,
      DesiredDeliveryMediums: ["EMAIL"],
  
      ForceAliasCreation: true,
      TemporaryPassword: password,
      UserAttributes: [
        {
          Name: "email",
          Value: email,
        },
      ],
    };
  

    let id;
    try {
      await cognito.adminCreateUser(params).promise();
      await cognito
        .adminAddUserToGroup({
          UserPoolId: process.env.USER_POOL_ID,
          Username: email,
          GroupName: group,
        })
        .promise();

       id =await saveSuperAdminInDb(
        email,
        group,
        fullName
      );


    } catch (err) {
      return sendResponse(
        500,
        JSON.stringify({
          message: err,
        })
      );
    }


   let items = await databaseManager.queryTable(TABLE_NAME, id);

    return sendResponse(
      200,
      JSON.stringify(items[0])
    );
  }




 
  if (group == "user") {
    const validate =ajv.compile(userauthSchema)

    const valid=validate(data)
      if(!valid){
        return sendResponse(
          400,
          JSON.stringify({
            message: validate.errors,
          })
        );
      }

      //end validation
      let {email,group,companyId,fullName,phone,queue,subQueue} = JSON.parse(event.body)


      let password = getrandomNumber();

      let params = {
        UserPoolId: process.env.USER_POOL_ID,
        Username: email,
        DesiredDeliveryMediums: ["EMAIL"],
    
        ForceAliasCreation: true,
        TemporaryPassword: password,
        UserAttributes: [
          {
            Name: "email",
            Value: email,
          },
        ],
      };
    
      try {

        await cognito.adminCreateUser(params).promise();

        await cognito
          .adminAddUserToGroup({
            UserPoolId: process.env.USER_POOL_ID,
            Username: email,
            GroupName: group,
          })
          .promise();
    
        let id = await usersaveUserInDb( email,group,companyId,fullName,phone,queue,subQueue);
    
        let items = await databaseManager.queryTable(TABLE_NAME, id);
    
        return sendResponse(
          200,
          JSON.stringify(items[0])
        );
    
    
      } catch (err) {
        return sendResponse(
          500,
          JSON.stringify({
            message: err,
          })
        );
      }
  }

  if (group == "commercial") {

    let {type} = JSON.parse(event.body)

 
     if(type == "company"){
    

      const validate =ajv.compile(commercialCompanyAuthSchema)

      const valid=validate(data)
        if(!valid){
          return sendResponse(
            400,
            JSON.stringify({
              message: validate.errors,
            })
          );
        }
  
        //end validation
        let {
          email,
          group,
          responsableFullName,
          companyName,
          siretNumber,
          phone,
          fieldOfActivity,
          typeOfCompany,
          type
        } = JSON.parse(event.body)  
  
        try {
  
  
          await cognito
            .adminAddUserToGroup({
              UserPoolId: process.env.USER_POOL_ID,
              Username: email,
              GroupName: group,
            })
            .promise();
      
            let {id ,createDate} = await saveCommercailUserComapnyInDb(
              email,
              group,
              responsableFullName,
              companyName,
              siretNumber,
              phone,
              fieldOfActivity,
              typeOfCompany,
              type
            )      




          let items = await databaseManager.queryTable(TABLE_NAME, id);
      
          return sendResponse(
            200,
            JSON.stringify(items[0])
          );
      
      
        } catch (err) {
          return sendResponse(
            500,
            JSON.stringify({
              message: err,
            })
          );
        }
    }

     if(type == "individual"){

      const validate =ajv.compile(commercialindivAuthSchema)

      const valid=validate(data)
        if(!valid){
          return sendResponse(
            400,
            JSON.stringify({
              message: validate.errors,
            })
          );
        }
  
        //end validation
        let {
          email,
          group,
          fullName,
          phone,
          type
        } = JSON.parse(event.body)  
  
        try {
    
          await cognito
            .adminAddUserToGroup({
              UserPoolId: process.env.USER_POOL_ID,
              Username: email,
              GroupName: group,
            })
            .promise();
      
            let {id ,createDate} = await saveCommercailUserIndivInDb(
              email,
              group,
              fullName,
              phone,
              type
            )      




          let items = await databaseManager.queryTable(TABLE_NAME, id);
      
          return sendResponse(
            200,
            JSON.stringify(items[0])
          );
      
      
        } catch (err) {
          return sendResponse(
            500,
            JSON.stringify({
              message: err,
            })
          );
        }

    }

    else  return sendResponse(
      400,
      JSON.stringify({
        message: "unsupported type",
      })
    ); 

  }

  else  return sendResponse(
    400,
    JSON.stringify({
      message: "unsupported group ",
    })
  ); 

};
/****************************************ajouter packfunction****************************************************/

const updatePack = async (event) => {
  const id = event.pathParameters.id;

  let {
    name,
    desc,
    prix,
    active
  } = JSON.parse(event.body);

  let items;

  try{
    items = await databaseManager.queryTable(TABLE_PACKS, id);
    if (items.length === 0) {
    return sendResponse(
      404,
      JSON.stringify({
        message: `item with this email : ${id} not found`,
      })
    );
  }

} catch (err) {
  return sendResponse(
    500,
    JSON.stringify({
      message: err,
    })
  );
}

await  databaseManager.updatePackCredential(TABLE_PACKS,items[0].id,items[0].created_date,name,desc,prix,active)
const data ={
  product_name : name, 
  description : desc, 
  new_price : prix, 
  active : active 
}

return await axios.put(`${config.api.invokeurl}/products/update/${items[0].product_id}`,data)
  .then((data) => {
    return databaseManager
    .setPackCredential(
      TABLE_PACKS,
      items[0].id,
      items[0].created_date,
      data.data.price_id,
      data.data.product_id
    )
    .then((response) => {

      return sendResponse(
        200,
        JSON.stringify(response)
      );
    });

  })
  .catch((err) => {
    return sendResponse(
      404,
      JSON.stringify({
        message: err,
      })
    ); 
  })

};



/****************************************ajouter packfunction****************************************************/

const gatAllPacks = async (event) => {

  let params = {
    TableName: TABLE_PACKS,

  };

  let scanResults = [];
  let items;
  do {
    items = await dynamo.scan(params).promise();
    items.Items.forEach((item) => scanResults.push(item));
    params.ExclusiveStartKey = items.LastEvaluatedKey;
  } while (typeof items.LastEvaluatedKey != "undefined");

  if (!scanResults) {
    return sendResponse(
      404,
      JSON.stringify({
        message: "empty table",
      })
    );
  }
  return sendResponse(200, JSON.stringify(scanResults));
};

/****************************************ajouter packfunction****************************************************/

const gatPackByid = async (event) => {

  const itemId = event.pathParameters.id;
  let items;

  try {
    items = await databaseManager.queryTable(TABLE_PACKS, itemId);

    if (items.length === 0) {
      return sendResponse(
        404,
        JSON.stringify({
          message: `pack with this id : ${itemId} not found`,
        })
      );
    }


  } catch (err) {
    return sendResponse(
      500,
      JSON.stringify({
        message: err,
      })
    );
  }

  return sendResponse(
    200,
    JSON.stringify(items[0])
  );
};





/****************************************delete user(cognito+DB) function****************************************************/

const deleteItem = async (event) => {
  const id = event.pathParameters.id;
  let items;
  items = await databaseManager.queryTable(TABLE_NAME, id);

  if (items.length === 0) {
    return sendResponse(
      404,
      JSON.stringify({
        message: `item with this id : "${id}" not found`,
      })
    );
  }

  const { created_date, email , clientId } = items[0];


  if(items[0].group == "commercial" || "user" ){


    try {
      await cognito
        .adminDeleteUser({
          UserPoolId: process.env.USER_POOL_ID,
          Username: email,
        })
        .promise();
  
      await databaseManager.deleteItem(TABLE_NAME, id, created_date);
  
  
    } catch (err) {
      return sendResponse(
        500,
        JSON.stringify({
          message: err,
        })
      );
    }
  
    return sendResponse(
      200,
      JSON.stringify({
        message: `successfully deleted user with this id :"${id}" `,
      })
    );

  }

  try {
    await cognito
      .adminDeleteUser({
        UserPoolId: process.env.USER_POOL_ID,
        Username: email,
      })
      .promise();

    await databaseManager.deleteItem(TABLE_NAME, id, created_date);

    await  deleteSubUser(clientId) 

  } catch (err) {
    return sendResponse(
      500,
      JSON.stringify({
        message: err,
      })
    );
  }

  return sendResponse(
    200,
    JSON.stringify({
      message: `successfully deleted user with this id :"${id}" `,
    })
  );



};


/****************************************delete user(cognito+DB) function****************************************************/

const deleteSubUser = async (clientId) => {

  return await axios.delete(`${config.api.invokeurl}/customers/${clientId}`)
  .then((data) => {
    return data.data.deleted;
    })


};

/**************************************** confirm user function ****************************************************/

const updateConfirmUser = async (event) => {
  let items;
  let { email } = JSON.parse(event.body);

  try{
  items = await databaseManager.queryTableByEmail(TABLE_NAME, email);
  if (items.length === 0) {
    return sendResponse(
      404,
      JSON.stringify({
        message: `item with this email : ${itemId} not found`,
      })
    );
  }

} catch (err) {
  return sendResponse(
    500,
    JSON.stringify({
      message: err,
    })
  );
}
  return databaseManager
    .updateconfirm(TABLE_NAME, items[0].id, items[0].created_date)
    .then((response) => {
      return sendResponse(
        200,
        JSON.stringify({
          message: `item with this email : ${email} is successfully confirmed`,
        })
      );
    });
};

/****************************************set cashBack amount function ****************************************************/

const CashBackSetter = async (event) => {
  const cash = event.pathParameters.id;



  return databaseManager
    .updateItemWithoutSort("config", "bonus", 'value',cash)
    .then((response) => {
      return sendResponse(
        200,
        JSON.stringify({
          message: `cashback become ${cash} successfully `,
        })
      );
    });
};


/****************************************bonus adder****************************************************/

const addBonus= async (id,params) => {

  let items;

  try{
    items = await databaseManager.queryTable(TABLE_NAME, id);
  if (items.length === 0) {
    return sendResponse(
      404,
      JSON.stringify({
        message: `item with this id : ${id} not found`,
      })
    );
  }

} catch (err) {
  return sendResponse(
    500,
    JSON.stringify({
      message: err,
    })
  );
}

let paramName ="bonusStatus"

  return databaseManager
    .updateItemList(TABLE_NAME, items[0].id, items[0].created_date, paramName, params)
    .then((response) => {
      return sendResponse(
        200,
        JSON.stringify(response)
      );
    });
};
/****************************************pay status adder****************************************************/

const addPay = async (id,params) => {

  let items;

  try{
    items = await databaseManager.queryTable(TABLE_NAME, id);
  if (items.length === 0) {
    return sendResponse(
      404,
      JSON.stringify({
        message: `item with this id : ${id} not found`,
      })
    );
  }

} catch (err) {
  return sendResponse(
    500,
    JSON.stringify({
      message: err,
    })
  );
}

let paramName ="payStatus"

  return databaseManager
    .updateItemList(TABLE_NAME, items[0].id, items[0].created_date, paramName, params)
    .then((response) => {
      return sendResponse(
        200,
        JSON.stringify(response)
      );
    });
};



/****************************************date checking validate****************************************************/

const checkingDate = async (event) => {
  let id = event.pathParameters.id;

  let items;

      try{
        items = await databaseManager.queryTable(TABLE_NAME, id);
      if (items.length === 0) {
        return sendResponse(
          404,
          JSON.stringify({
            message: `item with this id : ${id} not found`,
          })
        );
      }


    } catch (err) {
      return sendResponse(
        500,
        JSON.stringify({
          message: err,
        })
      );
    }

    if(items[0].packs == null){

      return sendResponse(
        200,
        JSON.stringify({message :"vous devez acheter une pack"})
        );
    }

  
    const dataNow = Date.now() / 1000;

    const dataEndPack= items[0].packs.expDate  ;


      if(dataNow < dataEndPack){
  
        return sendResponse(
          200,
          JSON.stringify({message :"valide"})
          );
      }


    return sendResponse(
      200,
      JSON.stringify({message :"invalide"})
      );




};

/**************************************** update user credential  function ****************************************************/

const updateCredentialUser = async (event) => {
  let items;
  let id = event.pathParameters.id;

  let {
    responsableFullName,
    companyName,
    phone

  } = JSON.parse(event.body);

  items = await databaseManager.queryTable(TABLE_NAME, id);

  if (items.length === 0) {
    return sendResponse(
      404,
      JSON.stringify({
        message: `item with this id : ${id} not found`,
      })
    );
  }

  return databaseManager
    .updateCredential(
      TABLE_NAME,
      items[0].id,
      items[0].created_date,
      responsableFullName,
      companyName,
      phone
    )
    .then((response) => {
      return sendResponse(
        200,
        JSON.stringify(response)
      );
    });
};

/**************************************** update user credential  function ****************************************************/

const updateCredentialSubUser = async (event) => {
  let items;
  let id = event.pathParameters.id;

  let {
    queue,
    subQueue,
    fullName,
    phone

  } = JSON.parse(event.body);

  items = await databaseManager.queryTable(TABLE_NAME, id);

  if (items.length === 0) {
    return sendResponse(
      404,
      JSON.stringify({
        message: `item with this id : ${id} not found`,
      })
    );
  }

  return databaseManager
    .updateSubUserCredential(
      TABLE_NAME,
      items[0].id,
      items[0].created_date,
      queue,
      subQueue,
      fullName,
      phone
    )
    .then((response) => {
      return sendResponse(
        200,
        JSON.stringify(response)
      );
    });
};


// /****************************************update address function ****************************************************/

const updateAdress = async (event) => {
  let items;
  let id = event.pathParameters.id;

  let {
    address,
    postalCode,
    city,
    country,
  } = JSON.parse(event.body);

  items = await databaseManager.queryTable(TABLE_NAME, id);

  if (items.length === 0) {
    return sendResponse(
      404,
      JSON.stringify({
        message: `item with this id : ${id} not found`,
      })
    );
  }

  let paramName ="address"
  let paramValue = {  
    address: address,
    postalCode: postalCode,
    city: city,
    country: country,
  };

  return databaseManager
  .updateItem(TABLE_NAME, items[0].id, items[0].created_date, paramName, paramValue)
  .then((response) => {
    return sendResponse(
      200,
      JSON.stringify(response)
    );
  })
};


// /****************************************update biling info function ****************************************************/

const updateBilingInfo = async (event) => {
  let items;
  let id = event.pathParameters.id;

  let {
    currency,
    country,
    holderFullName ,
    IBAN,
    bic,
  } = JSON.parse(event.body);

  items = await databaseManager.queryTable(TABLE_NAME, id);

  if (items.length === 0) {
    return sendResponse(
      404,
      JSON.stringify({
        message: `item with this id : ${id} not found`,
      })
    );
  }

  let paramName ="bilingInfo"
  let bilingId = await nanoid(10);

  let paramValue = [{  
    bilingId: bilingId,
    currency: currency,
    country: country,
    holderFullName: holderFullName,
    IBAN: IBAN,
    bic : bic,
  }];


  return databaseManager
  .updateItemList(TABLE_NAME, items[0].id, items[0].created_date, paramName, paramValue)
  .then((response) => {
    return sendResponse(
      200,
      JSON.stringify(response)
    );
  })
};



// /****************************************update daschbord function ****************************************************/

const getDashboardHistory = async (event) => {

  let id = event.pathParameters.id;

  let items = await databaseManager.queryTable(TABLE_NAME, id);

  if (items.length === 0) {
    return sendResponse(
      404,
      JSON.stringify({
        message: `item with this id : ${id} not found`,
      })
    );
  }

return await axios.get(`${config.api.invokeurl}/profile/invoices/${items[0].clientId}`)
.then((data) => {
  return sendResponse(
    200,
    JSON.stringify({
      url: data.data.url,
    })
  );


  })
.catch((err) => {

  return sendResponse(
    400,
    JSON.stringify(err)
  );
  });

};


// /****************************************update daschbord function ****************************************************/

const cancelSubscription = async (event) => {

  let id = event.pathParameters.id;

  let items = await databaseManager.queryTable(TABLE_NAME, id);

  if (items.length === 0) {
    return sendResponse(
      404,
      JSON.stringify({
        message: `item with this id : ${id} not found`,
      })
    );
  }

return await axios.get(`${config.api.invokeurl}/profile/cancel/${items[0].clientId}`)
.then((data) => {
  return sendResponse(
    200,
    JSON.stringify({
      url: data.data.url,
    })
  );


  })
.catch((err) => {

  return sendResponse(
    400,
    JSON.stringify(err)
  );
  });

};

// /****************************************update daschbord function ****************************************************/

const updatePayment = async (event) => {

  let id = event.pathParameters.id;

  let items = await databaseManager.queryTable(TABLE_NAME, id);

  if (items.length === 0) {
    return sendResponse(
      404,
      JSON.stringify({
        message: `item with this id : ${id} not found`,
      })
    );
  }

return await axios.get(`${config.api.invokeurl}/profile/payment/${items[0].clientId}`)
.then((data) => {
  return sendResponse(
    200,
    JSON.stringify({
      url: data.data.url,
    })
  );


  })
.catch((err) => {

  return sendResponse(
    400,
    JSON.stringify(err)
  );
  });

};

// /****************************************update daschbord function ****************************************************/

const subUpdate = async (event) => {

  let id = event.pathParameters.id;

  let items = await databaseManager.queryTable(TABLE_NAME, id);

  if (items.length === 0) {
    return sendResponse(
      404,
      JSON.stringify({
        message: `item with this id : ${id} not found`,
      })
    );
  }

return await axios.get(`${config.api.invokeurl}/profile/subscription/${items[0].clientId}`)
.then((data) => {
  return sendResponse(
    200,
    JSON.stringify({
      url: data.data.url,
    })
  );
  })
.catch((err) => {

  return sendResponse(
    400,
    JSON.stringify(err)
  );
  });


};


// /****************************************update daschbord function ****************************************************/

const createPromo = async (event) => {

  let {percent_off,name,code,label} = JSON.parse(event.body);
  let params1 ={
    percent_off : percent_off, 
    name : name, 
    code: code, 
    expires_at : "", 
    label: label , 
    active : true
  }


 return await axios.post(`${config.api.invokeurl}/promos/create`,params1)
.then((data) => {

  return sendResponse(
    200,
    JSON.stringify(data.data)
  );


  })
.catch((err) => {
  console.log(err)
  if(err.status == 400){

    return sendResponse(
      400,
      JSON.stringify({message :"code deja existant"})
    );

    
    }
    
    return sendResponse(
      400,
      JSON.stringify({message :"code deja existant ou quelque chose s'est mal passé"})
    );

  }

  );

};


// /****************************************update daschbord function ****************************************************/
// deactivatePromo
const activatePromo = async (event) => {

  let code = event.pathParameters.id;

 return await axios.put(`${config.api.invokeurl}/promos/activate/${code}`)
.then((data) => {

  return sendResponse(
    200,
    JSON.stringify(data.data)
  );


  })
.catch((err) => {
  console.log(err)
    return sendResponse(
      400,
      JSON.stringify({message :"code deja existant ou quelque chose s'est mal passé"})
    );

  }

  );

};
// /****************************************deactivate promo Code function ****************************************************/
const deactivatePromo = async (event) => {

  let code = event.pathParameters.id;

 return await axios.put(`${config.api.invokeurl}/promos/deactivate/${code}`)
.then((data) => {

  return sendResponse(
    200,
    JSON.stringify(data.data)
  );


  })
.catch((err) => {
  console.log(err)
    return sendResponse(
      400,
      JSON.stringify({message :"code deja existant ou quelque chose s'est mal passé"})
    );

  }

  );
}
// };

// /****************************************checkout Session function ****************************************************/


const checkoutSession = async (event) => {
  let items;
  let id = event.pathParameters.id;

  let {
    price_id,
  } = JSON.parse(event.body);

  items = await databaseManager.queryTable(TABLE_NAME, id);

  if (items.length === 0) {
    return sendResponse(
      404,
      JSON.stringify({
        message: `item with this id : ${id} not found`,
      })
    );
  }



  if (items[0].referralId ===""){

    if (items[0].promoCode != ""){  // promotion Code and no referralId


      const data = await axios.get(`${config.api.invokeurl}/promos/code/${items[0].promoCode}`)
        let code = data.data.id;
      
            let params1 ={
              price_id : price_id, 
              customer_id: items[0].clientId, 
              expires_at : "", 
              promotion_code: code || "", 
            }
          
          
          return  axios.post(`${config.api.invokeurl}/checkout/generate_session`,params1)
          .then((data) => {
          
          
            return sendResponse(
              200,
              JSON.stringify({
                url: data.data.url,
              })
            );
          
          
            })
          .catch((err) => {
          
            return sendResponse(
              400,
              JSON.stringify(err)
            );
            });

    }

    let params2 ={
      price_id : price_id, 
      customer_id: items[0].clientId, 
      expires_at : "", 
      promotion_code: "", 
    }
  
  
  return await axios.post(`${config.api.invokeurl}/checkout/generate_session`,params2)
  .then((data) => {
  
  
    return sendResponse(
      200,
      JSON.stringify({
        url: data.data.url,
      })
    );
  
  
    })
  .catch((err) => {
  
    return sendResponse(
      400,
      JSON.stringify(err)
    );
    });

  }

  if (items[0].promoCode !=""){  

    let params3 ={
      price_id : price_id, 
      customer_id: items[0].clientId, 
      expires_at : "", 
      promotion_code: "", 
    }
  
  
  return await axios.post(`${config.api.invokeurl}/checkout/generate_session`,params3)
  .then((data) => {
  
  
    return sendResponse(
      200,
      JSON.stringify({
        url: data.data.url,
      })
    );
  
  
    })
  .catch((err) => {
    return sendResponse(
      400,
      JSON.stringify(err)
    );
    });
  }


  let params ={
    price_id : price_id, 
    customer_id: items[0].clientId, 
    expires_at : "", 

  }


return await axios.post(`${config.api.invokeurl}/checkout/generate_session_affiliare`,params)
.then((data) => {


  return sendResponse(
    200,
    JSON.stringify({
      url: data.data.url,
    })
  );


  })
.catch((err) => {

  return sendResponse(
    400,
    JSON.stringify(err)
  );
  });


};

/********************************change status of restaurant(bloqued/unbloqued) function********************************************/

const restaurantBloquer = async (event) => {
  let items;
  const id = event.pathParameters.id;


  //adminId

  items = await databaseManager.queryTable(TABLE_NAME, id);

  if (items.length === 0) {
    return sendResponse(
      404,
      JSON.stringify({
        message: `item with this id : ${id} not found`,
      })
    );
  }


  let paramName ="isAuthorized"
  let paramValue = false


  return databaseManager
    .updateItem(TABLE_NAME, items[0].id, items[0].created_date, paramName, paramValue)
    .then((response) => {
      return sendResponse(
        200,
        JSON.stringify({
          message: `item with this id : ${id} is successfully updated`,
        })
      );
    });
};

const restaurantUnBloquer = async (event) => {
  let items;
  const id = event.pathParameters.id;

  //adminId

  items = await databaseManager.queryTable(TABLE_NAME, id);

  if (items.length === 0) {
    return sendResponse(
      404,
      JSON.stringify({
        message: `item with this id : ${id} not found`,
      })
    );
  }


  let paramName ="isAuthorized"
  let paramValue = true

  return databaseManager
    .updateItem(TABLE_NAME, items[0].id, items[0].created_date, paramName, paramValue )
    .then((response) => {
      return sendResponse(
        200,
        JSON.stringify({
          message: `item with this id : ${id} is successfully updated`,
        })
      );
    });
};



/***************************helpers******************************* */

function getrandomNumber() {
  var i;
  var result = "";
  var numberChars = "0123456789";
  var upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var lowerChars = "abcdefghijklmnopqrstuvwxyz";
  var specialChars = "!#$%&*-+";

  for (i = 0; i < 2; i++) {
    result += specialChars.charAt(
      Math.floor(Math.random() * specialChars.length)
    );
  }
  for (i = 0; i < 3; i++) {
    result += upperChars.charAt(Math.floor(Math.random() * upperChars.length));
  }
  for (i = 0; i < 2; i++) {
    result += numberChars.charAt(
      Math.floor(Math.random() * numberChars.length)
    );
  }
  for (i = 0; i < 3; i++) {
    result += lowerChars.charAt(Math.floor(Math.random() * lowerChars.length));
  }
  return result;
}


const getUid = async (companyName) => {


  let companyFirst =companyName.split(" ")[0];
  let companyUpper =companyFirst.toUpperCase();

  const data=  await databaseManager.upVoteUid();

    return `${companyUpper}-${data.uid}`

}


const getClientId = async (email,responsableFullName) => {
  let params ={
    "name" : responsableFullName, 
    "email" : email, 

  }

return axios.post(`${config.api.invokeurl}/customers/create`,params)
.then((data) => {
    return data.data.id
  });


}

async function saveUserInDb(
        email,
        group,
        responsableFullName,
        companyName,
        siretNumber,
        phone,
        fieldOfActivity,
        typeOfCompany
  
) {

  const now = new Date();

  let id = await getUid(companyName);
  let clientId = await getClientId(email,responsableFullName);


  let item = {
    id: id,
    email: email,
    group: group,
    responsableFullName: responsableFullName || "",
    companyName: companyName || "",
    siretNumber: siretNumber || "",
    clientId: clientId || "",
    phone: phone  || {},
    fieldOfActivity: fieldOfActivity || "",
    typeOfCompany: typeOfCompany || "",
    created_date: now.toISOString(),
    isVerified: false,
    isAuthorized: true,
    isPayed:false,
    updated_date: null,
    logo: {},
    menu: {},
    packs: null,
    beepscount: 0,
    referralId: "",
    promoCode: "",
    bonus:0,   //bonus an d referrals
    bonusStatus:[],
    payStatus:[],
    bilingInfo:[],
    queues:[]
  };

  try {
    const result = await databaseManager.saveItem(TABLE_NAME, item);
  } catch (err) {
    return sendResponse(
      500,
      JSON.stringify({
        message: err,
      })
    );
  }

  return {id : item.id, createDate : item.created_date};
}

async function saveCommercailUserComapnyInDb(
        email,
        group,
        responsableFullName,
        companyName,
        siretNumber,
        phone,
        fieldOfActivity,
        typeOfCompany,
        type
  
) {

  const now = new Date();

  let id = await getUid(companyName);

  let item = {
    id: id,
    email: email,
    group: group,
    responsableFullName: responsableFullName || "",
    companyName: companyName || "",
    siretNumber: siretNumber || "",
    phone: phone  || {},
    fieldOfActivity: fieldOfActivity || "",
    typeOfCompany: typeOfCompany || "",
    type: type || "",
    created_date: now.toISOString(),
    isVerified: false,
    isAuthorized: true,
    isPayed:false,
    updated_date: null,
    logo: {},
    menu: {},

    referralId: "",
    promoCode: "",
    bonus:0,   //bonus an d referrals
    bonusStatus:[],
    bilingInfo:[],

  };

  try {
    const result = await databaseManager.saveItem(TABLE_NAME, item);
  } catch (err) {
    return sendResponse(
      500,
      JSON.stringify({
        message: err,
      })
    );
  }

  return {id : item.id, createDate : item.created_date};
}


async function saveCommercailUserIndivInDb(
    email,
    group,
    fullName,
    phone,
    type
  
) {

  const now = new Date();

  let id = await getUid(fullName);


  let item = {
    id: id,
    email: email,
    group: group,
    fullName: fullName || "",
    phone: phone  || {},
    type: type || "",
    created_date: now.toISOString(),
    isVerified: false,
    isAuthorized: true,
    isPayed:false,
    updated_date: null,
    logo: {},
    menu: {},

    referralId: "",
    promoCode: "",
    bonus:0,   //bonus an d referrals
    bonusStatus:[],
    bilingInfo:[],
  };

  try {
    const result = await databaseManager.saveItem(TABLE_NAME, item);
  } catch (err) {
    return sendResponse(
      500,
      JSON.stringify({
        message: err,
      })
    );
  }

  return {id : item.id, createDate : item.created_date};
}




async function saveSuperAdminInDb(
  email,
  group,
  fullName
) {

  const now = new Date();

  let id = await getUid(fullName);


  let item = {
    id: id,
    email: email,
    group: group,
    fullName: fullName ,
    created_date: now.toISOString(),
    isVerified: false,
    isAuthorized: true,
    updated_date: null,
    logo: {},

  };

  try {
    const result = await databaseManager.saveItem(TABLE_NAME, item);
  } catch (err) {
    return sendResponse(
      500,
      JSON.stringify({
        message: err,
      })
    );
  }

  return item.id;
}

async function usersaveUserInDb(
  email,
  group,
  companyId,
  fullName,
  phone,
  queue,
  subQueue
) {

  const now = new Date();

  let id = await nanoid(10);


  let item = {
    id: id,
    email: email,
    group: group,
    companyId: companyId || "",
    fullName: fullName || "",
    phone: phone  || {},
    queue: queue || "",
    subQueue: subQueue || "",
    created_date: now.toISOString(),
    isVerified: false,
    isAuthorized: true,
    updated_date: null,
    logo: {},
    menu: {},
    beepscount: 0,
  };

  try {
    const result = await databaseManager.saveItem(TABLE_NAME, item);
  } catch (err) {
    return sendResponse(
      500,
      JSON.stringify({
        message: err,
      })
    );
  }

  return item.id;

}

function sendResponse(statusCode, message) {
  const response = {
    statusCode: statusCode,
    headers: {
      "Access-Control-Allow-Methods": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Origin": "*",
    },
    body: message,
  };
  return response;
}


/************************relamaction */
const addReclamation = async (event) => {


let { reason ,desc ,idUser} = JSON.parse(event.body);

let item = {
  id: await nanoid(10),
  reason:reason,
  desc:desc,
  idUser:idUser,
  created_date: now.toISOString(),
};

  try {
    await databaseManager.saveItem(RECLAMATION_TABLE, item);

    return sendResponse(
      200,
      JSON.stringify({
        message: "successfully submitted Reclamation",
      })
    );

  } catch (err) {
    return sendResponse(
      500,
      JSON.stringify({
        message: err,
      })
    );
  }

}
